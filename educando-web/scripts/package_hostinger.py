#!/usr/bin/env python3
"""Reproducible public overlay. No backup, secrets or server mutations."""
from pathlib import Path
import argparse, hashlib, json, re, shutil, zipfile
ROOT=Path(__file__).resolve().parents[1]
ROUTE='ruta-pergamino-3-culturas-Tarazona'
def indexed_html(text, production):
 text=re.sub(r'<meta\b(?=[^>]*\bname=[\"\x27]robots[\"\x27])[^>]*>', '', text, flags=re.I)
 return re.sub(r'<head\b[^>]*>',lambda m:m.group(0)+'<meta name="robots" content="'+('index,follow' if production else 'noindex,nofollow')+'">',text,count=1,flags=re.I)
def check_htaccess(path):
 if not path or not Path(path).is_file():raise ValueError('Producción requiere --htaccess con el archivo activo para revisión.')
 text=Path(path).read_text()
 rules=[l.strip() for l in text.splitlines() if l.strip() and not l.lstrip().startswith('#')]
 for line in rules:
  if re.search(r'\bRedirect(?:Match)?\b',line,re.I) and re.search(r'blog',line,re.I):raise ValueError('Revisar y retirar la redirección antigua de /blog/.')
  if re.search(r'\bRewriteRule\b',line,re.I) and re.search(r'blog',line,re.I):raise ValueError('Revisar la regla RewriteRule de /blog/.')
def package(production=False,htaccess=None):
 if production:check_htaccess(htaccess)
 src=ROOT/'public'
 for n in [ROUTE+'/index.html',ROUTE+'/info.html']:
  if not (src/n).is_file():raise ValueError('Falta la ruta preservada: '+n)
 for f in src.rglob('*'):
  if f.is_symlink():raise ValueError('No se admiten enlaces simbólicos.')
  if f.is_file() and (any(p.startswith('.') for p in f.relative_to(src).parts) or f.name.lower() in ['wp-config.php','config.json'] or f.suffix.lower() in ['.sql','.zip','.gz','.bak','.env']):raise ValueError('Archivo no público: '+str(f))
 out=ROOT/'deploy'/('hostinger-production-overlay' if production else 'hostinger-overlay')
 shutil.rmtree(out,ignore_errors=True);shutil.copytree(src,out)
 rules=ROOT/'deploy'/('hostinger-production.htaccess' if production else 'hostinger-stage.htaccess')
 (out/'.htaccess').write_bytes(rules.read_bytes())
 for f in out.rglob('*.html'):f.write_text(indexed_html(f.read_text(),production))
 if production:
  (out/'sitemap.xml').write_bytes((ROOT/'docs/sitemap.production-candidate.xml').read_bytes())
  (out/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://educandoconchispa.com/sitemap.xml\n')
 else:(out/'robots.txt').write_text('User-agent: *\nDisallow: /\n')
 archive=ROOT/'deploy'/('Hostinger_Web_Produccion.zip' if production else 'Hostinger_Web_Prueba.zip')
 with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
  for f in sorted(out.rglob('*')):
   if f.is_file():
    info=zipfile.ZipInfo(f.relative_to(out).as_posix(),(2026,1,1,0,0,0));info.create_system=3;info.external_attr=0o100644<<16;info.compress_type=zipfile.ZIP_DEFLATED;z.writestr(info,f.read_bytes())
 if not production:
  report={'production':False,'legacy_source_sha256':{n:hashlib.sha256((src/n).read_bytes()).hexdigest() for n in [ROUTE+'/index.html',ROUTE+'/info.html']},'zip_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'zip_bytes':archive.stat().st_size}
  (ROOT/'docs/hostinger-package-check.json').write_text(json.dumps(report,indent=2)+'\n')
 return archive
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--production',action='store_true');p.add_argument('--htaccess');a=p.parse_args()
 try:print(package(a.production,a.htaccess))
 except ValueError as e:p.error(str(e))
