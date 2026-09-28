from pathlib import Path
import hashlib,re,shutil

SOURCE=Path('archive/LAB25Q/CHARACTER_STATE_LAB_25Q_WORLD_VISUAL_OWNERSHIP_QA.html')
OUT=Path('src')
html=SOURCE.read_text(errors='strict')

style_re=re.compile(r'<style(?P<attrs>[^>]*)>(?P<body>.*?)</style>',re.I|re.S)
script_re=re.compile(r'<script(?P<attrs>(?![^>]*\bsrc=)[^>]*)>(?P<body>.*?)</script>',re.I|re.S)
styles=list(style_re.finditer(html)); scripts=list(script_re.finditer(html))
if len(styles)!=1 or len(scripts)!=1:
    raise SystemExit(f'Phase 1 contract expected exactly 1 inline style and 1 inline script; got styles={len(styles)} scripts={len(scripts)}')

style=styles[0]; script=scripts[0]
css=style.group('body'); js=script.group('body')
style_attrs=style.group('attrs'); script_attrs=script.group('attrs')

shutil.rmtree(OUT,ignore_errors=True)
(OUT/'css').mkdir(parents=True)
(OUT/'js').mkdir(parents=True)
(OUT/'css'/'lab25q.css').write_text(css)
(OUT/'js'/'lab25q.js').write_text(js)

# Replace only the exact inline containers. Payloads inside JS/HTML are not touched.
built=html[:style.start()] + f'<link rel="stylesheet" href="./css/lab25q.css" data-lab25q-style-attrs={style_attrs!r}>' + html[style.end():]
# Locate script again after the style-length change using exact original script token.
original_script=script.group(0)
script_external=f'<script{script_attrs} src="./js/lab25q.js"></script>'
pos=built.find(original_script)
if pos<0: raise SystemExit('Could not locate exact inline script after CSS externalization')
built=built[:pos]+script_external+built[pos+len(original_script):]
(OUT/'index.html').write_text(built)

# Strong structural proof: reconstruct original source exactly from generated files.
recon=built
link_token=f'<link rel="stylesheet" href="./css/lab25q.css" data-lab25q-style-attrs={style_attrs!r}>'
recon=recon.replace(link_token,style.group(0),1)
recon=recon.replace(script_external,script.group(0),1)
exact=(recon==html)

img_re=re.compile(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+',re.I)
source_imgs=img_re.findall(html)
built_imgs=img_re.findall(built)+img_re.findall(js)
# Images inside inline JS move to external JS; markup images remain in index.
image_multiset_ok=sorted(hashlib.sha256(x.encode()).hexdigest() for x in source_imgs)==sorted(hashlib.sha256(x.encode()).hexdigest() for x in built_imgs)

report=f'''# LAB25Q Phase 1 — Structural Externalization Report

Status: {'PASS' if exact and image_multiset_ok else 'FAIL'}

- Immutable source SHA-256: `{hashlib.sha256(html.encode()).hexdigest()}`
- Extracted CSS SHA-256: `{hashlib.sha256(css.encode()).hexdigest()}`
- Extracted JavaScript SHA-256: `{hashlib.sha256(js.encode()).hexdigest()}`
- Embedded image payloads in source: **{len(source_imgs)}**
- Embedded image payloads after externalization (index + JS): **{len(built_imgs)}**
- Exact source reconstruction from generated index + CSS + JS: **{exact}**
- Embedded image payload identity preserved: **{image_multiset_ok}**
- Named assets substituted in Phase 1: **0**
- Configuration values intentionally changed in Phase 1: **0**

## Gate meaning
This proves the source transformation itself is lossless: reinserting the extracted CSS and JavaScript recreates archived LAB25Q exactly, and all embedded image payload identities remain unchanged.

It does not by itself constitute rendered/browser parity. Phase 1 rendered parity must be checked before Phase 2 asset substitution.
'''
Path('docs/LAB25Q_PHASE1_STRUCTURAL_REPORT.md').write_text(report)
if not exact or not image_multiset_ok: raise SystemExit(report)
print(report)
