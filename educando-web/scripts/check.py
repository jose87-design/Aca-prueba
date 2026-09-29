#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,sys
ROOT=Path(__file__).resolve().parents[1];PUBLIC=ROOT/'public';issues=[];pages={}
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.headings=0;self.robots=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='h1':self.headings+=1
  if tag=='meta' and a.get('name')=='robots' and a.get('content')=='noindex,nofollow':self.robots=True
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag in ['img','script'] and a.get('src'):self.links.append(a['src'])
  if tag=='link' and a.get('rel') in ['stylesheet','icon']:self.links.append(a.get('href',''))
for f in PUBLIC.rglob('*.html'):
 text=f.read_text();p=Parser();p.feed(text);pages[f.resolve()]=p
 if p.headings!=1:issues.append(f'{f}: H1 count {p.headings}')
 if len(p.ids)!=len(set(p.ids)):issues.append(f'{f}: duplicate IDs')
 if not p.robots:issues.append(f'{f}: staging noindex missing')
 for js in re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S):
  try:json.loads(js)
  except json.JSONDecodeError:issues.append(f'{f}: invalid JSON-LD')
 if 'cdn.tailwindcss.com' in text:issues.append(f'{f}: runtime Tailwind')
for f,p in pages.items():
 for link in p.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  target=(f.parent/unquote(u.path)).resolve() if u.path else f
  if target.is_dir():target=target/'index.html'
  if not target.is_relative_to(PUBLIC.resolve()) or not target.exists():issues.append(f'{f.name}: missing {link}')
  elif u.fragment and target in pages and u.fragment not in pages[target].ids:issues.append(f'{f}: missing anchor {link}')
for p in ROOT.rglob('*'):
 if p.name in ['.env','wp-config.php','config.json'] or '.private' in p.parts:issues.append(f'Forbidden file: {p}')
print(json.dumps({'pages_checked':len(pages),'issues':issues,'public_bytes':sum(f.stat().st_size for f in PUBLIC.rglob('*') if f.is_file())},ensure_ascii=False,indent=2))
sys.exit(bool(issues))
