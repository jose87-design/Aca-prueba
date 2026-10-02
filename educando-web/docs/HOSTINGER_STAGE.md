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

Se requiere una copia del `.htaccess` activo. Las reglas activas de redirección que contienen `blog` bloquean el empaquetado hasta su revisión. El paquete no sustituye ese archivo. Producción se genera en un overlay separado con `index,follow`, sitemap y robots que permite rastreo. Generar el ZIP no autoriza ni realiza despliegue.
