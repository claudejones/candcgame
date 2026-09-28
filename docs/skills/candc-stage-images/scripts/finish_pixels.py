#!/usr/bin/env python3
"""Measured pixel finishing with explicit trims, alpha cleanup and uniform scaling. Pillow required."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image
import math
import zipfile

SIZE = (2172, 724)
KINDS = {'FAR', 'MID', 'GROUND', 'OBJECT_ATLAS', 'FLYING'}

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def load(p):
    with Image.open(p) as im:
        if im.format != 'PNG':
            raise ValueError('Input must be PNG')
        im.load()
        if im.mode not in ('RGB', 'RGBA'):
            raise ValueError('Input must be RGB or RGBA')
        return im.copy()

def bounds(im):
    return im.convert('RGBA').getchannel('A').getbbox()

def inspect(p):
    im = load(p)
    a = im.convert('RGBA').getchannel('A')
    result = dict(path=str(p), sha256=sha(p), size=list(im.size), mode=im.mode,
                  alpha_bounds=bounds(im), alpha_extrema=a.getextrema())
    # Alpha transitions are evidence, never a semantic baseline/contact detector.
    rows = []
    for y in range(im.height):
        lo, hi = a.crop((0, y, im.width, y+1)).getextrema()
        if lo == 255:
            rows.append(y)
    result['first_fully_opaque_row'] = rows[0] if rows else None
    return result

def point(value, label):
    if not isinstance(value, list) or len(value) != 2 or any(type(v) is not int for v in value):
        raise ValueError(label + ' must contain two integer coordinates')
    return tuple(value)

def finish(job, destination):
    kind = job['kind']
    if kind not in KINDS:
        raise ValueError('Unknown image kind')
    source = Path(job['source']).resolve()
    im = load(source)
    if kind != 'FAR' and im.mode != 'RGBA':
        raise ValueError('This image requires original RGBA transparency')
    if job.get('source_sha256') != sha(source):
        raise ValueError('Source hash changed; inspect this exact file first')
    scale = job.get('scale', 1)
    if isinstance(scale, bool) or not isinstance(scale, (int,float)) or not math.isfinite(scale) or not 0.8 <= scale <= 1:
        raise ValueError('Uniform scale must be between0.8 and1; larger changes need a separately reviewed operation')
    edits = job.get('corrections', {})
    if (edits or scale != 1) and not job.get('correction_reason', '').strip():
        raise ValueError('Resizing/trims/alpha edits require a recorded correction_reason')
    if scale != 1 and kind not in ('FLYING','OBJECT_ATLAS'):
        raise ValueError('Landscape rescaling is not supported')
    im = im.convert('RGBA')
    correction_log = []
    allowed={'clear_regions','opaque_regions','trim_bottom','clear_below_alpha'}
    if set(edits)-allowed:raise ValueError('Unknown correction option')
    cutoff=edits.get('clear_below_alpha',0)
    if type(cutoff)is not int or not 0<=cutoff<=32:
        raise ValueError('Faint-alpha cleanup cutoff must be0..32')
    if cutoff:
        a=im.getchannel('A'); count=sum(a.histogram()[1:cutoff+1])
        im.putalpha(a.point(lambda v:0 if v<=cutoff else v))
        correction_log.append(dict(operation='clear_faint_alpha',cutoff=cutoff,pixels=count))
    def region(value):
        if (not isinstance(value,list) or len(value)!=4 or any(type(v)is not int for v in value)
            or not 0<=value[0]<value[2]<=im.width or not 0<=value[1]<value[3]<=im.height):
            raise ValueError('Correction region outside source image')
        return tuple(value)
    for edit in edits.get('clear_regions', []):
        rect=region(edit['region']); limit=edit['max_alpha']
        if type(limit)is not int or not 0<=limit<=32:
            raise ValueError('Empty-space cleanup alpha limit must be0..32')
        a=im.getchannel('A').crop(rect)
        if a.getextrema()[1]>limit:
            raise ValueError('Empty-space cleanup would remove stronger visible pixels')
        count=sum(a.histogram()[1:])
        im.paste((0,0,0,0),rect)
        correction_log.append(dict(operation='clear_empty_region',region=rect,pixels=count,max_alpha=limit))
    for edit in edits.get('opaque_regions', []):
        rect=region(edit['region']); threshold=edit['min_alpha']
        if type(threshold)is not int or not 128<=threshold<=255:
            raise ValueError('Opacity normalization requires min_alpha128..255')
        cut=im.crop(rect); a=cut.getchannel('A')
        if a.getextrema()[0]<threshold:
            raise ValueError('Opacity normalization would fill an actual transparent hole')
        cut.putalpha(255);im.paste(cut,rect)
        correction_log.append(dict(operation='opaque_region',region=rect,min_alpha=threshold))
    trim=edits.get('trim_bottom',0)
    if type(trim)is not int or not 0<=trim<=min(36,im.height-1):
        raise ValueError('Bottom trim must be0..36 rows')
    if trim:
        if kind not in ('MID','GROUND'):
            raise ValueError('Visible bottom trimming is limited to landscape margins')
        rect=(0,im.height-trim,im.width,im.height)
        im.paste((0,0,0,0),rect)
        correction_log.append(dict(operation='trim_bottom',rows=trim,region=rect))
    outpath = Path(destination).resolve()
    if outpath == source or outpath.exists():
        raise ValueError('Output must be a new file; original and previous outputs are preserved')
    pieces = job.get('pieces', [])
    expected = 2 if kind == 'OBJECT_ATLAS' else 4 if kind == 'FLYING' else 1
    if len(pieces) != expected:
        raise ValueError(f'{kind} requires {expected} source regions')
    out = Image.new('RGBA', SIZE)
    coverage = Image.new('1', im.size)
    operations = []
    targets = {'MID': (0,621), 'GROUND': (0,393), 'OBJECT_ATLAS': (543,620), 'FLYING': (271,362)}
    for index, piece in enumerate(pieces):
        rect = piece['region']
        if (not isinstance(rect, list) or len(rect) != 4 or any(type(v) is not int for v in rect)
                or not 0 <= rect[0] < rect[2] <= im.width or not 0 <= rect[1] < rect[3] <= im.height):
            raise ValueError('Region must be an in-bounds integer rectangle')
        if coverage.crop(rect).getbbox():
            raise ValueError('Source regions overlap')
        coverage.paste(1, rect)
        cut = im.crop(rect).convert('RGBA')
        if 'scale' in piece:
            raise ValueError('Per-frame scaling is prohibited; use one job scale')
        if not bounds(cut):
            raise ValueError('Empty source region')
        if kind == 'FAR':
            origin = (0,0)
        else:
            if not piece.get('anchor_evidence', '').strip():
                raise ValueError('Record the visually identified anchor and how it was measured')
            anchor = point(piece.get('anchor'), 'anchor')
            if not (0 <= anchor[0] < cut.width and 0 <= anchor[1] < cut.height):
                raise ValueError('Anchor outside source region')
            if kind in ('MID', 'GROUND') and anchor[0] != 0:
                raise ValueError('Landscape baseline must use source x=0')
            target = targets[kind]
            origin = (target[0]-scale*anchor[0], target[1]-scale*anchor[1])
        width = SIZE[0] // expected
        box = bounds(cut)
        placed = (math.floor(scale*box[0]+origin[0]), math.floor(scale*box[1]+origin[1]), math.ceil(scale*box[2]+origin[0]), math.ceil(scale*box[3]+origin[1]))
        gutter = 32 if expected > 1 else 0
        if (placed[0] < gutter or placed[1] < gutter or placed[2] > width-gutter or placed[3] > SIZE[1]-gutter):
            raise ValueError(f'Cell {index+1}: placement would clip artwork or violate {gutter}px gutters; bounds={placed}')
        # Direct RGBA copy preserves RGB and alpha exactly; do not paste with alpha as mask.
        cell = Image.new('RGBA', (width, SIZE[1]))
        if scale == 1:
            cell.paste(cut, tuple(int(v) for v in origin))
        else:
            cell = cut.transform((width,SIZE[1]),Image.Transform.AFFINE,(1/scale,0,-origin[0]/scale,0,1/scale,-origin[1]/scale),resample=Image.Resampling.NEAREST)
        actual=bounds(cell)
        if actual is None or actual[0]<gutter or actual[1]<gutter or actual[2]>width-gutter or actual[3]>SIZE[1]-gutter:
            raise ValueError('Actual transformed pixels failed gutter verification')
        out.paste(cell, (index*width, 0))
        operations.append(dict(region=rect, translation=list(origin), cell=index+1,
                               output_alpha_bounds=list(actual), uniform_scale=scale, mapped_anchor=list(targets[kind]) if kind!='FAR' else None, anchor_evidence=piece.get('anchor_evidence')))
    a = im.convert('RGBA').getchannel('A')
    from PIL import ImageChops
    if ImageChops.multiply(a, ImageChops.invert(coverage.convert('L'))).getbbox():
        raise ValueError('Source regions omit nontransparent pixels; no implicit trimming allowed')
    if kind in ('FAR','MID','GROUND') and out.width > im.width:
        if job.get('horizontal_extension') != 'wrap':
            raise ValueError('Canvas needs horizontal pixels; explicitly select wrap after inspecting the repeat join')
        # Repeat only the missing columns, never scale or invent a new texture.
        for x in range(im.width, out.width):
            out.paste(out.crop((x % im.width,0,x % im.width+1,out.height)),(x,0))
    oa = out.getchannel('A')
    if kind == 'FAR' and oa.getextrema() != (255,255):
        raise ValueError('FAR must cover the entire canvas opaquely')
    if kind == 'GROUND':
        if oa.crop((0,0,SIZE[0],393)).getbbox():
            raise ValueError('GROUND has pixels above row393')
        if oa.crop((0,393,SIZE[0],724)).getextrema() != (255,255):
            raise ValueError('GROUND must be fully opaque from row393 through the bottom')
    if kind == 'MID' and oa.crop((0,621,SIZE[0],724)).getextrema() != (255,255):
        raise ValueError('MID lower coverage is incomplete')
    outpath.parent.mkdir(parents=True, exist_ok=True)
    out.save(outpath, format='PNG')
    verified = load(outpath)
    if verified.size != SIZE or verified.mode != 'RGBA' or verified.tobytes() != out.tobytes():
        raise ValueError('Saved PNG did not match finished pixels')
    return dict(state='geometry_pass', output=str(outpath), sha256=sha(outpath), operations=operations, corrections=correction_log,
                limitations='Anchor identity is supplied visual evidence. Repeat seams, style, animation and combined landscape still require visual review.')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    scan = sub.add_parser('inspect'); scan.add_argument('files', nargs='+')
    apply = sub.add_parser('apply'); apply.add_argument('plan'); apply.add_argument('--output-dir', required=True)
    pack = sub.add_parser('package'); pack.add_argument('report'); pack.add_argument('--review',required=True); pack.add_argument('--zip',required=True)
    args = parser.parse_args()
    if args.command == 'package':
        report=json.loads(Path(args.report).read_text()); review=json.loads(Path(args.review).read_text())
        results=report['results']
        if len(results)!=5 or {r['kind'] for r in results}!=KINDS or any(r['state']!='geometry_pass' for r in results):
            raise SystemExit('Package requires all five geometry passes')
        if any(review.get(k)!='pass' for k in ('anchors','repeat_edges','combined_landscape','animation')):
            raise SystemExit('Package requires recorded visual checks')
        names=[]
        for r in results:
            file=Path(r['output']); names.append(file.name)
            if sha(file)!=r['sha256'] or review.get('hashes',{}).get(r['kind'])!=r['sha256']:
                raise SystemExit('Files changed or visual review does not match their hashes')
            im=load(file)
            if im.size!=SIZE:raise SystemExit('Unexpected package dimensions')
        if len(set(names))!=5:raise SystemExit('Duplicate filenames')
        with zipfile.ZipFile(args.zip,'x',compression=zipfile.ZIP_DEFLATED) as archive:
            for r in results:archive.write(r['output'],Path(r['output']).name)
        print(json.dumps(dict(zip=args.zip,stage=report.get('stage'),files=names)))
        return
    if args.command == 'inspect':
        print(json.dumps([inspect(p) for p in args.files], indent=2)); return
    plan = json.loads(Path(args.plan).read_text())
    out = Path(args.output_dir)
    if out.exists():
        raise SystemExit('Use a new output directory to preserve previous work')
    jobs = plan['images']; names = [j['filename'] for j in jobs]
    if len(set(names)) != len(names) or any(Path(n).name != n or not n.endswith('.png') for n in names):
        raise SystemExit('Use unique plain PNG filenames')
    out.mkdir(parents=True)
    results = []
    for job in jobs:
        try:
            result = finish(job, out/job['filename'])
        except (ValueError, KeyError, OSError, TypeError) as error:
            result = dict(state='blocked', reason=str(error))
        results.append(dict(kind=job.get('kind'), source=job.get('source'), **result))
    report = dict(stage=plan.get('stage'), results=results, production_ready=False,
                  note='Only geometry checked; complete visual review before Workbench handoff.')
    (out/'pixel-results.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    raise SystemExit(2 if any(r['state']=='blocked' for r in results) else 0)

if __name__ == '__main__':
    main()
