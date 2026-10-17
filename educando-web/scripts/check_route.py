#!/usr/bin/env python3
from pathlib import Path
import re, subprocess, tempfile, sys

ROOT=Path(__file__).resolve().parents[1]
PAGE=ROOT/'public/ruta-pergamino-3-culturas-Tarazona/index.html'
text=PAGE.read_text(errors='strict')
issues=[]

required=[
    'const STOPS =',
    'const UI =',
    'const ANALYTICS_ENDPOINT = "/api/route-event.php";',
    'const ANALYTICS_CONSENT_KEY =',
    'const ANALYTICS_CONSENT_VERSION =',
    'function hasAnalyticsConsent()',
    'function acceptAnalytics()',
    'function rejectAnalytics()',
    'function refreshAnalyticsAvailability()',
    'privacyPanelUnavailable',
    'ANALYTICS_AVAILABLE',
    'if (!hasAnalyticsConsent()) return;',
]
for token in required:
    if token not in text: issues.append('missing '+token)
for forbidden in ['ANALYTICS_ANALYTICS','hasPrivacyConsent','script.google.com/macros/s/','mode: "no-cors"']:
    if forbidden in text: issues.append('forbidden '+forbidden)

if len(text) < 180000:
    issues.append('route unexpectedly truncated')
for stop_id in range(1,7):
    if text.count(f'{{ id:{stop_id},') < 2:
        issues.append(f'bilingual route stop {stop_id} missing')
if text.count('<script>') != 1 or text.count('</script>') != 1:
    issues.append('expected exactly one inline script')

match=re.search(r'<script>([\s\S]*?)</script>',text)
if match:
    with tempfile.NamedTemporaryFile('w',suffix='.js',delete=False,encoding='utf-8') as fh:
        fh.write(match.group(1)); name=fh.name
    p=subprocess.run(['node','--check',name],capture_output=True,text=True)
    Path(name).unlink(missing_ok=True)
    if p.returncode: issues.append('route JS syntax: '+(p.stderr.strip() or p.stdout.strip()))

print({'route_bytes':len(text),'issues':issues})
sys.exit(bool(issues))
