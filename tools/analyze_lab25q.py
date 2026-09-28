from pathlib import Path
import base64, hashlib, io, re, struct

SOURCE=Path('archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html')
OUT=Path('docs/LAB25Q_PHASE0_SOURCE_MANIFEST.md')
html=SOURCE.read_text(errors='strict')

img_re=re.compile(r'data:image/(?P<kind>[^;]+);base64,(?P<data>[A-Za-z0-9+/=]+)',re.I)
style_re=re.compile(r'<style(?P<attrs>[^>]*)>(?P<body>.*?)</style>',re.I|re.S)
script_re=re.compile(r'<script(?P<attrs>[^>]*)>(?P<body>.*?)</script>',re.I|re.S)
id_re=re.compile(r'\bid=["\']([^"\']+)["\']',re.I)
class_re=re.compile(r'\bclass=["\']([^"\']+)["\']',re.I)

def png_size(raw):
    if raw[:8]==b'\x89PNG\r\n\x1a\n' and raw[12:16]==b'IHDR':
        return struct.unpack('>II',raw[16:24])
    return (None,None)

def line_no(pos): return html.count('\n',0,pos)+1

def semantic_context(start,end):
    # Do not use occurrence number as identity. Record source ownership evidence around the payload.
    before=html[max(0,start-900):start]
    after=html[end:min(len(html),end+300)]
    compact=re.sub(r'\s+',' ',before[-650:]+" [IMAGE] "+after[:180]).strip()
    # Prefer nearby assignment/property/src evidence.
    candidates=[]
    pats=[
      r'([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*=\s*["\']?$',
      r'([A-Za-z_$][\w$]*)\s*:\s*["\']?$',
      r'<img[^>]*\b(?:id|class)=["\']([^"\']+)["\'][^>]*\bsrc=["\']?$'
    ]
    tail=before[-500:]
    for p in pats:
        mm=re.search(p,tail,re.I|re.S)
        if mm: candidates.append(mm.group(1))
    owner=candidates[0] if candidates else 'REQUIRES_MANUAL_SEMANTIC_REVIEW'
    return owner,compact

styles=list(style_re.finditer(html))
scripts=[m for m in script_re.finditer(html) if 'src=' not in m.group('attrs').lower()]
imgs=list(img_re.finditer(html))
ids=id_re.findall(html)
classes=[]
for raw in class_re.findall(html): classes.extend(raw.split())

lines=[]
lines += ['# LAB25Q Phase 0 — Exact Source Manifest','',
'Status: GENERATED FROM IMMUTABLE LAB25Q; semantic review required where explicitly marked.',
'',f'- Source: `{SOURCE}`',f'- Source bytes: **{SOURCE.stat().st_size:,}**',f'- Source SHA-256: `{hashlib.sha256(SOURCE.read_bytes()).hexdigest()}`',
f'- Inline CSS blocks: **{len(styles)}**',f'- Inline JavaScript blocks: **{len(scripts)}**',f'- Embedded image payloads: **{len(imgs)}**',f'- DOM IDs: **{len(ids)}** total / **{len(set(ids))}** unique',f'- CSS classes used in markup: **{len(set(classes))}** unique','']

lines += ['## DOM inventory','', '### IDs','']
lines += [f'- `{x}`' for x in ids]
lines += ['', '### Classes','']
lines += [f'- `{x}`' for x in sorted(set(classes))]

lines += ['', '## Inline CSS blocks','']
for i,m in enumerate(styles,1):
    body=m.group('body')
    lines += [f'### CSS block {i}',f'- Source line: **{line_no(m.start())}**',f'- Characters: **{len(body):,}**',f'- SHA-256: `{hashlib.sha256(body.encode()).hexdigest()}`','']

lines += ['## Inline JavaScript blocks','']
for i,m in enumerate(scripts,1):
    body=m.group('body')
    lines += [f'### JavaScript block {i}',f'- Source line: **{line_no(m.start())}**',f'- Characters: **{len(body):,}**',f'- SHA-256: `{hashlib.sha256(body.encode()).hexdigest()}`','']

lines += ['## Embedded image inventory','',
'Each row is identified by payload hash plus semantic source evidence. The ordinal is navigation only and MUST NOT be used as the replacement mapping key.','',
'| Ref | Source line | MIME | Dimensions | Bytes | SHA-256 | Nearby semantic owner |',
'|---|---:|---|---:|---:|---|---|']
manual=[]
for i,m in enumerate(imgs):
    raw=base64.b64decode(m.group('data'))
    w,h=png_size(raw)
    owner,context=semantic_context(m.start(),m.end())
    sha=hashlib.sha256(raw).hexdigest()
    if owner.startswith('REQUIRES_'): manual.append(i)
    lines.append(f'| IMG-{i:02d} | {line_no(m.start())} | {m.group("kind")} | {w or "?"}×{h or "?"} | {len(raw):,} | `{sha[:16]}…` | `{owner}` |')

lines += ['', '## Semantic evidence excerpts','']
for i,m in enumerate(imgs):
    raw=base64.b64decode(m.group('data'))
    owner,context=semantic_context(m.start(),m.end())
    lines += [f'### IMG-{i:02d} — `{hashlib.sha256(raw).hexdigest()}`',f'- Source line: {line_no(m.start())}',f'- Detected owner: `{owner}`','```text',context.replace('```',''), '```','']

# Extract renderer/config evidence without pretending it is a complete JS parser.
needles=['const CONFIG','CONFIG =','worldContract','characterX','worldSpeed','masterScale','stateScale','cropInsets','starYOffset','starScale','starRenderScale','starFPS','jump:','slideDuration','hitRecovery','signatureStart','speedClasses','altitudeMix','phases:','maxVisible','reactionLead','finish:','function drawHUD','function draw','drawImage','DOMContentLoaded','addEventListener']
lines += ['## Renderer / configuration / initialization evidence','',
'These excerpts are source evidence for Phase 0. They are not rewritten configuration.','']
for needle in needles:
    pos=html.find(needle)
    if pos<0: continue
    excerpt=re.sub(r'\s+',' ',html[max(0,pos-180):min(len(html),pos+700)]).strip()
    lines += [f'### `{needle}` — first occurrence at line {line_no(pos)}','```text',excerpt.replace('```',''),'```','']

lines += ['## Phase 0 review flags','',
f'- Embedded payloads requiring manual semantic-owner confirmation: **{len(manual)}**' + (f' — {", ".join(f"IMG-{i:02d}" for i in manual)}' if manual else ''),
'- Phase 0 does **not** map payloads to current named assets. That is Phase 2 after the Phase 1 code-externalization parity gate.',
'- No runtime or approved asset is modified by this analyzer.','']
OUT.write_text('\n'.join(lines))
print(f'Wrote {OUT} with {len(imgs)} embedded payload records; manual semantic review={len(manual)}')
