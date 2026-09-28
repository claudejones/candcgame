"""Phone-size travel reference: actual atlas and runtime-generated coordinates.
This is a composited motion check, not a browser screenshot.
"""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json
root=Path(__file__).resolve().parents[2];assets=root/'dist/assets/global-ui';dest=Path(__file__).parent
tracks=json.loads((dest/'preview-tracks.json').read_text());atlas=Image.open(assets/'MAP_TRAVEL_PLANE_ATLAS.png').convert('RGBA');pinatlas=Image.open(assets/'MAP_HEAD_PINS_ATLAS.png').convert('RGBA');layout=json.loads((assets/'map_layout.json').read_text())
W=844;H=282;font=ImageFont.truetype(str(assets/'PressStart2P-Regular.ttf'),10)
world=Image.open(assets/'MAP_WORLD_BASE.png').convert('RGBA').resize((W,H),Image.Resampling.NEAREST)
plane=[atlas.crop((i*660,0,(i+1)*660,660)).resize((52,52),Image.Resampling.NEAREST) for i in range(2)]
pin=pinatlas.crop((0,0,pinatlas.width//2,pinatlas.height)).resize((20,20),Image.Resampling.NEAREST)
frames=[]
for index in range(101):
 out=Image.new('RGBA',(W,2*(H+36)),(4,26,52,255));draw=ImageDraw.Draw(out)
 for row,track in enumerate(tracks):
  y0=row*(H+36)+36;out.alpha_composite(world,(0,y0));draw.text((12,y0-25),track['from']+' → '+track['to']+'  /  '+('Arrival hold' if track['frames'][index]['arrived'] else 'Flight'),font=font,fill='#fff2cd')
  for f in track['frames'][:51:3]:
   x,y=round(f['x']*W),round(f['y']*H)+y0;draw.ellipse((x-2,y-2,x+2,y+2),fill='#fff2cd',outline='#041a34')
  f=track['frames'][index];x,y=round(f['x']*W),round(f['y']*H)+y0
  if f['arrived']:
   offset=(-30,-10) if track['to'].startswith('AN') else (-10,-28);out.alpha_composite(pin,(x+offset[0],y+offset[1]))
   draw.ellipse((x-6,y-6,x+6,y+6),outline='#ffdc54',width=2)
  else:
   p=plane[f['frame']];p=p.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if f['leftward'] else p;out.alpha_composite(p,(x-26,y-26))
 frames.append(out.convert('RGB'))
palette=frames[0].quantize(colors=192)
frames=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in frames]
frames[0].save(dest/'travel-preview.gif',save_all=True,append_images=frames[1:],duration=40,loop=0,optimize=True,disposal=1)
# Inspect both original propeller variants at actual phone size, with 4x magnification.
contact=Image.new('RGBA',(300,160),'#0b2943')
for i,p in enumerate(plane):contact.alpha_composite(p,(24+i*148,10))
for i,p in enumerate(plane):contact.alpha_composite(p.resize((78,78),Image.Resampling.NEAREST),(12+i*148,75))
contact.save(dest/'plane-contact.png')
