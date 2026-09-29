# Educando con chIspA · web de revisión

Web estática propia: formación, empresas, proyectos, actualidad, perfil y contacto. Conserva identidad cyan/verde, incorpora scroll progresivo, titulares dinámicos y pausa de movimiento. No precisa Node ni base de datos para servirla.

## Revisar

Abrir `public/index.html` en el navegador o servir `public/` con un servidor HTTP. Los enlaces relativos incluyen `index.html`, por lo que también funcionan desde una copia descargada.

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory public
```

## Generar y comprobar

```bash
python3 scripts/build.py
```

```bash
python3 scripts/check.py
```

`build.py` es la fuente de las páginas. CSS/JS y activos están en `public/assets/`. No editar solo el HTML generado, porque se sobrescribe al reconstruir.

## Estado

Versión de revisión, **no producción**. Todas las páginas tienen `noindex,nofollow`; robots bloquea el rastreo. El staging necesita además acceso privado o autenticación. `docs/sitemap.production-candidate.xml` está fuera del directorio público.

El contacto solo prepara un correo local. No se han migrado ni probado los formularios de la versión vigente. No hay cookies, analítica, reproductores externos, peticiones a modelos de IA ni scripts de terceros en la web nueva.

La página IA original, privacidad y experiencias existentes siguen en su destino actual. No subir este directorio para sustituir todo `public_html`: se perderían aplicaciones que aquí no se incluyen.

Ver `docs/AUDIT.md`, `docs/WEBSITE_SOURCE_OF_TRUTH.md`, `WEB_UPDATE_RULES.md`, `docs/MIGRATION.md`, `docs/VALIDATION.md` y `automation/README.md`.
