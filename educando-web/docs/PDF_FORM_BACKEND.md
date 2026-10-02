# Estado del formulario PDF

La fuente compartida en la conversación se ha revisado y hay un candidato en `backend/apps-script/LeadMagnet.gs`, con guía de instalación y pruebas simuladas. No se ha cambiado el endpoint ni enviado correos reales.

El candidato valida consentimiento booleano y honeypot, limita tamaño de campos, escapa HTML y neutraliza fórmulas en Sheets. Conserva las nueve columnas y diferencia aceptación de MailApp, persistencia en la hoja y aviso interno. Los envíos ambiguos requieren revisión manual, sin reintento automático.

Pendientes: comprobar el payload del formulario existente, configurar una prueba aislada en Google, probar permisos y recepción del PDF, y revisar con el titular antes de actualizar el despliegue. La web mantiene el enlace al formulario vigente. Una respuesta opaca de no-cors no confirma procesamiento ni entrega.
