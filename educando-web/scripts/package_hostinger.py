#!/usr/bin/env python3
"""Produce an overlay, never an entire hosting backup. Default is noindex stage."""
import argparse, hashlib, json, shutil, zipfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--backup',required=True);p.add_argument('--production',action='store_true');a=p.parse_args()
r=Path(__file__).resolve().parents[1];out=r/'deploy'/'hostinger-overlay';shutil.rmtree(out,ignore_errors=True);shutil.copytree(r/'public',out)
legacy=['ruta-pergamino-3-culturas-Tarazona/index.html','ruta-pergamino-3-culturas-Tarazona/info.html','logo.svg','favicon.svg'];hashes={}
with zipfile.ZipFile(a.backup) as z:
 for n in legacy:
  data=z.read(n);dest=out/n;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data);hashes[n]=hashlib.sha256(data).hexdigest()
if a.production:
 for f in (r/'public').rglob('*.html'):
  dest=out/f.relative_to(r/'public');dest.write_text(dest.read_text().replace('<meta name="robots" content="noindex,nofollow">','<meta name="robots" content="index,follow">'))
 (out/'sitemap.xml').write_bytes((r/'docs/sitemap.production-candidate.xml').read_bytes())
 (out/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://educandoconchispa.com/sitemap.xml\n')
else:
 # Add only crawl exclusion; do not alter legacy game scripts or paths.
 for n in legacy[:2]:
  f=out/n;f.write_text(f.read_text().replace('<head>','<head><meta name="robots" content="noindex,nofollow">',1))
for f in out.rglob('*'):
 if f.is_file() and ('.private' in f.parts or f.name.startswith('.env') or f.name in ['wp-config.php','config.json']):raise SystemExit('Forbidden file')
archive=r/'deploy'/('Hostinger_Web_Produccion.zip' if a.production else 'Hostinger_Web_Prueba.zip')
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for f in out.rglob('*'):
  if f.is_file():z.write(f,f.relative_to(out))
(r/'docs/hostinger-package-check.json').write_text(json.dumps({'production':a.production,'legacy_source_sha256':hashes,'files':sum(f.is_file() for f in out.rglob('*')),'zip_bytes':archive.stat().st_size},indent=2))
print(archive)
