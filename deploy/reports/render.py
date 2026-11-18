"""Deterministic, supersampled daily-report artwork. No reference bitmap reuse."""
import json, sys, math
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from PIL import Image, ImageDraw, ImageFont, ImageFilter
def normalize_report(raw):
 def count(name,legacy):
  value=raw.get(name,raw.get(legacy))
  if isinstance(value,bool) or not isinstance(value,int) or value<0: raise ValueError(name+' must be a nonnegative integer')
  return value
 total=count('total_users','total');passed=count('passed_users','passed');restricted=count('restricted_users','restricted')
 if passed+restricted>total: raise ValueError('Category counts exceed total')
 rate=round(100*passed/total,2) if total else 0.0
 if 'pass_rate' in raw and abs(float(str(raw['pass_rate']).rstrip('%'))-rate)>0.005: raise ValueError('Inconsistent pass_rate')
 start=raw.get('report_start',raw.get('start'));end=raw.get('report_end',raw.get('end'))
 for value in [start,end]:
  dt=datetime.fromisoformat(value.replace('Z','+00:00'))
  if dt.tzinfo is None: raise ValueError('Timezone offset is required')
 return dict(total=total,passed=passed,restricted=restricted,start=start,end=end)

def render_report(raw,output):
 s=normalize_report(raw)
 _draw_report(s,output)

