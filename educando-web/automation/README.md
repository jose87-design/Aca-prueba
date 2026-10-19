# Automatización n8n · preparación sin activación

Tres JSON importables, desactivados, con disparador manual. No contienen credenciales ni envían comunicaciones. No se han importado ni ejecutado en tu instancia; validar compatibilidad con la versión instalada antes de activarlos.

1. `01-health-review.json`: consulta HTTP a la web pública y clasifica respuesta/error. No hace lecturas del servidor ni comprueba backups/disco/certificados en profundidad. Adaptar destinos para Campus/Studio y credenciales para staging; un 401 puede ser una protección correcta, no una caída.
2. `02-leads-review.json`: ejemplo ficticio y validación, sin persistencia ni envío. Distingue aceptación de información de privacidad y consentimiento de marketing. No es todavía un receptor de consultas públicas.
3. `03-editorial-review.json`: brief y estado needs_human_review. No llama a un modelo, no recupera chats ni publica.

## Para cerrar la automatización real

- Confirmar versión, acceso privado y credenciales de n8n. No publicar su puerto ni montar Docker socket en n8n.
- Health: añadir horario, destinos y señal de infraestructura recogida por un proceso limitado del servidor; evitar claves SSH de administración dentro del workflow. Añadir aviso al canal elegido por José, probar caída y recuperación, y deduplicar alertas con estado persistente.
- Consultas: mantener backend actual o acordar un endpoint servidor a servidor con validación, antispam, límites y respuesta después de guardar. Autenticar tráfico interno; no insertar un secreto de webhook en JavaScript público. Persistir con request_id único, luego encolar aviso. Una caída de n8n no debe perder consultas ni bloquear la aplicación.
- Editorial: usar brief, fuente y aprobación explícita; generar un borrador/PR y previsualizar. No acceder automáticamente a chats privados ni publicar datos de clientes. Reutilizar el flujo editorial ya existente si sigue disponible, evitando un segundo circuito equivalente.
- Campus/Studio: n8n recibe eventos autorizados después de que la aplicación guarde los cambios. Permisos, notas y publicación permanecen en el Campus. No interponer n8n en el envío principal de Studio.
- Definir retención y borrar datos de prueba. Reducir datos personales en ejecuciones; revisar también las ejecuciones fallidas y sus plazos de conservación.

Referencia oficial de webhook: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/ (autenticación y respuesta).
Referencia HTTP Request: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/.

Estado: prototipos de revisión, no automatización de producción cerrada.
