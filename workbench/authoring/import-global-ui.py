"""Import original global UI bytes; exclude flattened previews and fixture code."""
import pathlib,json,hashlib,shutil,zipfile
root=pathlib.Path(__file__).resolve().parents[1]
src=root.parent/'global-ui-handoff'
out=root/'dist/assets/global-ui';out.mkdir(parents=True,exist_ok=True)
records={}; hashes={}; verified=0
for p in src.rglob('*.json'):
 data=json.loads(p.read_text())
 def check(v):
  global verified
  if isinstance(v,dict):
   if 'sha256' in v:
    name=v.get('file',v.get('path',v.get('filename')))
    if name and (p.parent/name).is_file():
     assert hashlib.sha256((p.parent/name).read_bytes()).hexdigest()==v['sha256'],str(p.parent/name)
     verified+=1
   for x in v.values():check(x)
  elif isinstance(v,list):
   for x in v:check(x)
 check(data)
for p in sorted(src.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(src)
 # Retain contracts and source art outside the shipped web app.
 if p.suffix in ('.md','.json','.svg') or 'originals' in p.parts:
  dest=root/'authoring/global-ui'/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
 if p.suffix not in ('.png','.ttf','.txt'):continue
 if 'assets' not in p.parts and 'fonts' not in p.parts and not (p.name=='G1B_CHARACTER_SELECT_ATLAS.png' and 'references' in p.parts):continue
 if p.name.startswith(('MAP_THUMB_','TROPHY_','PASS_STAMP_')) and 'ATLAS' not in p.name:continue
 digest=hashlib.sha256(p.read_bytes()).hexdigest()
 if digest not in hashes:
  name=p.name
  if name in records and records[name]['sha256']!=digest:raise ValueError('conflicting asset '+name)
  shutil.copyfile(p,out/name);hashes[digest]=name
 records[p.name]={'file':hashes[digest],'sha256':digest,'source':str(rel)}
for name in ('map_layout.json','stages.json'):
 shutil.copyfile(src/'UI03_World_Map_Assets'/name,out/name)
override=root/'authoring/global-ui/map-layout-overrides.json'
if override.exists():
 layout=json.loads((out/'map_layout.json').read_text());layout.update(json.loads(override.read_text()));(out/'map_layout.json').write_text(json.dumps(layout,indent=2)+'\n')
(out/'manifest.json').write_text(json.dumps(records,indent=2)+'\n')
(root/'authoring/global-ui/IMPORT_REPORT.json').write_text(json.dumps({'verified_hash_entries':verified,'unique_runtime_files':len(hashes),'assets':records},indent=2)+'\n')
print(f'Validated {verified} hash entries; imported {len(hashes)} unique runtime files.')
