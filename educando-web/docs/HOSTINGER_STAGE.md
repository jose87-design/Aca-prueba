# Prueba en Hostinger

El paquete `deploy/Hostinger_Web_Prueba.zip` se construye desde `public/` e incluye los proxies PHP públicos, pero nunca sus secretos. La ruta `/ruta-pergamino-3-culturas-Tarazona/` y su página informativa se conservan. Antes de cualquier escritura en el hosting, crear una copia completa y verificable de la producción vigente.

## Preparar la prueba

Ejecutar desde `educando-web/`:

```sh
python3 scripts/build.py
python3 scripts/check.py
python3 scripts/package_hostinger.py
```

Extraer únicamente en un directorio o subdominio aislado. Este proceso no despliega ni modifica el servidor. Staging incluye `noindex,nofollow` y robots con `Disallow: /`; el ZIP tiene orden, permisos y fechas estables.

Antes de publicar: comprobar HTTPS, PHP/cURL, cabeceras de seguridad, QR físico, ruta en móvil, formulario general y solicitud controlada del Diagnóstico CHISPA. El recurso educativo sigue en `https://ia.educandoconchispa.com/#contacto` hasta migrarlo de forma explícita.

## Preparar producción

```sh
python3 scripts/package_hostinger.py --production --htaccess /ruta/local/htaccess-activo
```

Se requiere una copia del `.htaccess` activo. Las reglas activas de redirección que contienen `blog` bloquean el empaquetado hasta su revisión. El paquete incluye una configuración candidata para su propio directorio. En producción conserva HTTPS y el dominio sin www, añade inicio y error 404, y retira la redirección de /blog/. No sobrescribir el archivo activo hasta validar staging y guardar copia. Producción se genera en un overlay separado con `index,follow`, sitemap y robots que permite rastreo. Generar el ZIP no autoriza ni realiza despliegue.

## Backup obligatorio antes de staging o producción

1. Inventariar el document root real de `educandoconchispa.com`, subdominios y carpetas auxiliares.
2. Crear una copia completa de archivos y configuración activa (`.htaccess` incluido) en una carpeta de backup con fecha, fuera del document root si es posible.
3. Si existen bases de datos o WordPress asociados, exportarlos aparte; una copia sólo de HTML no es rollback suficiente.
4. Registrar tamaño/hash o, al menos, listado y fecha de la copia. No modificar producción hasta comprobar que la copia es legible.
5. Staging debe usar un document root independiente.

## Configuración privada del proxy

En Apps Script, ejecutar primero `setupLeadGateway()` para crear/reutilizar la Sheet, preparar encabezados y generar el token en modo seco. Después crear fuera de `public_html` un archivo `.chispa-leads.php` basado en `docs/lead-config.example.php.txt`. Debe contener la URL real de Apps Script y un token aleatorio largo. En Apps Script, el mismo token se guarda como Script Property `INGRESS_TOKEN`; nunca se copia a JavaScript público.

El proxy de leads requiere PHP con cURL. Si falla la configuración devuelve `NOT_CONFIGURED` y no finge que el lead fue guardado. La analítica opcional del Pergamino usa un segundo upstream guardado en el mismo archivo privado.

## Siguiente paso en hPanel

Crear el subdominio `prueba.educandoconchispa.com` con un directorio propio, por ejemplo `public_html/chispa-prueba`. No apuntarlo a la raíz actual. En su administrador de archivos, subir y extraer `Hostinger_Web_Prueba.zip`: `index.html` y `.htaccess` deben quedar directamente en ese directorio. Activar el SSL disponible para el subdominio y comprobar `https://prueba.educandoconchispa.com/`.

El ZIP de prueba incluye `.htaccess` con inicio HTML, página 404 y cabecera noindex. No impone el dominio de producción. No es control de acceso: la URL será accesible a quien la conozca.

Comprobar inicio, navegación, blog, vista móvil, ruta de Tarazona y acceso al formulario PDF. Las llamadas reales de persistencia/correo siguen pendientes de una prueba controlada con una Sheet de staging o una hoja dedicada y el Apps Script desplegado.

La configuración activa compartida contiene HTTPS, dominio sin www y `Redirect 301 /blog/ https://educandoconchispa.com/`. Se ha revisado este contenido; la última regla debe retirarse únicamente al publicar el nuevo blog.
