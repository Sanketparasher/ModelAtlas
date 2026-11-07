const assert = require('assert');
const {
  createBenchmarkProvenance,
  validateBenchmarkProvenance,
  getBenchmarkProvenanceCoverage
} = require('./benchmark_provenance');

const timestamp = '2026-11-08T00:00:00.000Z';
const directRecord = createBenchmarkProvenance({
  source: 'Test source',
  sourceUrl: 'https://example.com/benchmarks.csv',
  recordedAt: timestamp,
  retrievedAt: timestamp,
  sourceMetric: 'Arena Elo'
});

assert.deepStrictEqual(directRecord, {
  source: 'Test source',
  sourceUrl: 'https://example.com/benchmarks.csv',
  recordedAt: timestamp,
  retrievedAt: timestamp,
  sourceMetric: 'Arena Elo',
  method: 'direct'
});

const model = {
  benchmarks: { arenaElo: 1200, mmluPro: 75 },
  benchmarkProvenance: { arenaElo: directRecord }
};
assert.deepStrictEqual(validateBenchmarkProvenance(model), []);
assert.deepStrictEqual(getBenchmarkProvenanceCoverage([model]), { tracked: 1, untracked: 1 });
assert.deepStrictEqual(validateBenchmarkProvenance({
  benchmarks: { arenaElo: 1200 },
  benchmarkProvenance: { arenaElo: { source: 'Test source' } }
}).length, 3);

const legacyModels = require('../models.js');
const coverage = getBenchmarkProvenanceCoverage(legacyModels);
assert.strictEqual(coverage.tracked, 0, 'Legacy model provenance must not be fabricated.');
assert(coverage.untracked > 0, 'Legacy benchmark values should be reported as untracked.');

const compareHtml = require('fs').readFileSync(require('path').join(__dirname, '..', 'compare.html'), 'utf8');
assert(compareHtml.includes('Benchmark sources and dates'));
assert(compareHtml.includes('Source and date not recorded for this catalog value.'));

console.log('Benchmark provenance checks passed.');
