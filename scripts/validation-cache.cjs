'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function fingerprintFile(root, file) {
  const absolute = path.resolve(root, file);
  return {path: path.relative(root, absolute).split(path.sep).join('/'), sha256: sha256(fs.readFileSync(absolute))};
}

function ciEnabled(env) {
  return /^(1|true|yes)$/i.test(String(env.CI || ''));
}

function createValidationCache({root, directory = path.join(root, 'tmp/validation-cache'), env = process.env} = {}) {
  if (!root) throw new Error('validation cache requires a root');
  function run({validator, files = [], metadata = {}, dependencies = [], canonicalConfig = []}, validate) {
    if (typeof validate !== 'function') throw new Error('validation cache requires a validation function');
    const description = {
      version: 1,
      validator,
      files: files.map(file => fingerprintFile(root, file)),
      metadata,
      dependencies: dependencies.map(file => fingerprintFile(root, file)),
      canonicalConfig: canonicalConfig.map(file => fingerprintFile(root, file))
    };
    const key = sha256(stable(description));
    const cacheFile = path.join(directory, validator.replace(/[^a-z0-9_.-]/gi, '_'), `${key}.json`);
    if (!ciEnabled(env)) {
      try {
        const record = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        const payload = stable({version: record.version, key: record.key, description: record.description, value: record.value});
        if (record.version === 1 && record.key === key && stable(record.description) === stable(description) && record.integrity === sha256(payload)) {
          return {cached: true, value: record.value, key};
        }
      } catch (_) {
        // Missing, partial, or corrupt cache entries are ordinary misses.
      }
    }
    const value = validate();
    if (!ciEnabled(env)) {
      const record = {version: 1, key, description, value};
      record.integrity = sha256(stable(record));
      fs.mkdirSync(path.dirname(cacheFile), {recursive: true});
      const temporary = `${cacheFile}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`;
      fs.writeFileSync(temporary, `${JSON.stringify(record)}\n`, {mode: 0o600});
      fs.renameSync(temporary, cacheFile);
    }
    return {cached: false, value, key};
  }
  return {run, disabled: ciEnabled(env)};
}

module.exports = {createValidationCache, stable, sha256};
