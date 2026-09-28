"""Deterministic atlas preparation from the preserved, user-supplied source."""
from pathlib import Path
from PIL import Image, ImageChops
import hashlib,json
root=Path(__file__).resolve().parents[2];source=Path(__file__).with_name('MAP_TRAVEL_PLANE_SOURCE.png')
im=Image.open(source).convert('RGBA');assert im.size==(1774,887)
a=im.crop((130,114,790,774));b=a.copy()
# Identical canonical body; only the original second propeller region changes.
b.paste(im.crop((1577,114,1677,774)),(560,0))
for frame in [a,b]:
    px=frame.load()
    for y in range(frame.height):
        for x in range(frame.width):
            if px[x,y][3]<128:px[x,y]=(0,0,0,0)
assert ImageChops.difference(a.crop((0,0,560,660)),b.crop((0,0,560,660))).getbbox() is None
atlas=Image.new('RGBA',(1320,660));atlas.paste(a,(0,0));atlas.paste(b,(660,0))
path=root/'dist/assets/global-ui/MAP_TRAVEL_PLANE_ATLAS.png';atlas.save(path)
report={'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'runtime_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'cell':[660,660],'canonical_body_identical':True,'propeller_period_ms':120,'display_cell_css_px':52,'visible_frame_width_css_px':[round(f.getbbox()[2]/660*52-f.getbbox()[0]/660*52,2) for f in [a,b]],'alpha_cutoff':128}
Path(__file__).with_name('atlas-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
