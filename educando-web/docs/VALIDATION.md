# Validación del candidato de staging

Revisión: 17/10/2026 (UTC). Referencia inicial: commit `97790175ccfdd0ab4099d1ac8057634a22045b53`, workflow `Chispa web review` #109, correcto. El artefacto descargado se verificó contra su SHA-256 antes de probarlo. Esta revisión no publica producción ni fusiona la PR #3.

## Correcciones descubiertas por QA

- Los enlaces a Contacto generados por el diagnóstico de empresa y el brief cambiaban su destino, pero el listener conservaba la URL inicial. Esto sobrescribía la rama de atribución y perdía las UTM. El listener lee ahora el destino en el momento del clic. Dos pruebas de regresión ejecutan el JavaScript completo y comprueban rama, CTA, UTM, referrer reducido y resumen privado de un solo uso. Ambas fallan con la versión inicial y pasan con la corrección.
- En móvil, la navegación de respaldo sin JavaScript podía mostrarse antes de ejecutar el script diferido y contraerse después, desplazando la Home. Un bootstrap mínimo en el head activa la clase `js` antes de dibujarla; el respaldo sin JavaScript sigue funcionando. Al retrasar expresamente `site.js`, el desplazamiento de la Home pasa de 392,34 px a 0 px.

## Verificado localmente

- 17 documentos HTML: estructura, enlaces/anclas, assets, H1, IDs, JSON-LD e integridad de las seis paradas bilingües.
- Chromium: 51 casos de navegación a 1440, 390 y 320 px; sin desbordamiento horizontal, errores de ejecución, errores HTTP de contenido ni cargas externas automáticas. La consulta al proxy de analítica sin configurar devuelve 503 de forma deliberada.
- Ocho casos funcionales: menú por teclado, Escape/foco, reduced motion, diagnóstico → Contacto, brief → Contacto, consentimiento obligatorio, teléfono opcional, reintento con el mismo request_id, progreso/pistas/idiomas/reinicio del Pergamino y contenido sin JavaScript.
- Ninguna petición ni byte añadido por Campus o Studio en las cargas iniciales examinadas. La web sólo contiene enlaces a esas aplicaciones.
- Nueve casos HTTP contra los proxies PHP reales en un runtime local PHP 8.5 WebAssembly: métodos, tamaño, origen y fallo explícito `NOT_CONFIGURED`. Se comprobó sintaxis PHP y disponibilidad local de cURL y mbstring. Esto no acredita las extensiones del hosting.
- Pruebas de empaquetado, LeadGateway, LeadMagnet y atribución. Los controles de secretos y recursos externos no detectaron incidencias.
- El éxito del formulario y el consentimiento/revocación de analítica se probaron además con respuestas simuladas, sin conectar Google. **No son pruebas E2E de persistencia, email ni Sheet histórica.**
- Los archivos originales del Pergamino conservan sus hashes de la referencia inicial; no se cambian sus datos, URL ni receptor histórico.

## Lighthouse local, no Hostinger

Lighthouse 13.5.0, Chromium 153.0.8010.0, servidor de ensayo local. Una medición por página/perfil tras la corrección; no representa tráfico real ni latencia del hosting.

| Página/perfil | Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home móvil | 100 | 100 | 100 | 69 | 1,65 s | 0,0004 | 0 ms |
| Plataforma móvil | 100 | 100 | 100 | 69 | 1,09 s | 0 | 0 ms |
| Home escritorio | 100 | 100 | 100 | 69 | 0,40 s | 0 | 0 ms |
| Plataforma escritorio | 100 | 100 | 100 | 69 | 0,25 s | 0 | 0 ms |

El SEO está limitado deliberadamente por `noindex` y el bloqueo de rastreo de staging. No retirarlos para mejorar una puntuación. Antes de la corrección la Home móvil registró rendimiento 81 y CLS 0,422. Una puntuación automática de accesibilidad no certifica conformidad WCAG. No se dispone de Core Web Vitals de usuarios reales ni INP de campo.

## Servicios públicos observados en lectura

- Campus resuelve a su pantalla de acceso (`/login`). No se verificaron permisos ni cursos tras autenticación.
- Studio responde `{"error":"Abre Studio desde un curso de Campus."}` al acceso directo. El enlace público no constituye una entrada autónoma útil; registrar como bloqueo de producto y verificar el acceso desde un curso con una sesión autorizada. No cambiar la infraestructura ni redirigirlo sin decisión del titular.
- `ia.educandoconchispa.com` conserva su página, Diagnóstico CHISPA y formulario. No se envió una solicitud real ni se sustituyó su backend.
- La URL exacta `/ruta-pergamino-3-culturas-Tarazona/` carga la ruta pública con sus seis paradas. No se ha escaneado el QR físico ni verificado escritura en la Sheet histórica.

## Pendiente de Hostinger y Google

La sesión de revisión no pudo iniciar sesión en hPanel: Hostinger restringe el sign-in desde el navegador cloud disponible. No se han inventariado plan, document roots, bases de datos, cron ni configuración privada; no se ha generado backup ni creado/desplegado staging.

Faltan, en el servidor real: backup completo legible y rollback, HTTPS, aislamiento/protección del staging, PHP/cURL/mbstring, archivo privado fuera de todos los document roots, cabeceras/CSP y su compatibilidad con LiteSpeed/Apache, secretos, consola/red y Lighthouse. Las cabeceras del servidor de ensayo no son evidencia de Hostinger.

La Sheet general y el Web App requieren `setupLeadGateway()` desde `educandoconchispa@gmail.com`, sin asumir acceso del agente. Faltan modo seco real, una fila/aviso sin teléfono, reintento idempotente, estado `AVISADO` y simulación segura de `AVISO_PENDIENTE`. La analítica del Pergamino debe reutilizar la Sheet histórica; no se crea una nueva.

**STAGING: NO-GO** hasta cumplir el runbook en hosting real. **PRODUCCIÓN: NO-GO**; siguen pendientes identidad legal, paquete de producción revisado, comparación/rollback y autorización expresa.
