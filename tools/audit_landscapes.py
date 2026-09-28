from pathlib import Path
from PIL import Image
import json, statistics

ROOT=Path('assets-original/current-generated')
roles={'_BG_DISTANT_':'FAR','_BG_MID_':'MID','_GROUND_':'GROUND'}
records=[]

def runs(mask):
    out=[]; start=None
    for i,v in enumerate(mask+[False]):
        if v and start is None: start=i
        elif not v and start is not None:
            out.append((start,i-1,i-start)); start=None
    return out

def first_sustained(cov, threshold, n=12):
    mask=[v>=threshold for v in cov]
    rs=[r for r in runs(mask) if r[2]>=n]
    return rs[0][0] if rs else None

def longest_band(cov, threshold):
    rs=runs([v>=threshold for v in cov])
    return max(rs,key=lambda r:r[2]) if rs else None

for p in sorted(ROOT.rglob('*.png')):
    role=next((v for k,v in roles.items() if k in p.name),None)
    if not role: continue
    im=Image.open(p).convert('RGBA'); w,h=im.size
    a=im.getchannel('A'); bbox=a.getbbox(); px=list(a.getdata())
    cov=[]
    for y in range(h):
        row=px[y*w:(y+1)*w]
        cov.append(sum(v>0 for v in row)/w*100)
    nz=[i for i,v in enumerate(cov) if v>0]
    rec={'asset':p.name,'role':role,'w':w,'h':h,
         'content_top':nz[0] if nz else None,'content_bottom':nz[-1] if nz else None,
         'transparent_pct':round(sum(v==0 for v in px)/(w*h)*100,2),
         'partial_pct':round(sum(0<v<255 for v in px)/(w*h)*100,2),
         'opaque_pct':round(sum(v==255 for v in px)/(w*h)*100,2)}
    for t in (10,25,50,75,90,95):
        band=longest_band(cov,t)
        rec[f'first_sustained_{t}']=first_sustained(cov,t,12)
        rec[f'longest_{t}']=band
    for frac in (0,.1,.25,.5,.75,.9,1):
        y=min(h-1,round((h-1)*frac)); rec[f'cov_{int(frac*100)}pctY']=round(cov[y],2)
    # normalized source coordinates, useful across differing canvas sizes
    for k in ('content_top','content_bottom','first_sustained_50','first_sustained_75','first_sustained_90'):
        rec[k+'_norm']=None if rec[k] is None else round(rec[k]/h,4)
    records.append(rec)

print('# Landscape geometry deep audit')
print('TOTAL',len(records))
print('\n## Asset metrics')
for r in records:
    print(json.dumps(r,separators=(',',':')))

print('\n## Role summaries')
for role in ('FAR','MID','GROUND'):
    rr=[r for r in records if r['role']==role]
    print('\nROLE',role)
    for key in ('content_top_norm','content_bottom_norm','first_sustained_50_norm','first_sustained_75_norm','first_sustained_90_norm'):
        vals=[r[key] for r in rr if r[key] is not None]
        if vals:
            print(key,'min',round(min(vals),4),'median',round(statistics.median(vals),4),'max',round(max(vals),4),'range',round(max(vals)-min(vals),4))
    for t in (50,75,90):
        print('longest_band_'+str(t),[(r['asset'],r['longest_'+str(t)]) for r in rr])

print('\n## Candidate universal source-coordinate diagnostics')
# Report how each role behaves at normalized rows. This does not assume legacy Y393/Y621.
for role in ('MID','GROUND'):
    rr=[r for r in records if r['role']==role]
    print('\n',role)
    for frac in (.35,.40,.45,.50,.55,.60,.65,.70,.75,.80,.85,.90):
        vals=[]
        for r in rr:
            im=Image.open(next(ROOT.rglob(r['asset']))).convert('RGBA'); a=im.getchannel('A'); w,h=im.size
            y=min(h-1,round((h-1)*frac)); row=list(a.crop((0,y,w,y+1)).getdata()); vals.append(sum(v>0 for v in row)/w*100)
        print('normY',frac,'min',round(min(vals),1),'median',round(statistics.median(vals),1),'max',round(max(vals),1),'all>=50',all(v>=50 for v in vals),'all>=75',all(v>=75 for v in vals))
