#!/usr/bin/env python3
"""Validate one Phase 8 stage and render deterministic QA previews."""

import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "config" / "phase8-landscapes.json"
LAYER_ORDER = ("far", "mid", "ground")


def git_blob_sha(data):
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def alpha_metrics(image):
    alpha = image.getchannel("A")
    histogram = alpha.histogram()
    total = image.width * image.height
    nonzero = total - histogram[0]
    opaque = histogram[255]
    bbox = alpha.getbbox()
    return {
        "min": alpha.getextrema()[0],
        "max": alpha.getextrema()[1],
        "nonzeroRatio": round(nonzero / total, 6),
        "opaqueRatio": round(opaque / total, 6),
        "bounds": list(bbox) if bbox else None,
    }


def row_coverage(image, y):
    y = max(0, min(image.height - 1, y))
    alpha = image.getchannel("A").crop((0, y, image.width, y + 1))
    values = alpha.get_flattened_data() if hasattr(alpha, "get_flattened_data") else alpha.getdata()
    return round(sum(1 for value in values if value > 0) / image.width, 6)


def edge_delta(image):
    rgba = image.convert("RGBA")
    left_edge = rgba.crop((0, 0, 1, rgba.height))
    right_edge = rgba.crop((rgba.width - 1, 0, rgba.width, rgba.height))
    left = list(left_edge.get_flattened_data() if hasattr(left_edge, "get_flattened_data") else left_edge.getdata())
    right = list(right_edge.get_flattened_data() if hasattr(right_edge, "get_flattened_data") else right_edge.getdata())
    total = sum(sum(abs(a[channel] - b[channel]) for channel in range(4)) for a, b in zip(left, right))
    return round(total / (rgba.height * 4), 3)


def render_layer(image, geometry, viewport, output_width):
    viewport_height = viewport["height"]
    scale = geometry["scale"]
    resized = image.convert("RGBA").resize(
        (max(1, math.ceil(image.width * scale)), max(1, math.ceil(image.height * scale))),
        Image.Resampling.NEAREST,
    )
    draw_y = math.floor(geometry["y"] + 0.5)
    canvas = Image.new("RGBA", (output_width, viewport_height), (0, 0, 0, 0))
    tile_width = image.width * scale
    x = 0
    while x < output_width:
        canvas.alpha_composite(resized, (math.floor(x + 0.5), draw_y))
        x += tile_width
    return canvas


def validate_stage(stage_id, stage, registry, output_root, check_only, skip_png=False, layer=None, preview=False):
    if not skip_png:
        subprocess.run(
            ["node", str(ROOT / "scripts" / "validate-phase8-pngs.js"), "--stage", stage_id]
            + (["--layer", layer] if layer else []),
            cwd=ROOT, check=True, capture_output=True, text=True,
        )
    runtime = json.loads(subprocess.check_output(
        ["node", str(ROOT / "scripts" / "landscape-runtime-state.cjs"), stage_id]
        + (["--preview"] if preview else []), cwd=ROOT, text=True,
    ))

    report = {"stage": stage_id, "label": stage["label"], "status": stage["status"], "runtime": runtime, "layers": {}}
    images = {}
    for layer_name in LAYER_ORDER:
        spec = stage["layers"][layer_name]
        path = ROOT / spec["validation"]
        data = path.read_bytes()
        image = Image.open(path).convert("RGBA")
        images[layer_name] = image
        metrics = alpha_metrics(image)
        if spec.get("requireOpaque") and metrics["min"] != 255:
            raise ValueError(f"{stage_id}/{layer_name}: FAR must be fully opaque")
        if spec.get("requireTransparency") and not (metrics["min"] < 255 and metrics["max"] > 0):
            raise ValueError(f"{stage_id}/{layer_name}: expected genuine alpha transparency")
        if layer_name == "ground":
            surface_y = spec.get("sourceSurfaceY", registry["viewport"]["groundSurfaceSourceY"])
            metrics["surfaceRowCoverage"] = row_coverage(image, surface_y)
            metrics["bottomRowCoverage"] = row_coverage(image, image.height - 1)
            if metrics["bottomRowCoverage"] < 0.95:
                raise ValueError(f"{stage_id}/ground: bottom row coverage below 95%")
        elif layer_name == "mid":
            metrics["bottomRowCoverage"] = row_coverage(image, image.height - 1)
        metrics["edgeMeanAbsoluteDelta"] = edge_delta(image)
        report["layers"][layer_name] = {
            "path": spec["validation"],
            "reference": spec["reference"],
            "sha256": hashlib.sha256(data).hexdigest(),
            "gitBlobSha": git_blob_sha(data),
            "width": image.width,
            "height": image.height,
            "mode": image.mode,
            "alpha": metrics,
        }

    viewport = registry["viewport"]
    isolated = {name: render_layer(image, runtime["geometry"][name], viewport, viewport["width"]) for name, image in images.items()}
    wrap = {name: render_layer(image, runtime["geometry"][name], viewport, viewport["width"] * 2) for name, image in images.items()}
    composite = Image.new("RGBA", (viewport["width"], viewport["height"]), (0, 0, 0, 0))
    for layer_name in LAYER_ORDER:
        composite.alpha_composite(isolated[layer_name])
    composite_alpha = alpha_metrics(composite)
    report["composite"] = {
        "width": composite.width,
        "height": composite.height,
        "alpha": composite_alpha,
        "uncoveredPixels": round((1 - composite_alpha["nonzeroRatio"]) * composite.width * composite.height),
    }
    if composite_alpha["min"] == 0:
        raise ValueError(f"{stage_id}: canonical composite contains uncovered pixels")

    if not check_only:
        stage_output = output_root / stage_id
        stage_output.mkdir(parents=True, exist_ok=True)
        for layer_name, preview in isolated.items():
            preview.save(stage_output / f"{stage_id}-{layer_name}-isolated.png")
        for layer_name, preview in wrap.items():
            preview.save(stage_output / f"{stage_id}-{layer_name}-wrap.png")
        composite.save(stage_output / f"{stage_id}-composite-960x540.png")
        (stage_output / "report.json").write_text(json.dumps(report, indent=2) + "\n")
        report["output"] = str(stage_output.relative_to(ROOT))
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", nargs="?")
    parser.add_argument("--all-integrated", action="store_true")
    parser.add_argument("--check-only", action="store_true")
    parser.add_argument("--skip-png", action="store_true", help="Use only after the same files passed PNG validation")
    parser.add_argument("--layer", choices=LAYER_ORDER, help="Validate the changed PNG; composite still includes all layers")
    parser.add_argument("--preview", action="store_true", help="Prospective geometry for an unintegrated stage; never deployment evidence")
    parser.add_argument("--output", type=Path, default=ROOT / "tmp" / "phase8-qa")
    args = parser.parse_args()
    registry = json.loads(REGISTRY_PATH.read_text())

    if args.all_integrated:
        selected = [(key, value) for key, value in registry["stages"].items() if value["status"] in {"approved", "integrated"}]
    elif args.stage:
        stage_id = args.stage.lower()
        if stage_id not in registry["stages"]:
            raise SystemExit(f"Unknown Phase 8 stage: {args.stage}")
        selected = [(stage_id, registry["stages"][stage_id])]
    else:
        parser.error("provide STAGE or --all-integrated")

    reports = [validate_stage(stage_id, stage, registry, args.output, args.check_only, args.skip_png, args.layer, args.preview) for stage_id, stage in selected]
    summary = {
        "validated": [report["stage"] for report in reports],
        "outputs": {report["stage"]: report.get("output") for report in reports if report.get("output")},
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
