# Work handoff · Hostinger staging de Educando con chIspA

## Objetivo

Llevar la rama `codex/educando-web-review` de `jose87-design/Aca-prueba` a un **staging aislado y verificable en Hostinger**, sin modificar producción y con rollback completo. PR de referencia: **#3**. La PR debe permanecer en borrador y no se fusiona durante este procedimiento.

## Estado que Work debe asumir

- La nueva web vive en `educando-web/`.
- El frontend general envía leads únicamente a `/api/lead.php`.
- La URL real de Apps Script y `INGRESS_TOKEN` nunca deben aparecer en JavaScript, HTML, GitHub ni dentro del document root.
- `LeadGateway.gs` guarda primero en Sheets y después intenta el aviso por email. n8n e IA no son parte del camino crítico.
- El Diagnóstico CHISPA educativo existente sigue en `ia.educandoconchispa.com`; no sustituirlo todavía. Su candidato `LeadMagnet.gs` ya corrige el aviso al propietario incluso sin teléfono, pero no se despliega sobre el flujo vivo sin staging específico.
- La ruta `/ruta-pergamino-3-culturas-Tarazona/` debe conservarse **en la misma URL exacta** para no romper el QR físico ya distribuido. Su progreso usa almacenamiento local técnico; la analítica del piloto es pseudonimizada/reducida, se informa únicamente dentro del juego y debe seguir escribiendo en la **Sheet existente** asociada a esa ruta. No crear una Sheet nueva para el Pergamino ni cambiar su receptor salvo que el existente esté roto.
- La política de privacidad nueva usa información por capas. El aviso legal contiene `LEGAL_PENDING` para NIF y domicilio/establecimiento profesional. El empaquetador bloquea producción mientras falten.
- La PR tiene controles de secretos, PHP, JS, tests de gateways, integridad de ruta, empaquetado y reproducibilidad. Usar sólo un artefacto `chispa-hostinger-staging` procedente del **último run verde** de GitHub Actions.

## Regla de seguridad y rollback

Antes de escribir en Hostinger:

1. Iniciar sesión mediante el navegador de Work; el usuario escribe sus credenciales directamente. Nunca pedir ni copiar contraseñas al chat.
2. Identificar el plan, dominio `educandoconchispa.com`, document root real, subdominios, WordPress u otras aplicaciones, bases de datos, tareas cron, versión PHP y configuración activa.
3. Hacer backup completo de la producción vigente, incluido `.htaccess`, archivos ocultos relevantes y cualquier base de datos asociada. Preferencia: backup fuera del document root + ZIP descargable/exportable.
4. Verificar que el backup es legible y registrar fecha, tamaño y listado/hash cuando sea posible. Guardar también una copia separada del `.htaccess` activo.
5. No subir el backup crudo de producción al repositorio público de GitHub: puede contener configuración, credenciales, logs o datos que no deben versionarse. Mantenerlo en almacenamiento privado de Hostinger o en una exportación privada controlada.
6. No borrar, mover, sobrescribir ni renombrar producción antes de demostrar que el backup permite rollback.

## Staging Hostinger

- Crear `prueba.educandoconchispa.com` (u otro subdominio inequívocamente de staging) con document root independiente.
- Activar HTTPS/SSL.
- Si Hostinger permite protección por contraseña para staging sin romper la prueba, activarla. En cualquier caso conservar `noindex,nofollow` y `robots.txt: Disallow: /`.
- Descargar desde GitHub Actions el artefacto `chispa-hostinger-staging` del último run verde de la PR #3. No usar un ZIP antiguo sólo porque esté en el repositorio.
- Extraer el ZIP en el document root de staging. `index.html` y `.htaccess` deben quedar en su raíz.
- Verificar PHP y extensión cURL. Los proxies son `/api/lead.php` y `/api/route-event.php`.
- Comprobar cabeceras: CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy, COOP y X-Robots-Tag de staging. No activar HSTS sobre un dominio que todavía no esté correctamente servido por HTTPS.

## Campus + Studio · producto propio

La web pública nueva presenta Campus + Studio como producto propio mediante `/plataforma/`.

Arquitectura que debe mantenerse:
- `educandoconchispa.com/plataforma/`: landing comercial, SEO y conversión;
- `campus.educandoconchispa.com`: aplicación Campus en el VPS;
- `studio.educandoconchispa.com`: aplicación Studio en el VPS;
- `ia.educandoconchispa.com`: IA educativa, Diagnóstico CHISPA y recursos.

No copiar Campus/Studio a Hostinger, no incrustarlos con iframe y no cambiar su infraestructura en este despliegue. Son enlaces externos desde la web pública y, por tanto, no deben formar parte de su carga inicial.

En staging verificar:
1. que `/plataforma/` carga y explica Campus + Studio;
2. que Home, Formación, Proyectos y Sobre mí enlazan a la landing;
3. que `campus.` y `studio.` resuelven al servicio esperado o a su autenticación correspondiente;
4. que `ia.` sigue operativo y conserva el Diagnóstico CHISPA;
5. que la pestaña Network de la Home no realiza fetch, iframe, preload ni carga de assets desde Campus/Studio;
6. si Campus o Studio no están disponibles, documentarlo como bloqueo de producto; no ocultarlo ni redirigirlo a otra cosa sin aprobación.

La promesa pública permitida es: Studio ayuda a preparar una propuesta, el docente la revisa y decide, el contenido llega al Campus como borrador editable y la publicación/gestión permanece bajo control docente. No prometer autopublicación por IA, generación ilimitada ni métricas de uso no verificadas.

## Google Sheets + Apps Script para leads

