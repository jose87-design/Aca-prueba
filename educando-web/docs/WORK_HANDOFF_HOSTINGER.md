# Work handoff · Hostinger staging de Educando con chIspA

## Objetivo

Llevar la rama `codex/educando-web-review` de `jose87-design/Aca-prueba` a un **staging aislado y verificable en Hostinger**, sin modificar producción y con rollback completo. PR de referencia: **#3**. La PR debe permanecer en borrador y no se fusiona durante este procedimiento.

## Estado que Work debe asumir

- La nueva web vive en `educando-web/`.
- El frontend general envía leads únicamente a `/api/lead.php`.
- La URL real de Apps Script y `INGRESS_TOKEN` nunca deben aparecer en JavaScript, HTML, GitHub ni dentro del document root.
- `LeadGateway.gs` guarda primero en Sheets y después intenta el aviso por email. n8n e IA no son parte del camino crítico.
- El Diagnóstico CHISPA educativo existente sigue en `ia.educandoconchispa.com`; no sustituirlo todavía. Su candidato `LeadMagnet.gs` ya corrige el aviso al propietario incluso sin teléfono, pero no se despliega sobre el flujo vivo sin staging específico.
- La ruta `/ruta-pergamino-3-culturas-Tarazona/` debe conservarse. Su progreso usa almacenamiento local técnico; la analítica del piloto es opcional y revocable.
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

## Google Sheets + Apps Script para leads

Hacerlo desde la cuenta Google correcta de Educando con chIspA. Si la cuenta no está autenticada, detenerse únicamente para que José inicie sesión en el navegador; no pedir contraseña.

1. Crear un proyecto de Apps Script de staging y copiar **exactamente** `educando-web/backend/apps-script/LeadGateway.gs` desde la rama de la PR.
2. Ejecutar manualmente `setupLeadGateway()`. La función puede crear por sí sola el spreadsheet `Educando con chIspA · Leads`, la pestaña `Leads`, encabezados, `INGRESS_TOKEN`, `OWNER_EMAIL`, límite y `DRY_RUN=true`. No crear otra estructura manual si esta función funciona.
3. Revisar la Sheet creada y confirmar las 17 columnas esperadas.
4. Desplegar el script como Web App de staging ejecutándose con la cuenta propietaria y con acceso que permita al proxy de Hostinger realizar POST HTTPS. Si la política de la cuenta impide un acceso apropiado, detenerse y explicar el bloqueo; no rebajar otros controles.
5. Guardar la URL del Web App y el token únicamente en un archivo privado de Hostinger situado **fuera de `public_html` / fuera del document root**. Usar como plantilla `educando-web/docs/lead-config.example.php.txt`. El archivo real debe ser `.chispa-leads.php` o una ruta configurada mediante `CHISPA_CONFIG_PATH`.
6. Primero probar con `DRY_RUN=true`: un POST ficticio debe validar pero no escribir ni enviar.
7. Para la prueba E2E de staging, cambiar sólo entonces a `DRY_RUN=false` y enviar un lead ficticio controlado **sin teléfono**. Debe aparecer exactamente una fila y llegar el aviso interno. Verificar estado `AVISADO`.
8. Reintentar la misma solicitud con el mismo `request_id` para comprobar idempotencia: no debe crear otra fila ni consumir otro slot de cuota.
9. Si el email interno falla pero la fila se guardó, el estado esperado es `AVISO_PENDIENTE`; el frontend debe decir que la consulta quedó registrada y el aviso interno está pendiente, nunca pedir un reenvío ciego.

## Analítica de la ruta

No es requisito para aprobar el staging de la web general. La ruta debe funcionar aunque la analítica no esté configurada.

- El progreso local debe funcionar sin consentimiento de analítica.
- La analítica sólo puede enviarse después de pulsar “Permitir estadísticas técnicas”.
- El botón de opt-in sólo debe aparecer si `/api/route-event.php` confirma `status: ready`; sin upstream configurado la ruta debe indicar que no se envía analítica.
- La preferencia debe poder revocarse.
- El navegador sólo debe llamar a `/api/route-event.php`; no debe contener una URL real de Apps Script.
- Si se conserva provisionalmente el receptor actual de analítica del piloto, recuperar su URL desde el backup de producción y guardarla sólo como `analytics_upstream` en el archivo privado. Tratar ese receptor histórico como integridad limitada porque su URL fue pública anteriormente; no considerarlo un secreto ni una barrera de autenticación.
- Si no se configura, comprobar que el opt-in queda oculto y que la ruta declara que no se envían estadísticas; registrar la analítica como pendiente no bloqueante.

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
