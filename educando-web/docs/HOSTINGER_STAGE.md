# Prueba en Hostinger

El paquete `deploy/Hostinger_Web_Prueba.zip` se construye exclusivamente desde `public/`, sin backup, credenciales ni backend. La ruta `/ruta-pergamino-3-culturas-Tarazona/` y su página informativa conservan el contenido público existente.

## Preparar la prueba

Ejecutar desde `educando-web/`:

```sh
python3 scripts/build.py
python3 scripts/check.py
python3 scripts/package_hostinger.py
```

Extraer únicamente en un directorio o subdominio aislado. Este proceso no despliega ni modifica el servidor. Staging incluye `noindex,nofollow` y robots con `Disallow: /`; el ZIP tiene orden, permisos y fechas estables.

Antes de publicar: comprobar HTTPS, escanear el QR físico, recorrer el juego en móvil y verificar una solicitud controlada del PDF. La web conserva el acceso al formulario en `https://ia.educandoconchispa.com/#contacto`; el script candidato no cambia ese formulario ni está desplegado.

## Preparar producción

```sh
python3 scripts/package_hostinger.py --production --htaccess /ruta/local/htaccess-activo
```

Se requiere una copia del `.htaccess` activo. Las reglas activas de redirección que contienen `blog` bloquean el empaquetado hasta su revisión. El paquete incluye una configuración candidata para su propio directorio. En producción conserva HTTPS y el dominio sin www, añade inicio y error 404, y retira la redirección de /blog/. No sobrescribir el archivo activo hasta validar staging y guardar copia. Producción se genera en un overlay separado con `index,follow`, sitemap y robots que permite rastreo. Generar el ZIP no autoriza ni realiza despliegue.

## Siguiente paso en hPanel

Crear el subdominio `prueba.educandoconchispa.com` con un directorio propio, por ejemplo `public_html/chispa-prueba`. No apuntarlo a la raíz actual. En su administrador de archivos, subir y extraer `Hostinger_Web_Prueba.zip`: `index.html` y `.htaccess` deben quedar directamente en ese directorio. Activar el SSL disponible para el subdominio y comprobar `https://prueba.educandoconchispa.com/`.

El ZIP de prueba incluye `.htaccess` con inicio HTML, página 404 y cabecera noindex. No impone el dominio de producción. No es control de acceso: la URL será accesible a quien la conozca.

Comprobar inicio, navegación, blog, vista móvil, ruta de Tarazona y acceso al formulario PDF. Las llamadas reales de correo y la activación del script siguen pendientes de prueba controlada.

La configuración activa compartida contiene HTTPS, dominio sin www y `Redirect 301 /blog/ https://educandoconchispa.com/`. Se ha revisado este contenido; la última regla debe retirarse únicamente al publicar el nuevo blog.
