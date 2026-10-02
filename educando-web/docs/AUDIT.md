# Auditoría y decisión de arquitectura

Fecha de inicio: 29/09/2026, Europe/Madrid. Fuente técnica: ZIP recibido. No equivale a auditoría del servidor en vivo.

| Acción | Evidencia | Propuesta |
|---|---|---|
| Mantener | Home presenta educación, pymes y territorio | Reforzar oferta transversal y conservar CHISPA |
| Mejorar | Pymes mezcla servicios y FPE; textos de resultados sin respaldo | Especificar problema, destinatario, entregable y mantenimiento |
| Integrar en revisión | Perfil y formación viven en subdominio IA | Crear páginas en dominio principal, sin redirigir aún el sitio actual |
| Recuperar blog | `.htaccess` contiene redirección de `/blog/` al inicio | Preparar blog y retirar esa regla solo cuando se publique la versión aprobada |
| Mejorar | Sitemap raíz solo tiene inicio y pymes | Candidato completo fuera del staging; fechas reales al publicar |
| Mantener y ampliar | FAQ educativo existente | Conservar sus preguntas, adaptar protección de datos y crear FAQ de empresas separado |
| Mejorar | Tailwind CDN y recursos externos | CSS/JS propios, fuentes del sistema y activos locales |
| Revisar | Formularios fetch a WEBAPP_URL, pymes usa no-cors | No declarar recibido un lead por una respuesta opaca; validar backend antes de migrar |
| Conservar aparte | Rutas, comarca, comarcatest con PHP y Apps Script | Inventario y pruebas independientes; no reemplazar sus carpetas |
| Revisar aislamiento | WordPress en `.private/`, Deny from all | No publicar ni borrar; comprobar servidor y guardar backup privado |

## Arquitectura candidata

Inicio → Formación, Empresas (URL `/pymes/`), Proyectos, Actualidad, Sobre mí y Contacto. Charlas dentro de Actualidad y footer. Formación incorpora contenido útil que se podrá consolidar si se aprueba la migración. La versión educativa actual sigue funcionando en su subdominio durante la revisión.

Se conserva `/pymes/` para reducir cambios de URLs. El repositorio incluye páginas nuevas `/formacion/`, `/sobre-mi/`, `/blog/`, `/charlas/`, `/proyectos/`, `/contacto/` y dos artículos. No se presume que mover un subdominio mejorará rankings por sí mismo.

## SEO/GEO

Prioridad: autoría clara, servicios específicos, contenido útil, enlaces internos, títulos, canónicas y metadatos. JSON-LD Person, Organization y tipos de página coherentes con el contenido. Las preguntas están en HTML visible; no se promete resultado enriquecido FAQ. No se añade llms.txt como requisito.

La guía oficial de Google indica que sus experiencias de IA mantienen las prácticas SEO habituales y no requieren archivos o marcado especial. No garantiza inclusión. Referencia: https://developers.google.com/search/docs/appearance/ai-features (consultada durante esta revisión).

Para migraciones: correspondencia por URL y revisión de enlaces/canónicas, según https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes.

## Límites

La home vigente no pudo recuperarse con el navegador de búsqueda; el ZIP es la evidencia técnica principal. Sin Search Console/analítica, no se conoce tráfico por URL, backlinks, indexación ni impacto de una migración. No se ha comprobado el aislamiento del WordPress ni se han enviado formularios reales.
