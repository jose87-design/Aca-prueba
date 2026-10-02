import importlib.util, tempfile, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('pack',Path(__file__).resolve().parents[1]/'scripts/package_hostinger.py');pack=importlib.util.module_from_spec(spec);spec.loader.exec_module(pack)
class PackagingTest(unittest.TestCase):
 def test_stage(self):self.assertIn('noindex,nofollow',pack.indexed_html('<html><head></head></html>',False))
 def test_production(self):
  s=pack.indexed_html('<head><meta name="robots" content="noindex,nofollow"></head>',True);self.assertIn('index,follow',s);self.assertNotIn('noindex',s);self.assertEqual(s.count('name="robots"'),1)
 def test_production_requires_htaccess(self):
  with self.assertRaises(ValueError):pack.check_htaccess(None)
 def test_blog_redirect(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'rules';p.write_text('Redirect 301 /blog/ https://educandoconchispa.com/')
   with self.assertRaises(ValueError):pack.check_htaccess(p)
   p.write_text('# Redirect /blog/ disabled\nRewriteEngine On');pack.check_htaccess(p)
