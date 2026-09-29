# Validación de esta versión

## Ejecutado localmente

- Reconstrucción estática con Python, sin red ni dependencias externas.
- 12 documentos HTML comprobados: 10 páginas de contenido, página 404 y su copia de entrada.
- Enlaces y anclas locales, existencia de assets, un H1 por documento, IDs únicos y JSON-LD sintácticamente válido.
- JavaScript comprobado con `node --check`.
- Chromium: 10 rutas a anchuras de 1440, 390 y 320 px. Sin errores de ejecución ni respuestas HTTP locales de error. Sin desbordamiento horizontal tras corregir el perfil.
- Menú móvil, apertura/cierre y Escape.
- Preparación de borrador mailto con datos ficticios: no envío.
- Preferencia reduced-motion y contenido sin JavaScript.
- HTML sin Tailwind CDN, analítica ni reproductores externos. No se incluyen archivos `.private`, `.env` o configuraciones originales.
- Capturas completas de home escritorio, home móvil y empresas escritorio revisadas.

## Pendiente

- Validación de Caddy instalado, autenticación y cabeceras del servidor real.
- Integración/contacto actuales, persistencia y notificaciones reales.
- Importación y ejecución de los tres prototipos n8n en la versión del usuario.
- Auditoría de contraste automatizada/WCAG completa: revisión visual no equivale a conformidad certificada.
- Validación externa de resultados enriquecidos y datos de Search Console.
- Rendimiento en red móvil real y Core Web Vitals de usuarios. No se ofrece una puntuación Lighthouse inventada.
- Verificar aislamiento del WordPress, QR, APIs PHP, Apps Script y servicios de correo antes de una migración.

`qa-browser.json` registra los 31 casos básicos de navegación/responsividad. Los scripts de navegador usados localmente se encuentran fuera de la raíz pública y no son dependencia del sitio.
