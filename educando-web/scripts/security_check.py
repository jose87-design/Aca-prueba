#!/usr/bin/env python3
from pathlib import Path
import re, sys, json
ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
issues=[]
patterns={
 'private_key':re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),
 'google_api_key':re.compile(r'AIza[0-9A-Za-z_-]{20,}'),
 'openai_style_key':re.compile(r'\bsk-[A-Za-z0-9_-]{20,}'),
 'bearer_token':re.compile(r'Bearer\s+[A-Za-z0-9._~-]{24,}',re.I),
 'apps_script_deployment':re.compile(r'https://script\.google\.com/macros/s/[A-Za-z0-9_-]{20,}/exec'),
}
binary={'.jpg','.jpeg','.png','.webp','.zip','.ico','.pdf'}
for p in ROOT.rglob('*'):
 if not p.is_file() or p.suffix.lower() in binary: continue
 try:text=p.read_text(errors='ignore')
 except Exception:continue
 for name,rx in patterns.items():
  if name=='apps_script_deployment' and PUBLIC not in p.parents: continue
  if rx.search(text):issues.append(f'{p.relative_to(ROOT)}: possible {name}')
for p in ROOT.rglob('*'):
 if p.is_file() and (p.name in {'.env','.env.local','.env.production'} or p.suffix.lower() in {'.pem','.key','.p12','.pfx'}):
  issues.append(f'{p.relative_to(ROOT)}: sensitive filename must not be tracked')
autoload=[
 re.compile(r'<script[^>]+src=["\']https?://',re.I),
 re.compile(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']https?://',re.I),
 re.compile(r'<(?:img|iframe|source)[^>]+src=["\']https?://',re.I),
 re.compile(r'url\(\s*["\']?https?://',re.I),
]
for p in PUBLIC.rglob('*'):
 if not p.is_file() or p.suffix.lower() not in {'.html','.css','.js'}: continue
 text=p.read_text(errors='ignore')
 if any(rx.search(text) for rx in autoload):issues.append(f'{p.relative_to(ROOT)}: third_party_autoload')
cfg=(PUBLIC/'assets/lead-config.js').read_text()
if 'endpoint: "/api/lead.php"' not in cfg:issues.append('lead-config.js must use same-origin /api/lead.php')
site=(PUBLIC/'assets/site.js').read_text()
if "searchParams.set('summary'" in site or 'searchParams.set("summary"' in site:issues.append('site.js must not place user diagnostic summaries in URLs')
if 'referrer:document.referrer' in site:issues.append('site.js must strip referrer query/hash data before persistence')
if 'CONTACT_ATTR_KEY' not in site or 'sessionStorage.setItem(CONTACT_ATTR_KEY' not in site:issues.append('site.js must preserve privacy-safe first-party attribution between funnel pages')
for ht in [ROOT/'deploy/hostinger-stage.htaccess',ROOT/'deploy/hostinger-production.htaccess']:
 text=ht.read_text()
 for required in ['Content-Security-Policy','X-Content-Type-Options','Referrer-Policy','Permissions-Policy']:
  if required not in text:issues.append(f'{ht.name}: missing {required}')
 if 'connect-src \'self\';' not in text or 'connect-src \'self\' https://script.google.com' in text:issues.append(f'{ht.name}: browser CSP must not allow direct Apps Script connections')
print(json.dumps({'issues':issues},ensure_ascii=False,indent=2))
sys.exit(bool(issues))
