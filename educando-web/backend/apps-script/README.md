# PDF automático: candidato no desplegado

`LeadMagnet.gs` sustituye el script compartido por el titular y conserva las nueve columnas: Fecha, Nombre, Email, Teléfono, Perfil, Mensaje, Consentimiento, Estado, Fecha_envío. No contiene IDs reales ni credenciales.

## Instalación controlada

1. Guardar una copia del código actual y mantener su despliegue vigente.
2. Crear un proyecto de prueba de Apps Script con este archivo y una hoja/PDF de prueba.
3. En Configuración del proyecto → Propiedades del script, configurar `SHEET_ID`, `SHEET_NAME`, `PDF_FILE_ID`, `OWNER_EMAIL`, `DRY_RUN=true` y `MAX_SENDS_PER_HOUR=20`. Para producción conservar los valores del script original, sin publicarlos en GitHub.
4. Adaptar y comprobar el formulario: debe enviar JSON con `consentimiento: true` solo cuando se marque la casilla, y `company: ""` como campo trampa. Los demás campos son nombre, email, teléfono (`telefono`), perfil y mensaje. El formulario antiguo debe revisarse antes de sustituir su backend.
5. Probar primero en modo seco. No escribe filas ni envía correo. Una prueba real con una dirección controlada exige `DRY_RUN=false`, permisos de Sheets/Drive/Mail y un despliegue de prueba.
6. Revisar el PDF recibido y las nueve columnas antes de actualizar el despliegue existente. El modo seco no verifica permisos, cuota ni acceso al PDF.

## Estados y límites

`ACEPTADO_ENVIO` significa que MailApp aceptó la llamada; no confirma entrega. `ENVIANDO`, `PENDIENTE` y `REVISION_ENVIO` bloquean reenvíos automáticos y exigen revisión manual. Los históricos `ENVIADO` también bloquean duplicados, pero el script antiguo podía marcarlos antes del envío: no son prueba de entrega.

El bloqueo protege solicitudes concurrentes. El presupuesto horario persistente limita intentos de envío; no verifica que quien solicita controle el email ni sustituye una protección antispam completa. El aviso interno se procesa por separado y su fallo no convierte el envío aceptado en un error.

Un `fetch` con `no-cors` devuelve una respuesta opaca: el frontend no puede anunciar éxito de procesamiento. No se ha implementado aquí un proxy ni desplegado este candidato.

Pruebas locales, sin llamadas a Google: `node --test tests/lead-magnet.test.cjs` desde educando-web.
