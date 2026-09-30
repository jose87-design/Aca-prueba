# Prueba en Hostinger

Paquete preparado: deploy/Hostinger_Web_Prueba.zip. Contiene solo el overlay público de prueba: web nueva, ruta original y dos recursos gráficos originales. No incluye .private, configuraciones, correo ni backups WordPress.

Crear un directorio/subdominio aislado para probar; no extraer encima de public_html de producción. Conservar íntegros el sitio actual y el subdominio ia.educandoconchispa.com.

El nuevo contacto ofrece acceso al formulario PDF original. Su backend no está incluido en el backup. fetch no-cors no permite confirmar que se ha entregado un correo. Pendiente: revisar Apps Script y realizar una solicitud controlada con el titular antes de dar entrega por válida.

Ruta original preservada. La URL pública existente sigue siendo https://educandoconchispa.com/ruta-pergamino-3-culturas-Tarazona/. No modificar el destino del QR impreso. Pendiente: escaneo del QR físico y recorrido completo en móvil. No se han enviado eventos de seguimiento de prueba.

El paquete stage mantiene noindex; no es la publicación final. El .htaccess actual tiene una redirección /blog/ a inicio que deberá revisarse al publicar el nuevo blog; el paquete no sobrescribe .htaccess. Comprobar DNS y certificado antes de publicación.

Para regenerar: python scripts/build.py; python scripts/check.py; python scripts/package_hostinger.py --backup /ruta/al/backup.zip. El backup nunca se añade al repositorio. --production cambia metadatos/robots solo para publicación final; requiere pruebas de las dos funciones prioritarias.
