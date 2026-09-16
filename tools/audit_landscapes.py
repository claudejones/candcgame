from pathlib import Path
from PIL import Image

ROOT=Path('assets-original/current-generated')
roles={'_BG_DISTANT_':'FAR','_BG_MID_':'MID','_GROUND_':'GROUND'}
rows=[]
for p in sorted(ROOT.rglob('*.png')):
    role=next((v for k,v in roles.items() if k in p.name),None)
    if not role: continue
    im=Image.open(p).convert('RGBA')
    w,h=im.size
    a=im.getchannel('A')
    bbox=a.getbbox()
    extrema=a.getextrema()
    alpha=list(a.getdata())
    transparent=sum(1 for x in alpha if x==0)
    partial=sum(1 for x in alpha if 0<x<255)
    opaque=sum(1 for x in alpha if x==255)
    def rowcov(y):
        if y<0 or y>=h:return None
        r=a.crop((0,y,w,y+1)); d=list(r.getdata()); return round(sum(x>0 for x in d)/w*100,2)
    rows.append((p.name,role,w,h,bbox,extrema,round(transparent/(w*h)*100,2),round(partial/(w*h)*100,2),round(opaque/(w*h)*100,2),rowcov(0),rowcov(h-1),rowcov(393),rowcov(621)))
print('| Asset | Role | WxH | alpha bbox | alpha min/max | transparent% | partial% | opaque% | row0 cover% | last row cover% | row393 cover% | row621 cover% |')
print('|---|---|---:|---|---|---:|---:|---:|---:|---:|---:|---:|')
for r in rows:
    print('| '+' | '.join(str(x) for x in r)+' |')
print(f'\nTOTAL={len(rows)}')
