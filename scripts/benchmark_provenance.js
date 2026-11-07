const BENCHMARK_FIELDS = new Set([
  'arenaElo',
  'arenaCoding',
  'mmluPro',
  'sweBench',
  'math',
  'gpqa'
]);

const METHODS = new Set(['direct', 'derived', 'proxy', 'estimated']);

function createBenchmarkProvenance({
  source,
  sourceUrl,
  sourceDate,
  recordedAt,
  retrievedAt,
  sourceMetric,
  method = 'direct',
  note
}) {
  if (typeof source !== 'string' || !source.trim()) {
    throw new TypeError('Benchmark provenance requires a source name.');
  }
  if (!Number.isFinite(Date.parse(recordedAt))) {
    throw new TypeError('Benchmark provenance requires a valid record timestamp.');
  }
  if (retrievedAt !== undefined && !Number.isFinite(Date.parse(retrievedAt))) {
    throw new TypeError('Benchmark provenance retrieval timestamp must be valid.');
  }
  if (sourceDate !== undefined && !Number.isFinite(Date.parse(sourceDate))) {
    throw new TypeError('Benchmark provenance source date must be valid.');
  }
  if (!Array.isArray(sourceMetric) && (typeof sourceMetric !== 'string' || !sourceMetric.trim())) {
    throw new TypeError('Benchmark provenance requires at least one source metric.');
  }
  if (Array.isArray(sourceMetric) && (!sourceMetric.length || sourceMetric.some(metric => typeof metric !== 'string' || !metric.trim()))) {
    throw new TypeError('Benchmark provenance source metrics must be non-empty strings.');
  }
  if (!METHODS.has(method)) {
    throw new TypeError(`Unsupported benchmark provenance method: ${method}`);
  }
  if (sourceUrl !== undefined) {
    try {
      const parsedUrl = new URL(sourceUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new TypeError('unsupported protocol');
      }
    } catch {
      throw new TypeError('Benchmark provenance source URL must be an absolute HTTP(S) URL.');
    }
  }

  return {
    source: source.trim(),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(sourceDate ? { sourceDate: new Date(sourceDate).toISOString() } : {}),
    recordedAt: new Date(recordedAt).toISOString(),
    ...(retrievedAt ? { retrievedAt: new Date(retrievedAt).toISOString() } : {}),
    sourceMetric,
    method,
    ...(note ? { note } : {})
  };
}

function validateBenchmarkProvenance(model) {
  const issues = [];
  const provenance = model.benchmarkProvenance;
  if (provenance == null) return issues;
  if (typeof provenance !== 'object' || Array.isArray(provenance)) {
    return ['benchmarkProvenance must be an object keyed by benchmark metric'];
  }

  for (const [metric, entry] of Object.entries(provenance)) {
    if (!BENCHMARK_FIELDS.has(metric)) issues.push(`Unsupported provenance metric: ${metric}`);
    if (!model.benchmarks || !Number.isFinite(model.benchmarks[metric])) {
      issues.push(`Provenance exists for missing or non-numeric benchmark: ${metric}`);
    }
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      issues.push(`Invalid provenance entry for ${metric}`);
      continue;
    }
    if (typeof entry.source !== 'string' || !entry.source.trim()) {
      issues.push(`Missing source for ${metric}`);
    }
    if (!Number.isFinite(Date.parse(entry.recordedAt))) {
      issues.push(`Missing valid recordedAt timestamp for ${metric}`);
    }
    if (entry.retrievedAt !== undefined && !Number.isFinite(Date.parse(entry.retrievedAt))) {
      issues.push(`Invalid retrievedAt timestamp for ${metric}`);
    }
    if (entry.sourceDate !== undefined && !Number.isFinite(Date.parse(entry.sourceDate))) {
      issues.push(`Invalid sourceDate for ${metric}`);
    }
    const sourceMetrics = Array.isArray(entry.sourceMetric) ? entry.sourceMetric : [entry.sourceMetric];
    if (!sourceMetrics.length || sourceMetrics.some(value => typeof value !== 'string' || !value.trim())) {
      issues.push(`Missing source metric for ${metric}`);
    }
    if (!METHODS.has(entry.method)) {
      issues.push(`Invalid provenance method for ${metric}`);
    }
    if (entry.sourceUrl !== undefined) {
      try {
        const parsedUrl = new URL(entry.sourceUrl);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          throw new TypeError('unsupported protocol');
        }
      } catch {
        issues.push(`Invalid source URL for ${metric}`);
      }
    }
  }
  return issues;
}

function getBenchmarkProvenanceCoverage(models) {
  const coverage = { tracked: 0, untracked: 0 };
  for (const model of models) {
    for (const [metric, value] of Object.entries(model.benchmarks || {})) {
      if (!Number.isFinite(value)) continue;
      if (model.benchmarkProvenance?.[metric]) coverage.tracked++;
      else coverage.untracked++;
    }
  }
  return coverage;
}

module.exports = {
  createBenchmarkProvenance,
  validateBenchmarkProvenance,
  getBenchmarkProvenanceCoverage
};