def _draw_report(s,output):
 W,H,S=1320,1200,2
 im=Image.new('RGB',(W*S,H*S)); bg=Image.new('RGB',(W,H));px=bg.load()
 for y in range(H):
  for x in range(W):
   a=(math.sin(x/W*3+y/H*2)+1)/2
   px[x,y]=(int(246-18*a),int(244-20*a),255)
 im=bg.resize((W*S,H*S));d=ImageDraw.Draw(im)
 # Low-contrast abstract arcs in the background.
 d.ellipse((850*S,-410*S,1450*S,440*S),fill='#DDD8FF')
 d.ellipse((810*S,-410*S,1330*S,290*S),fill='#E9E5FF')
 regular='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
 bold='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
 def font(size,heavy=True):return ImageFont.truetype(bold if heavy else regular,round(size*S),index=2)
 def text(x,y,t,size=30,color='#252452',heavy=True):
  # One Chinese face, fixed top anchor and no mixed-font baseline fallback.
  d.text((x*S,y*S),str(t),font=font(size,heavy),fill=color,anchor='lt')
 def width(t,size,heavy=True):return d.textlength(str(t),font=font(size,heavy))/S
 def card(box,fill='#FFFFFF',radius=42,outline=None):d.rounded_rectangle(tuple(int(v*S) for v in box),radius*S,fill=fill,outline=outline,width=2*S)
 def gradient_card(box,top,bottom,radius=42):
  layer=Image.new('RGBA',im.size);ld=ImageDraw.Draw(layer)
  from PIL import ImageColor
  a=ImageColor.getrgb(top);b=ImageColor.getrgb(bottom)
  x1,y1,x2,y2=[int(v*S) for v in box]
  for yy in range(y1,y2+1):
   t=(yy-y1)/max(1,y2-y1);c=tuple(round(a[i]*(1-t)+b[i]*t) for i in range(3))
   ld.line((x1,yy,x2,yy),fill=c,width=1)
  mask=Image.new('L',im.size);ImageDraw.Draw(mask).rounded_rectangle((x1,y1,x2,y2),radius*S,fill=255)
  im.alpha_composite(Image.composite(layer,Image.new('RGBA',im.size),mask))
 def line(points,fill,width=2):d.line([(x*S,y*S) for x,y in points],fill=fill,width=width*S)
 def ellipse(box,fill):d.ellipse(tuple(int(v*S) for v in box),fill=fill)
 def poly(points,fill):d.polygon([(int(x*S),int(y*S)) for x,y in points],fill=fill)
 def tick(x,y,color,r=74):
  ellipse((x,y,x+r,y+r),color);ellipse((x+7,y+5,x+r-7,y+r-9),color);line([(x+r*.27,y+r*.51),(x+r*.44,y+r*.67),(x+r*.76,y+r*.32)],'white',9)
 def date(v):return datetime.fromisoformat(v.replace('Z','+00:00')).astimezone(ZoneInfo('Asia/Shanghai')).strftime('%m月%d日 %H:%M')
 # Soft card shadow and pale architectural waves.
 shadow=Image.new('RGBA',im.size);sd=ImageDraw.Draw(shadow);sd.rounded_rectangle((62*S,116*S,1258*S,1101*S),58*S,fill=(93,72,181,40));shadow=shadow.filter(ImageFilter.GaussianBlur(22*S));im=Image.alpha_composite(im.convert('RGBA'),shadow);d=ImageDraw.Draw(im)
 card((60,104,1260,1090),'#FFFFFF',56)
 gradient_card((94,342,1226,616),'#F2F0FF','#E3DFFF',42)
 # clipped decorative gradients inside panels
 layer=Image.new('RGBA',im.size);ld=ImageDraw.Draw(layer)
 ld.polygon([(800*S,616*S),(1226*S,480*S),(1226*S,616*S)],fill='#D4CEFF')
 mask=Image.new('L',im.size);ImageDraw.Draw(mask).rounded_rectangle((94*S,342*S,1226*S,616*S),42*S,fill=255);layer.putalpha(Image.eval(layer.getchannel('A'),lambda p:p));im.alpha_composite(Image.composite(layer,Image.new('RGBA',im.size),mask));d=ImageDraw.Draw(im)
 # Layered shield and envelope.
 poly([(126,174),(194,146),(264,174),(258,254),(235,285),(194,310),(152,282),(130,250)],'#B9B2FF')
 poly([(138,180),(194,159),(251,181),(246,248),(226,275),(194,294),(160,271),(142,244)],'#7564F6')
 poly([(194,159),(251,181),(246,248),(226,275),(194,294)],'#6151EF')
 card((158,196,229,248),'#FFFFFF',11);line([(164,207),(194,226),(222,207)],'#7564F6',4);tick(218,232,'#21C99A',66)
 text(310,171,'Email Guard',57);text(310,246,'每日数据报告',42,'#7670A6')
 card((694,153,1226,237),'#EFEDFF',42)
 card((729,181,758,213),'#7964EF',4);card((733,189,754,209),'#EFEDFF',1);line([(736,178),(736,186)],'#7964EF',4);line([(751,178),(751,186)],'#7964EF',4)
 period=date(s['start'])+' – '+date(s['end']);size=25
 while width(period,size)>428:size-=1
 text(783,182,period,size,'#625B9E')
 line([(650,390),(650,573)],'#D0C9FF',2)
 text(143,395,'新成员进群人数',38);text(713,395,'通过率',38,'#4A438C')
 value=str(s['total']);size=120
 while width(value,size)>260:size-=1
 text(140,468,value,size);text(140+width(value,size)+12,535,'人',42)
 rate=f"{100*s['passed']/s['total']:.2f}" if s['total'] else '0.00';size=118
 while width(rate+'%',size)>385:size-=1
 text(705,468,rate+'%',size,'#6347F3')
 # Group silhouette.
 for x,y,r in [(478,487,15),(516,475,20),(558,487,15)]:ellipse((x,y,x+2*r,y+2*r),'#ADA1FF')
 card((466,519,512,554),'#B8AEFF',14);card((548,519,594,554),'#B8AEFF',14);card((497,516,563,565),'#A294FF',22)
 # Purple medal.
 ellipse((1094,394,1177,477),'#8B77FF');poly([(1107,464),(1140,473),(1127,511),(1113,502),(1101,507)],'#A292FF');poly([(1143,471),(1166,462),(1182,496),(1167,495),(1158,507)],'#A292FF');line([(1118,435),(1131,447),(1154,419)],'white',8)
 card((94,650,644,849),'#F8F7FE',30,'#EFEDFF');card((674,650,1226,849),'#F8F7FE',30,'#EFEDFF')
 tick(136,689,'#38BB97')
 # Both labels use the same top anchor, font face, size and row coordinates.
 text(250,699,'验证通过并恢复发言',31)
 nsize=76
 while width(s['passed'],nsize)>280:nsize-=1
 text(250,754,s['passed'],nsize,'#10A775');text(250+width(s['passed'],nsize)+12,785,'人',34,'#10A775')
 ellipse((714,689,788,763),'#FB829F');line([(730,747),(770,707)],'white',10)
 text(826,699,'未通过、已限制发言',31)
 nsize=76
 while width(s['restricted'],nsize)>280:nsize-=1
 text(826,754,s['restricted'],nsize);text(826+width(s['restricted'],nsize)+12,785,'人',34)
 pending=s['total']-s['passed']-s['restricted']
 if pending: text(110,865,f'仍在验证 / 恢复权限中：{pending} 人',22,'#8580AD',False)
 card((98,888,1226,990),'#EFEDFF',30)
 ellipse((130,917,174,961),'#A39BCD');text(147,923,'i',28,'white')
 text(197,927,'统计按 Telegram 用户去重，以机器人记录的入群验证会话为准。',25,'#8079AD')
 wave=[(94,1062)]+[(x,1029+25*math.sin((x-94)/1132*math.pi*2)) for x in range(94,1227,4)]+[(1226,1062)]
 poly(wave,'#E0DAFF')
 wave=[(500,1062)]+[(x,1056-66*((x-500)/726)**2) for x in range(500,1227,4)]+[(1226,1062)]
 poly(wave,'#B3A5FF')
 poly([(1120,1030),(1181,1008),(1169,1060),(1152,1040),(1139,1051),(1141,1034)],'#FFFFFF')
 im.convert('RGB').resize((1280,1170),Image.Resampling.LANCZOS).save(output)
 

if __name__ == "__main__":
 render_report(json.load(open(sys.argv[1],encoding="utf-8")),sys.argv[2])
