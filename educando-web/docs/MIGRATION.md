# Staging, publicación y conservación de rutas

## Staging primero

La web de revisión se sirve sola desde `public/`. No necesita base de datos ni un nuevo backend. Propuesta inicial: reutilizar el servidor Caddy existente para servir archivos estáticos en un host de staging con autenticación, sin añadir un segundo servidor público ni ocupar puertos de otros proyectos.

`deploy/Caddyfile.stage.example` es un fragmento a adaptar y validar contra la versión instalada, no un reemplazo de la configuración existente. Mantener los demás hosts y rutas intactos. Copiar archivos a una carpeta propia, con permisos de lectura para el usuario de Caddy. Validar la configuración antes de recargarla y guardar backup de la actual.

El staging conserva noindex y robots de bloqueo. La autenticación es la barrera de acceso; robots no protege información privada. No incluir los archivos de documentación ni `automation/` dentro de la raíz pública.

## Antes de mover el hosting

Inventariar dominio y renovación por separado del plan de alojamiento, buzones, MX, TXT, SPF/DKIM/DMARC, DNS, www, subdominios, cron, PHP, Apps Script y otros backends. Confirmar backups y probar restauración. No cancelar el plan actual mientras estas dependencias sigan utilizándolo.

## Mapa propuesto, no aplicado

| URL vigente | Tratamiento candidato |
|---|---|
| `/` | Mantener con nueva home |
| `/pymes/` | Mantener con contenido de empresas |
| `/blog/` | Recuperar; revisar antiguos posts individualmente, no redirigirlos todos al inicio |
| `ia.educandoconchispa.com/` | Conservar durante revisión; posible 301 a `/formacion/` solo tras decisión SEO |
| `ia.educandoconchispa.com/sobre-mi.html` | Conservar durante revisión; posible 301 a `/sobre-mi/` |
| `ia.educandoconchispa.com/privacidad.html` | Conservar hasta adaptar y publicar documento legal equivalente |
| `/ruta-pergamino-3-culturas-Tarazona/*` | Conservar rutas exactas y QR |
| `/comarca/*` | Conservar y probar aparte |
| `/comarcatest/*` | Mantener prueba aparte, con restricciones tras inventario |
| WordPress privado | Copia privada independiente; confirmar aislamiento antes de cambiar hosting |

La carpeta IA dentro del ZIP no demuestra qué document root utiliza realmente ese host: comprobar configuración antes de trasladar.

## Publicación y rollback

1. Aprobar contenido, diseño y destino de alojamiento.
2. Copiar versión nueva a release independiente; verificar archivos y comparar con la versión revisada.
3. Adaptar contacto y legal; comprobar lectura y persistencia de consultas con datos de prueba autorizados.
4. Preparar assets, canonical y sitemap para las URLs finales. Retirar noindex solo de la versión aprobada; conservarlo en staging.
5. Si se migra, preparar DNS y certificados conservando correo y otros hosts. No cambiar nameservers por defecto.
6. Probar todas las rutas e integraciones contra el destino antes del cambio, incluidos PHP, juegos y QR.
7. Cambiar el destino web aprobado; observar accesos y fallos. No fusionar una migración de contenido y un cambio de registrador sin necesidad.
8. Si hay regresión, restaurar la configuración/versión previa o revertir el registro web; conservar ambos destinos durante la transición.
9. Cancelar o no renovar hosting solo tras confirmar independencia de todos sus servicios; mantener el dominio activo.

## Cierre verificable

Se puede declarar cerrado cuando existe staging aprobado, despliegue reproducible, copias y restauración comprobadas, contacto fiable, monitorización con aviso probado, responsable de mantenimiento y documentación de accesos con alcance limitado. Un VPS sigue necesitando actualizaciones y revisión.
