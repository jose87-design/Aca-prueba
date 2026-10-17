# Auditoría de seguridad y privacidad · 17/10/2026

## Estado

- Rama: `codex/educando-web-review`; producción no modificada.
- CI: build, check estructural, escaneo de secretos públicos, tests de LeadMagnet y LeadGateway, ZIP, JS y PHP.
- n8n/IA: fuera del camino crítico.
- Formulario: navegador → proxy mismo-origen Hostinger → Apps Script autenticado por token servidor → Sheet → aviso email.
- Persistencia antes del aviso: si el email falla, el lead queda `AVISO_PENDIENTE`.
- Endpoint real y token: fuera de `public_html` y del repositorio.

## Controles añadidos

- CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy y COOP.
- HSTS candidato sólo para producción.
- bloqueo de dotfiles, claves, dumps, backups y ZIP servidos accidentalmente.
- tamaño máximo de cuerpo, método POST, comprobación de origen y rate limit temporal en PHP.
- honeypot, validación y neutralización de fórmulas en Sheets.
- request_id para evitar duplicados.
- analítica del Pergamino separada del almacenamiento técnico; opt-in revocable.
- escaneo CI de private keys, API keys, bearer tokens y URLs de despliegue Apps Script en el front.

## Bloqueos antes de producción

1. Backup completo y verificable del hosting vigente.
2. Staging aislado con HTTPS y, preferiblemente, acceso restringido.
3. Crear/configurar la Sheet de leads y desplegar `LeadGateway.gs` con Script Properties.
4. Configurar fuera de public_html `.chispa-leads.php`.
5. Completar aviso legal: forma jurídica/condición profesional, NIF y domicilio o establecimiento profesional publicable.
6. Confirmar proveedor/cuenta exactos usados para Sheets/Apps Script y revisar sus contratos/DPA.
7. Prueba E2E: lead válido, honeypot, rate limit, aviso fallido, duplicado y rollback.
8. Revisar la analítica existente del Pergamino y, si se mantiene, confirmar retención y Sheet/receptor asociado.

## Riesgos residuales

- El endpoint de Apps Script histórico del Pergamino pudo haber sido público anteriormente; ocultarlo en la nueva versión no invalida URLs antiguas. Para blindaje total habría que actualizar también el receptor histórico para exigir token o reemplazarlo.
- Un honeypot y rate limiting reducen abuso, pero no sustituyen WAF/captcha adaptativo si aparece spam real.
- La política de privacidad es una implementación técnica/editorial revisada, no asesoramiento jurídico individual. El aviso legal está bloqueado hasta completar los datos obligatorios.
