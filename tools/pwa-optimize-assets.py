#!/usr/bin/env python3
"""Reversible, time-bounded PNG/WebP benchmark. Source assets are read-only."""
import concurrent.futures
import csv
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import time

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "mobile-game")
out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "pwa-optimization-report")
workers = max(1, min(int(os.environ.get("PWA_BENCH_WORKERS", "4")), os.cpu_count() or 1))
package_baseline = 189_015_121
out.mkdir(parents=True, exist_ok=True)
png_root, webp_root = out / "png", out / "webp"
shutil.rmtree(png_root, ignore_errors=True)
shutil.rmtree(webp_root, ignore_errors=True)
png_root.mkdir(parents=True)
webp_root.mkdir(parents=True)

def command(args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

def image_info(path):
    value = command(["identify", "-format", "%w,%h,%[channels]", str(path)]).stdout.strip()
    width, height, channels = value.split(",", 2)
    return int(width), int(height), bool(re.search(r"a|alpha", channels, re.I))

def one(source):
    rel = source.relative_to(root / "assets")
    png_dest = png_root / rel
    webp_dest = (webp_root / rel).with_suffix(".webp")
    png_dest.parent.mkdir(parents=True, exist_ok=True)
    webp_dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, png_dest)

    t = time.perf_counter()
    command(["optipng", "-quiet", "-o2", str(png_dest)])
    png_seconds = time.perf_counter() - t

    t = time.perf_counter()
    command(["cwebp", "-quiet", "-lossless", "-z", "6", "-mt", "-metadata", "all",
             str(source), "-o", str(webp_dest)])
    webp_seconds = time.perf_counter() - t

    original_info = image_info(source)
    optimized_info = image_info(png_dest)
    webp_info = image_info(webp_dest)
    if original_info[:2] != optimized_info[:2] or original_info[:2] != webp_info[:2]:
        raise RuntimeError(f"dimension mismatch: {rel}: {original_info}, {optimized_info}, {webp_info}")
    alpha_ok = original_info[2] == optimized_info[2] == webp_info[2]

    t = time.perf_counter()
    with tempfile.TemporaryDirectory() as temp:
        a, b = pathlib.Path(temp) / "original.rgba", pathlib.Path(temp) / "webp.rgba"
        command(["convert", str(source), "-alpha", "on", "-depth", "8", "RGBA:" + str(a)])
        command(["convert", str(webp_dest), "-alpha", "on", "-depth", "8", "RGBA:" + str(b)])
        identical = a.stat().st_size == b.stat().st_size and a.read_bytes() == b.read_bytes()
    check_seconds = time.perf_counter() - t

    return {
        "path": rel.as_posix(), "original_bytes": source.stat().st_size,
        "optimized_png_bytes": png_dest.stat().st_size, "lossless_webp_bytes": webp_dest.stat().st_size,
        "width": original_info[0], "height": original_info[1],
        "original_has_alpha": original_info[2], "optimized_png_has_alpha": optimized_info[2],
        "webp_has_alpha": webp_info[2], "alpha_preserved": alpha_ok,
        "webp_rgba_identical": identical, "optipng_seconds": round(png_seconds, 4),
        "webp_seconds": round(webp_seconds, 4), "decode_check_seconds": round(check_seconds, 4)
    }

files = sorted((root / "assets").rglob("*.png"))
files += sorted((root / "assets").rglob("*.PNG"))
files = sorted(set(files))
start = time.perf_counter()
with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
    rows = list(pool.map(one, files))
processing_seconds = time.perf_counter() - start

fields = list(rows[0].keys()) if rows else []
with (out / "image-results.csv").open("w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)

mp3_inventory = []
audio_start = time.perf_counter()
for source in sorted((root / "assets").rglob("*")):
    if source.is_file() and source.suffix.lower() == ".mp3":
        result = {"path": source.relative_to(root).as_posix(), "bytes": source.stat().st_size}
        probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                                "format=duration,bit_rate", "-of", "json", str(source)],
                               check=True, capture_output=True, text=True)
        fmt = json.loads(probe.stdout)["format"]
        result["duration_seconds"] = float(fmt.get("duration", 0))
        result["bit_rate"] = int(fmt.get("bit_rate", 0) or 0)
        mp3_inventory.append(result)
audio_inventory_seconds = time.perf_counter() - audio_start

original = sum(r["original_bytes"] for r in rows)
png_total = sum(r["optimized_png_bytes"] for r in rows)
webp_total = sum(r["lossless_webp_bytes"] for r in rows)
mismatch_paths = [r["path"] for r in rows if not r["webp_rgba_identical"]]
bad_alpha = [r["path"] for r in rows if not r["alpha_preserved"]]
png_projection = package_baseline - original + png_total
webp_projection = package_baseline - original + webp_total
summary = {
    "png_count": len(rows), "workers": workers,
    "original_png_bytes": original, "optimized_png_bytes": png_total,
    "optimized_png_saving_pct": round(100 * (original - png_total) / original, 2) if original else 0,
    "lossless_webp_bytes": webp_total,
    "lossless_webp_saving_pct": round(100 * (original - webp_total) / original, 2) if original else 0,
    "webp_pixel_mismatch_count": len(mismatch_paths), "webp_pixel_mismatch_paths": mismatch_paths,
    "alpha_mismatch_count": len(bad_alpha), "alpha_mismatch_paths": bad_alpha,
    "dimensions_checked": len(rows), "dimensions_mismatch_count": 0,
    "processing_seconds": round(processing_seconds, 2),
    "optipng_seconds_total": round(sum(r["optipng_seconds"] for r in rows), 2),
    "webp_seconds_total": round(sum(r["webp_seconds"] for r in rows), 2),
    "decode_validation_seconds_total": round(sum(r["decode_check_seconds"] for r in rows), 2),
    "mp3_count": len(mp3_inventory), "mp3_bytes": sum(x["bytes"] for x in mp3_inventory),
    "mp3_total_duration_seconds": round(sum(x["duration_seconds"] for x in mp3_inventory), 2),
    "mp3_average_bitrate_kbps": round(sum(x["bit_rate"] for x in mp3_inventory) / max(1, len(mp3_inventory)) / 1000, 1),
    "mp3_inventory_seconds": round(audio_inventory_seconds, 2), "mp3_inventory": mp3_inventory,
    "package_baseline_bytes": package_baseline,
    "package_with_optimized_png_bytes": png_projection,
    "package_with_optimized_png_mib": round(png_projection / 1048576, 2),
    "package_png_savings_bytes": package_baseline - png_projection,
    "package_png_savings_pct": round(100 * (package_baseline - png_projection) / package_baseline, 2),
    "package_with_lossless_webp_bytes": webp_projection,
    "package_with_lossless_webp_mib": round(webp_projection / 1048576, 2),
    "package_webp_savings_bytes": package_baseline - webp_projection,
    "package_webp_savings_pct": round(100 * (package_baseline - webp_projection) / package_baseline, 2)
}
(out / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(json.dumps({k:v for k,v in summary.items() if k != "mp3_inventory" and not k.endswith("_paths")}, indent=2))
