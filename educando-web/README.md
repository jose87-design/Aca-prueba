# Educando con chIspA · web de revisión

Web propia para formación, empresas, experiencias, actualidad, perfil y captación. Conserva identidad cyan/verde, incorpora segmentación por rama, diagnóstico de procesos, brief de proyectos, movimiento reducido y un formulario de leads con backend separado.

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

El contacto llama al proxy mismo-origen `/api/lead.php`, que valida, limita abuso y reenvía al Apps Script sólo desde servidor. La URL upstream y el token de ingreso deben vivir fuera de `public_html`. El gateway de Apps Script guarda antes de avisar por email. El Pergamino usa almacenamiento local técnico y analítica opcional separada; el navegador envía sus eventos a `/api/route-event.php`, no al Apps Script real. No hay IA ni n8n en el camino crítico.

Staging incluye una política de privacidad nueva y un aviso legal con bloqueo `LEGAL_PENDING`: el paquete de producción no puede generarse hasta completar NIF y domicilio o establecimiento profesional. No sustituir `public_html` hasta inventariar y copiar las aplicaciones/rutas que no estén incluidas.

Ver `docs/AUDIT.md`, `docs/WEBSITE_SOURCE_OF_TRUTH.md`, `WEB_UPDATE_RULES.md`, `docs/MIGRATION.md`, `docs/VALIDATION.md`, `docs/SECURITY_PRIVACY_REVIEW.md`, `docs/WORK_HANDOFF_HOSTINGER.md` y `automation/README.md`.
