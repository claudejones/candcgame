#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-mobile-game}"
OUT="${2:-pwa-optimization-report}"
rm -rf "$OUT"; mkdir -p "$OUT/png" "$OUT/webp"
CSV="$OUT/image-results.csv"
echo "path,original_bytes,optipng_bytes,webp_bytes,optipng_saving_pct,webp_saving_pct,pixel_identical_webp" > "$CSV"
total_orig=0; total_png=0; total_webp=0; count=0
while IFS= read -r -d '' f; do
  rel="${f#$ROOT/}"; mkdir -p "$OUT/png/$(dirname "$rel")" "$OUT/webp/$(dirname "$rel")"
  p="$OUT/png/$rel"; w="$OUT/webp/${rel%.png}.webp"
  cp "$f" "$p"; optipng -quiet -o7 -strip all "$p" || true
  cwebp -quiet -lossless -z 9 -metadata none "$f" -o "$w"
  orig=$(stat -c%s "$f"); pb=$(stat -c%s "$p"); wb=$(stat -c%s "$w")
  ae=$(compare -metric AE "$f" "$w" null: 2>&1 || true)
  identical=false; [[ "$ae" == "0" ]] && identical=true
  ps=$(awk -v o="$orig" -v n="$pb" 'BEGIN{printf "%.2f",100*(o-n)/o}')
  ws=$(awk -v o="$orig" -v n="$wb" 'BEGIN{printf "%.2f",100*(o-n)/o}')
  printf '"%s",%s,%s,%s,%s,%s,%s\n' "$rel" "$orig" "$pb" "$wb" "$ps" "$ws" "$identical" >> "$CSV"
  total_orig=$((total_orig+orig)); total_png=$((total_png+pb)); total_webp=$((total_webp+wb)); count=$((count+1))
done < <(find "$ROOT/assets" -type f -iname '*.png' -print0)
python3 - "$ROOT" "$OUT" "$count" "$total_orig" "$total_png" "$total_webp" <<'PY'
import csv,json,os,sys,subprocess
root,out,count,orig,png,webp=sys.argv[1],sys.argv[2],int(sys.argv[3]),*map(int,sys.argv[4:])
rows=list(csv.DictReader(open(os.path.join(out,'image-results.csv'))))
bad=[r['path'] for r in rows if r['pixel_identical_webp']!='true']
mp3=[]
for base,_,files in os.walk(os.path.join(root,'assets')):
    for n in files:
        if n.lower().endswith('.mp3'):
            p=os.path.join(base,n)
            try:
                q=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,bit_rate','-of','json',p],text=True)
                d=json.loads(q)['format']; mp3.append({'path':os.path.relpath(p,root),'bytes':os.path.getsize(p),'duration_seconds':float(d.get('duration',0)),'bit_rate':int(d.get('bit_rate',0) or 0)})
            except Exception as e: mp3.append({'path':os.path.relpath(p,root),'bytes':os.path.getsize(p),'error':str(e)})
summary={'png_count':count,'original_png_bytes':orig,'optimized_png_bytes':png,'lossless_webp_bytes':webp,'optimized_png_saving_pct':round(100*(orig-png)/orig,2),'lossless_webp_saving_pct':round(100*(orig-webp)/orig,2),'webp_pixel_mismatches':bad,'mp3_count':len(mp3),'mp3_bytes':sum(x['bytes'] for x in mp3),'mp3_inventory':mp3}
json.dump(summary,open(os.path.join(out,'summary.json'),'w'),indent=2)
print(json.dumps({k:v for k,v in summary.items() if k!='mp3_inventory'},indent=2))
PY

# Measurement-only lab; never writes into the source asset tree.
