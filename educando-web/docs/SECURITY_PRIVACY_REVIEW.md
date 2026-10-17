# Revisión de seguridad y privacidad · candidato de staging

Fecha de revisión: 17/10/2026  
Ámbito: `educando-web/` en la rama `codex/educando-web-review`.  
Estado: **apto para staging cuando el último CI esté verde; NO apto todavía para producción**.

## Controles implementados

### Secretos y superficie pública

- El navegador sólo conoce `/api/lead.php` y `/api/route-event.php`.
- Las URLs upstream de Apps Script y los tokens se configuran fuera del document root mediante `.chispa-leads.php` o `CHISPA_CONFIG_PATH`.
- `security_check.py` busca claves privadas, claves Google, claves estilo OpenAI, bearer tokens, despliegues reales de Apps Script dentro de la raíz pública y nombres de archivo sensibles.
- La CSP bloquea conexiones directas del navegador a Apps Script: `connect-src 'self'`.
- El empaquetador rechaza dotfiles, dumps, backups, claves y configuraciones no públicas dentro de `public/`.

### Captación de leads

- POST con límite de tamaño.
- Comprobación de origen cuando el navegador envía `Origin`.
- Honeypot.
- Consentimiento de privacidad obligatorio.
- Rate limiting temporal por origen de red. Se deriva un identificador HMAC; la IP no se escribe en claro en el contador.
- `request_id` e idempotencia para evitar duplicados en reintentos.
- Neutralización de fórmulas antes de escribir en Sheets.
- `LeadGateway.gs` exige un `INGRESS_TOKEN` que el navegador no conoce.
- La persistencia ocurre antes del aviso por email.
- Si el aviso falla, el lead permanece con estado `AVISO_PENDIENTE`.
- El Diagnóstico CHISPA candidato avisa al propietario también cuando el teléfono está vacío.

### Privacidad del funnel

- Los resultados del diagnóstico de empresa y del brief de experiencias no viajan en query string. Se transfieren temporalmente mediante `sessionStorage` de primera parte.
- El referrer persistido se reduce a origen + ruta; se eliminan query string y fragmento.
- La atribución de rama, CTA y UTM se conserva temporalmente en `sessionStorage`, sin meter contenido introducido por el usuario en la URL.
- El formulario general no concede permiso para marketing. Cualquier campaña futura necesitará un consentimiento separado.

### Pergamino de las Tres Culturas

- Se restauró la versión íntegra de la ruta después de detectar un parche que había truncado sus objetos `STOPS` y `UI`.
- `check_route.py` comprueba tamaño mínimo, presencia de datos/UI, endpoint mismo-origen, nombres de consentimiento y sintaxis del JavaScript embebido.
- El progreso local técnico funciona sin aceptar analítica.
- La analítica técnica es opcional, afirmativa y revocable.
- Cuando se autoriza, utiliza identificadores aleatorios de sesión/visita; no se presenta como anónima.
- La página no contiene la URL real del receptor de analítica.

### Servidor / Hostinger

Configuraciones candidatas de `.htaccess`:
- HTTPS.
- no listado de directorios.
- X-Content-Type-Options.
- Referrer-Policy.
- X-Frame-Options.
- Permissions-Policy.
- Cross-Origin-Opener-Policy.
- CSP.
- bloqueo de dotfiles y extensiones sensibles.
- HSTS sólo en el candidato de producción, no en staging.
- `X-Robots-Tag: noindex, nofollow` en staging.

Estas directivas deben comprobarse en el servidor real porque la compatibilidad final depende de la configuración Apache/LiteSpeed de Hostinger.

## Privacidad / legal

La política nueva aplica información por capas: resumen junto al formulario y detalle en `/privacidad/`. Describe categorías de datos, finalidades/bases, proveedores, transferencias, conservación, derechos, almacenamiento local y analítica opcional.

El aviso legal de staging tiene tres marcadores deliberados:
- `LEGAL_PENDING_LEGAL_FORM`
- `LEGAL_PENDING_NIF`
- `LEGAL_PENDING_ADDRESS`

`package_hostinger.py --production` aborta si cualquiera de estos marcadores continúa presente. No inventar estos datos.

## Riesgos residuales / decisiones conscientes

1. **CSP con `'unsafe-inline'` en scripts.** Se mantiene para preservar la ruta histórica, que contiene JavaScript embebido y datos inline. Es mejor que no tener CSP, pero no es el estado más estricto posible. Refactorizar toda la ruta a JS externo puede hacerse después de estabilizar staging.
2. **Google Fonts en la ruta preservada.** Produce una petición técnica a Google al cargar las tipografías. Está declarada en privacidad. Si se desea minimizar aún más terceros, sustituir posteriormente por fuentes del sistema o activos propios.
3. **Analítica histórica de la ruta.** Si se reutiliza el antiguo Web App de Apps Script, su URL ya fue pública y no debe tratarse como secreto ni como control de autenticación. El proxy nuevo limita el tráfico normal, pero no puede revocar una URL histórica. Para integridad fuerte, crear un receptor nuevo autenticado en una fase posterior.
4. **Rate limiting en hosting.** Es una barrera antiabuso razonable para un formulario de bajo volumen, no un WAF. Debe observarse en staging y ajustar límites si aparecen falsos positivos.
5. **Email.** `MailApp.sendEmail` aceptado no equivale a entrega final. Los estados reflejan aceptación/intento; no se promete una entrega SMTP certificada.
6. **Texto legal.** Es un borrador técnico orientado a cumplimiento, no sustituye asesoramiento jurídico individual. Producción permanece bloqueada hasta completar la identidad legal y revisar que proveedores/finalidades reales coinciden con el texto.

## Evidencias exigidas antes de producción

- backup verificable y rollback probado;
- staging HTTPS;
- último workflow `Chispa web review` verde;
- artefacto CI `chispa-hostinger-staging`;
- prueba E2E de lead sin teléfono: fila + aviso;
- prueba de reintento idempotente;
- inspección del navegador sin secretos;
- comprobación real de cabeceras;
- QA móvil/escritorio y ruta;
- identidad legal completada;
- autorización expresa del titular.
