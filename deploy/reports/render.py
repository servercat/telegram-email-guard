import json, sys, math
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
s=json.load(open(sys.argv[1],encoding='utf-8'))
W,H=1320,1200
im=Image.new('RGB',(W,H)); p=im.load()
for y in range(H):
 for x in range(W):
  a=(math.sin(x/W*3+y/H*2)+1)/2
  p[x,y]=(int(239-16*a),int(237-19*a),255)
d=ImageDraw.Draw(im)
font='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def text(x,y,t,size=30,color='#252452'):
 d.text((x,y),str(t),font=ImageFont.truetype(font,size),fill=color)
def card(box,fill='#FFFFFF',radius=42): d.rounded_rectangle(box,radius,fill=fill)
def tick(x,y,color):
 d.ellipse((x,y,x+74,y+74),fill=color);d.line([(x+20,y+38),(x+32,y+50),(x+56,y+24)],fill='white',width=9)
def date(v):return (datetime.fromisoformat(v.replace('Z','+00:00'))+timedelta(hours=8)).strftime('%m月%d日 %H:%M')
card((56,100,1264,1100))
# Shield, envelope and confirmation icon
points=[(126,175),(192,146),(258,175),(250,257),(192,298),(134,257)]
d.polygon(points,fill='#7164F8');card((157,193,226,242),'#FFFFFF',10);d.line([(160,200),(192,220),(223,200)],fill='#7164F8',width=4);tick(216,239,'#25C995')
text(310,150,'Email Guard',62);text(310,240,'每日数据报告',43,'#7370A7')
card((694,150,1220,221),'#EFEDFF',35);text(718,166,date(s['start'])+' – '+date(s['end']),23,'#605B99')
card((94,352,1226,626),'#EFEDFF');d.line((650,392,650,584),fill='#D5CFFF',width=2)
text(140,390,'新成员验证人数',38);text(140,444,s['total'],112);text(440,523,'人',40)
text(708,390,'通过率',38,'#4B438F');rate=f"{100*s['passed']/s['total']:.2f}" if s['total'] else '0.00';text(700,444,rate+'%',102,'#6650ED')
card((94,662,644,866),'#F6F5FE',30);card((674,662,1226,866),'#F6F5FE',30)
tick(128,704,'#26BC91');text(226,700,'验证通过并恢复发言',28);text(226,744,s['passed'],76,'#14A570')
d.ellipse((708,704,782,778),fill='#F57194');d.line((724,762,766,720),fill='white',width=9)
text(802,700,'未通过、已限制发言',28);text(802,744,s['restricted'],76)
pending=s['total']-s['passed']-s['restricted'];text(114,896,f'仍在验证 / 恢复权限中：{pending} 人',26,'#7770A4')
card((94,952,1226,1054),'#EFEDFF',28);text(124,975,'按 Telegram 用户去重 · 以机器人记录的入群验证会话为准',27,'#7973AD')
text(104,1061,'ASIA/SHANGHAI · 过去 24 小时 / LAST 24 HOURS',18,'#8F88BA')
im.save(sys.argv[2])
