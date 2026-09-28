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

const {validatePng}=require("./png-integrity.cjs");

const results = [];
for (const [stageId, stage] of selectedStages) {
  for (const [layerName, spec] of Object.entries(stage.layers)) {
    if (!layerArg || layerName === layerArg) results.push(validatePng(stageId, layerName, spec));
  }
}

if (jsonOutput) process.stdout.write(JSON.stringify({schemaVersion: registry.schemaVersion, results}, null, 2) + "\n");
else for (const result of results) console.log(`PNG OK ${result.stage}/${result.layer} ${result.path} ${result.width}x${result.height}`);
