#!/usr/bin/env python3
"""Read-only structural/alpha checks. Pose quality and solid collision remain visual QA."""
import hashlib, json, sys
from PIL import Image

def inspect(filename, flying=False):
    with Image.open(filename) as source:
        source.verify()
    with Image.open(filename) as source:
        source.load()
        if source.mode != 'RGBA' or source.size != (2172, 724):
            raise ValueError('Expected 2172x724 RGBA atlas')
        width, count = (543, 4) if flying else (1086, 2)
        cells=[]
        for index in range(count):
            cell=source.crop((index*width, 0, (index+1)*width, 724))
            alpha=cell.getchannel('A')
            bounds=alpha.getbbox()
            if bounds is None:
                raise ValueError(f'Cell {index}: empty')
            x0,y0,x1,y1=bounds
            if min(x0,y0,width-x1,724-y1)<32:
                raise ValueError(f'Cell {index}: content enters 32px gutter')
            if not flying and abs(y1-620)>4:
                raise ValueError(f'Cell {index}: visible contact {y1} differs from source foot 620')
            cells.append({'cell':index,'bounds':list(bounds),'rgbaHash':hashlib.sha256(cell.tobytes()).hexdigest()})
        if flying and len({c['rgbaHash'] for c in cells})!=4:
            raise ValueError('Flying atlas contains identical frames')
        return {'cells':cells,'structuralChecks':'passed','visualChecksRequired':['readable poses and loop','stable body anchors','believable scale','solid collision shape','HIGH/LOW and both characters']}

if __name__=='__main__':
    try:
        print(json.dumps(inspect(sys.argv[1], '--flying' in sys.argv[2:])))
    except Exception as error:
        print(str(error),file=sys.stderr)
        sys.exit(1)