La nueva Sheet debe quedar en la cuenta/Drive de `educandoconchispa@gmail.com`. **No asumir acceso del agente a ese Drive.** José hará el setup de Google si es necesario; Work debe dejar todo preparado y pedir sólo esa intervención puntual.

Procedimiento mínimo para José:
1. En la cuenta `educandoconchispa@gmail.com`, crear un proyecto de Apps Script de staging y copiar **exactamente** `educando-web/backend/apps-script/LeadGateway.gs` desde la rama de la PR.
2. Ejecutar manualmente `setupLeadGateway()`. La función puede crear por sí sola el spreadsheet `Educando con chIspA · Leads`, la pestaña `Leads`, encabezados, `INGRESS_TOKEN`, `OWNER_EMAIL`, límite y `DRY_RUN=true`.
3. Revisar que la Sheet creada tenga 17 columnas y desplegar el script como Web App de staging ejecutándose con la cuenta propietaria y con acceso que permita al proxy de Hostinger realizar POST HTTPS.
4. **No pegar el token ni credenciales en el chat.** La URL del Web App y el token deben copiarse directamente al archivo privado de Hostinger situado fuera del document root, usando `educando-web/docs/lead-config.example.php.txt` como plantilla.

Una vez José haya hecho ese setup, Work debe continuar automáticamente con:
- prueba `DRY_RUN=true` sin escritura ni email;
- prueba E2E con `DRY_RUN=false` y lead ficticio **sin teléfono**;
- exactamente una fila y aviso interno;
- estado `AVISADO` cuando el correo funcione;
- reintento con el mismo `request_id` sin duplicar;
- comprobación del caso `AVISO_PENDIENTE` cuando sea posible simularlo con seguridad.

## Analítica de la web principal y de la ruta

**No instalar Google Analytics, Tag Manager ni otra analítica nueva en la web corporativa.** Para esta fase son suficientes Search Console, las métricas básicas ya disponibles y la atribución que se guarda únicamente cuando un lead envía el formulario.

El Pergamino es una excepción separada: tiene una analítica pseudonimizada/reducida ya operativa, una Sheet histórica asociada y un QR físico que apunta a la URL actual. Deben conservarse.

- El progreso local debe funcionar sin consentimiento de analítica.
- La analítica sólo puede enviarse después de pulsar “Permitir estadísticas técnicas”.
- El botón de opt-in sólo debe aparecer si `/api/route-event.php` confirma `status: ready`; sin upstream configurado la ruta debe indicar que no se envía analítica.
- La preferencia debe poder revocarse.
- El navegador sólo debe llamar a `/api/route-event.php`; no debe contener una URL real de Apps Script.
- Recuperar del backup/configuración vigente la URL del receptor actual de analítica del Pergamino y mantenerlo conectado a su **misma Sheet existente**. Guardar la URL sólo como `analytics_upstream` en el archivo privado del staging; no exponerla de nuevo en el HTML/JS.
- Verificar con un evento ficticio que el dato llega a la hoja histórica correcta y que no se introduce nombre, email, teléfono ni el texto libre de las respuestas.
- No cambiar la URL pública del juego. El QR existente debe seguir resolviendo exactamente a `/ruta-pergamino-3-culturas-Tarazona/`.
- Si por alguna limitación técnica no puede conectarse temporalmente en staging, el juego debe seguir funcionando y el opt-in quedar oculto; **esto no autoriza a crear una nueva Sheet o un nuevo receptor sin consultarlo**.

## QA obligatorio de staging

Probar con datos ficticios y documentar evidencia:

- Home y navegación: Educación, Empresas, Experiencias, Actualidad, Sobre mí, Contacto.
- Móvil aproximadamente 320–390 px y escritorio.
- Menú por teclado, Escape, foco visible y `prefers-reduced-motion`.
- Diagnóstico de empresa → resultado → Contacto, sin que el resumen aparezca en la URL.
- Brief de experiencia → Contacto, sin datos introducidos en query string.
- Formulario general: éxito, error, honeypot básico, consentimiento obligatorio, teléfono opcional y reintento idempotente.
- Confirmar que el navegador no recibe `INGRESS_TOKEN`, URL upstream, API keys, claves privadas ni otros secretos.
- Confirmar que referrer persistido no incluye query string ni fragmento.
- Política de privacidad y aviso legal accesibles.
- Ruta del Pergamino: 6 paradas, cambio ES/EN, progreso local, pistas, reinicio y consentimiento opcional de estadísticas.
- `ia.educandoconchispa.com` y cualquier aplicación viva existente siguen intactas.
- No hay errores PHP visibles ni listado de directorios.
- Revisar consola y red del navegador para errores 4xx/5xx relevantes.
- Revisar que CSP no bloquee recursos esenciales.

## Go / No-Go

**Staging puede declararse listo** sólo si backup verificado, CI verde, HTTPS, navegación, ruta y formulario E2E funcionan y no hay secretos públicos.

**Producción sigue NO-GO** aunque staging esté perfecto hasta:
- completar NIF y domicilio/establecimiento profesional del aviso legal;
- volver a generar el paquete de producción con el `.htaccess` activo revisado;
- realizar una última comparación staging/producción y tener rollback explícito;
- recibir autorización expresa de José para publicar.

No fusionar PR #3 ni sustituir `public_html` como parte de este encargo.

## Entrega que Work debe devolver

Entregar un informe corto pero verificable con: ubicación/fecha del backup, document roots identificados, URL de staging, run/commit exacto usado, hash del ZIP si está disponible, resultado de cada prueba crítica, Sheet/Apps Script creados sin revelar tokens, cabeceras verificadas, riesgos residuales, estado GO/NO-GO y **una sola sección final con las acciones humanas que sigan siendo imprescindibles**.
