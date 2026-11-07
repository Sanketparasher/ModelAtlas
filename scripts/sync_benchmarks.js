/**
 * ModelAtlas Benchmark Synchronizer
 * 
 * Validates and sorts the local model catalog. It does not fetch benchmark updates.
 * Per-metric source and retrieval timestamp are recorded in benchmarkProvenance when available.
 */

const fs = require('fs');
const path = require('path');
const {
  validateBenchmarkProvenance,
  getBenchmarkProvenanceCoverage
} = require('./benchmark_provenance');

const DATA_FILE = path.join(__dirname, '..', 'data', 'models.json');
const JS_FILE = path.join(__dirname, '..', 'models.js');

console.log('🔄 ModelAtlas Benchmark Ingestion & Validator');
console.log('--------------------------------------------------');

// Load current database
let currentModels = [];
try {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  currentModels = JSON.parse(raw);
  console.log(`📦 Loaded ${currentModels.length} models from local database.`);
} catch (e) {
  console.error('❌ Failed to read models.json:', e.message);
  process.exit(1);
}

// Validate record shape and any provenance metadata that is present.
function validateModel(m) {
  const issues = [];
  if (!m.id) issues.push('Missing id');
  if (!m.name) issues.push('Missing name');
  if (!m.provider) issues.push('Missing provider');
  if (!m.benchmarks || typeof m.benchmarks.arenaElo !== 'number') issues.push('Missing valid Arena Elo');
  if (!m.scores) issues.push('Missing normalized scores');
  return issues;
}

let validCount = 0;
let provenanceIssueCount = 0;
currentModels.forEach((m, idx) => {
  const provenanceIssues = validateBenchmarkProvenance(m);
  const errors = [...validateModel(m), ...provenanceIssues];
  if (errors.length > 0) {
    console.warn(`⚠️ Model #${idx} (${m.id || 'unnamed'}): ${errors.join(', ')}`);
    provenanceIssueCount += provenanceIssues.length;
  } else {
    validCount++;
  }
});

console.log(`✅ ${validCount}/${currentModels.length} models have structurally valid records.`);
const provenanceCoverage = getBenchmarkProvenanceCoverage(currentModels);
console.log(`🔎 Benchmark values with recorded provenance: ${provenanceCoverage.tracked}; without provenance: ${provenanceCoverage.untracked}.`);
if (provenanceCoverage.untracked > 0) {
  console.warn('⚠️ Untracked legacy benchmark values are left unchanged; no source or date was inferred.');
}
if (provenanceIssueCount > 0) {
  console.error(`❌ Found ${provenanceIssueCount} invalid benchmark provenance record(s).`);
  process.exit(1);
}

// Sort by Arena Elo descending
currentModels.sort((a, b) => (b.benchmarks.arenaElo || 0) - (a.benchmarks.arenaElo || 0));

// Export updated JSON and models.js
fs.writeFileSync(DATA_FILE, JSON.stringify(currentModels, null, 2), 'utf-8');

// Generate models.js
const jsContent = `// ModelAtlas Unified Dataset
// Reference datasets used across catalog; individual model values may have incomplete provenance.
// Per-metric source and retrieval timestamp are recorded in benchmarkProvenance when available.
// Missing provenance for existing values is intentionally not inferred.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MODELS_DATA = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return ${JSON.stringify(currentModels, null, 2)};
}));
`;

fs.writeFileSync(JS_FILE, jsContent, 'utf-8');
console.log(`💾 Saved updated dataset to data/models.json & models.js`);
console.log('🚀 Synchronizer ready! Run "node scripts/sync_benchmarks.js" anytime to re-validate.');
