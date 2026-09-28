const test=require('node:test'),{execFileSync}=require('node:child_process'),path=require('node:path');
test('atlas alpha validator catches missing gutter, wrong foot, and duplicate flight frames',()=>{
  execFileSync('python',['-c',`
import importlib.util,tempfile
from pathlib import Path
from PIL import Image,ImageDraw
spec=importlib.util.spec_from_file_location('qa','scripts/hazard-atlas-qa.py');qa=importlib.util.module_from_spec(spec);spec.loader.exec_module(qa)
with tempfile.TemporaryDirectory() as folder:
 p=Path(folder)/'atlas.png'
 im=Image.new('RGBA',(2172,724));d=ImageDraw.Draw(im)
 for x in (0,1086):d.rectangle((x+100,150,x+500,619),fill=(50,80,90,255))
 im.save(p);assert qa.inspect(p)['structuralChecks']=='passed'
 d.rectangle((0,200,10,250),fill=(50,80,90,255));im.save(p)
 try:qa.inspect(p);raise AssertionError('bad gutter passed')
 except ValueError:pass
 im=Image.new('RGBA',(2172,724));d=ImageDraw.Draw(im)
 for x in (0,1086):d.rectangle((x+100,150,x+500,570),fill=(50,80,90,255))
 im.save(p)
 try:qa.inspect(p);raise AssertionError('bad foot passed')
 except ValueError:pass
 im=Image.new('RGBA',(2172,724));d=ImageDraw.Draw(im)
 for i in range(4):d.rectangle((i*543+100,150,i*543+400,500),fill=(50,80,90,255))
 im.save(p)
 try:qa.inspect(p,True);raise AssertionError('duplicate frames passed')
 except ValueError:pass
 for i in range(4):d.rectangle((i*543+100,150,i*543+110+i*20,180+i*10),fill=(70,110,50,255))
 im.save(p);assert qa.inspect(p,True)['structuralChecks']=='passed'
`],{cwd:path.resolve(__dirname,'../..'),stdio:'pipe'});
});
