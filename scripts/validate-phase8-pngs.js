"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.resolve(__dirname, "..");
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "config", "phase8-landscapes.json"), "utf8"));
const args = process.argv.slice(2);
const stageIndex = args.indexOf("--stage");
const stageArg = stageIndex >= 0 ? args[stageIndex + 1]?.toLowerCase() : null;
const jsonOutput = args.includes("--json");
const layerIndex = args.indexOf("--layer");
const layerArg = layerIndex >= 0 ? args[layerIndex + 1]?.toLowerCase() : null;

if (stageIndex >= 0 && !stageArg) throw new Error("--stage requires a stage id");
if (stageArg && !registry.stages[stageArg]) throw new Error(`unknown Phase 8 stage: ${stageArg}`);
if (layerIndex >= 0 && (!stageArg || !["far", "mid", "ground"].includes(layerArg))) throw new Error("--layer requires --stage and FAR, MID or GROUND");

const selectedStages = stageArg
  ? [[stageArg, registry.stages[stageArg]]]
  : Object.entries(registry.stages).filter(([, stage]) => ["approved", "integrated"].includes(stage.status));

if (registry.schemaVersion !== 1) throw new Error(`unsupported Phase 8 registry schema: ${registry.schemaVersion}`);
if (registry.viewport?.width !== 960 || registry.viewport?.height !== 540 || registry.viewport?.groundSurfaceY !== 410) {
  throw new Error("Phase 8 registry must preserve the canonical 960x540/Y410 contract");
}
const validationPaths = new Set();
for (const [stageId, stage] of Object.entries(registry.stages)) {
  for (const layerName of ["far", "mid", "ground"]) {
    const spec = stage.layers?.[layerName];
    if (!spec) throw new Error(`${stageId}: missing ${layerName} registry entry`);
    if (!fs.existsSync(path.join(ROOT, spec.reference))) throw new Error(`${stageId}/${layerName}: missing immutable reference ${spec.reference}`);
    if (validationPaths.has(spec.validation)) throw new Error(`duplicate validation path: ${spec.validation}`);
    validationPaths.add(spec.validation);
  }
}

const CRC_TABLE = Array.from({length: 256}, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function validatePng(stageId, layerName, spec) {
  const file = path.join(ROOT, spec.validation);
  if (!fs.existsSync(file)) throw new Error(`${stageId}/${layerName}: missing ${spec.validation}`);
  const data = fs.readFileSync(file);
  if (!data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    throw new Error(`${spec.validation}: invalid PNG signature`);
  }

  let offset = 8, ihdr = null, ended = false;
  const idat = [];
  while (offset < data.length) {
    if (offset + 12 > data.length) throw new Error(`${spec.validation}: truncated PNG chunk header`);
    const length = data.readUInt32BE(offset);
    const type = data.toString("ascii", offset + 4, offset + 8);
    const end = offset + 12 + length;
    if (end > data.length) throw new Error(`${spec.validation}: truncated ${type} chunk`);
    const payload = data.subarray(offset + 8, offset + 8 + length);
    const expected = data.readUInt32BE(offset + 8 + length);
    const actual = crc32(data.subarray(offset + 4, offset + 8 + length));
    if (actual !== expected) throw new Error(`${spec.validation}: ${type} CRC mismatch`);
    if (type === "IHDR") {
      if (ihdr) throw new Error(`${spec.validation}: duplicate IHDR`);
      ihdr = {
        width: payload.readUInt32BE(0),
        height: payload.readUInt32BE(4),
        depth: payload[8],
        colorType: payload[9],
        compression: payload[10],
        filter: payload[11],
        interlace: payload[12]
      };
    } else if (type === "IDAT") idat.push(payload);
    else if (type === "IEND") {
      if (length !== 0) throw new Error(`${spec.validation}: invalid IEND`);
      ended = true;
      offset = end;
      break;
    }
    offset = end;
  }

  if (!ihdr || !idat.length || !ended || offset !== data.length) {
    throw new Error(`${spec.validation}: incomplete PNG structure`);
  }
  if (ihdr.width !== spec.width || ihdr.height !== spec.height) {
    throw new Error(`${spec.validation}: expected ${spec.width}x${spec.height}, got ${ihdr.width}x${ihdr.height}`);
  }
  if (ihdr.depth !== 8) throw new Error(`${spec.validation}: expected 8-bit depth, got ${ihdr.depth}`);
  const allowedColorTypes = spec.colorTypes || [spec.colorType];
  if (!allowedColorTypes.includes(ihdr.colorType)) {
    throw new Error(`${spec.validation}: expected PNG color type ${allowedColorTypes.join(" or ")}, got ${ihdr.colorType}`);
  }
  if (ihdr.compression !== 0 || ihdr.filter !== 0 || ihdr.interlace !== 0) {
    throw new Error(`${spec.validation}: unsupported PNG encoding`);
  }

  const channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ihdr.colorType];
  if (!channels) throw new Error(`${spec.validation}: unsupported color type ${ihdr.colorType}`);
  const bytesPerRow = Math.ceil(ihdr.width * channels * ihdr.depth / 8);
  const expectedInflated = ihdr.height * (bytesPerRow + 1);
  let inflated;
  try {
    inflated = zlib.inflateSync(Buffer.concat(idat));
  } catch (error) {
    throw new Error(`${spec.validation}: IDAT decompression failed (${error.message})`);
  }
  if (inflated.length !== expectedInflated) {
    throw new Error(`${spec.validation}: incomplete pixel data (${inflated.length}/${expectedInflated} bytes)`);
  }
  for (let y = 0; y < ihdr.height; y++) {
    if (inflated[y * (bytesPerRow + 1)] > 4) throw new Error(`${spec.validation}: invalid filter byte at row ${y}`);
  }
  return {stage: stageId, layer: layerName, path: spec.validation, width: ihdr.width, height: ihdr.height, depth: ihdr.depth, colorType: ihdr.colorType};
}

const results = [];
for (const [stageId, stage] of selectedStages) {
  for (const [layerName, spec] of Object.entries(stage.layers)) {
    if (!layerArg || layerName === layerArg) results.push(validatePng(stageId, layerName, spec));
  }
}

if (jsonOutput) process.stdout.write(JSON.stringify({schemaVersion: registry.schemaVersion, results}, null, 2) + "\n");
else for (const result of results) console.log(`PNG OK ${result.stage}/${result.layer} ${result.path} ${result.width}x${result.height}`);
