import json, pathlib, unittest, importlib.util
from PIL import Image
spec=importlib.util.spec_from_file_location('card',pathlib.Path(__file__).with_name('render.py'));card=importlib.util.module_from_spec(spec);spec.loader.exec_module(card)
base=dict(report_start='2026-11-17T14:40:00+08:00',report_end='2026-11-18T14:40:00+08:00')
out=pathlib.Path('/tmp/email-guard-design-review');out.mkdir(exist_ok=True)
class Tests(unittest.TestCase):
 def test_dynamic_images(self):
  for name,total,passed in [('sample',108,2),('zero',0,0),('three-digit',999,123),('four-digit',9999,2345)]:
   data=dict(base,total_users=total,passed_users=passed,restricted_users=total-passed)
   card.render_report(data,out/(name+'.png'))
   with Image.open(out/(name+'.png')) as im:self.assertEqual(im.size,(1280,1170));self.assertEqual(im.mode,'RGB')
 def test_validation(self):
  for counts in [dict(total_users=1,passed_users=2,restricted_users=0),dict(total_users=1.5,passed_users=0,restricted_users=0),dict(total_users=0,passed_users=0,restricted_users=0,pass_rate=1)]:
   with self.assertRaises(ValueError):card.normalize_report(dict(base,**counts))
 def test_timezone(self):
  a=card.normalize_report(dict(base,total_users=108,passed_users=2,restricted_users=106,pass_rate=1.85));self.assertEqual(a['total'],108)
if __name__=='__main__':unittest.main()
