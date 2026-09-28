from pathlib import Path
from PIL import Image
import hashlib,json,shutil
root=Path(__file__).resolve().parent.parent
source=root/'authoring/secret-level';target=root/'dist/assets/secret-level';target.mkdir(parents=True,exist_ok=True)
manifest=json.loads((source/'asset_manifest.json').read_text())
for name,meta in manifest['assets'].items():
 p=source/'assets'/name
 assert hashlib.sha256(p.read_bytes()).hexdigest()==meta['sha256'],name
 with Image.open(p) as im:
  im.load();assert im.size==(meta['width'],meta['height']) and im.mode==meta['mode'],name
 for rect in manifest.get('animations',{}).get(name,{}).get('rects',[]):
  x,y,w,h=rect;assert x>=0 and y>=0 and x+w<=meta['width'] and y+h<=meta['height']
 shutil.copyfile(p,target/name)
for name in ['asset_manifest.json','encounter_config.json']:shutil.copyfile(source/name,target/name)
print('Verified and imported',len(manifest['assets']),'original PNGs; review/shared copies excluded from runtime.')

shutil.copyfile(root/'authoring/secret-encounter-overrides.json',target/'encounter_config.json')

# Supplemental V2 originals; normalize their metadata into the existing loader contract.
v2=root/'authoring/secret-electrical-v2'
fx=json.loads((v2/'fx_manifest.json').read_text())
for name,meta in fx['assets'].items():
 p=v2/'assets'/name
 assert hashlib.sha256(p.read_bytes()).hexdigest()==meta['sha256'],name
 with Image.open(p) as im:
  im.load();assert list(im.size)==meta['size'] and im.mode=='RGBA',name
  manifest['assets'][name]={'width':im.width,'height':im.height,'mode':'RGBA','sha256':meta['sha256']}
 anim=fx['animations'][name]
 manifest['animations'][name]={**anim,'durations_ms':anim['frameMs']}
 shutil.copyfile(p,target/name)
manifest['electricalV2']=fx
(target/'asset_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Verified and imported four V2 atlases, preserving original PNG bytes.')
