export const BENCHMARK_SCHEMA_VERSION = '1.0';

export const SOURCE_REGISTRY = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic official documentation',
    type: 'provider',
    usage: 'reference-only'
  },
  lmarena: {
    id: 'lmarena',
    name: 'LMSYS Chatbot Arena leaderboard',
    type: 'leaderboard',
    usage: 'benchmark'
  },
  swebench: {
    id: 'swebench',
    name: 'SWE-bench official leaderboard',
    type: 'benchmark',
    usage: 'benchmark'
  },
  google: {
    id: 'google',
    name: 'Google official documentation',
    type: 'provider',
    usage: 'reference-only'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI official documentation',
    type: 'provider',
    usage: 'reference-only'
  }
};

function sourceIdFromUrl(url) {
  if (url.includes('anthropic.com')) return 'anthropic';
  if (url.includes('google')) return 'google';
  if (url.includes('openai.com')) return 'openai';
  if (url.includes('lmarena.ai')) return 'lmarena';
  if (url.includes('swebench.com')) return 'swebench';
  return 'unknown';
}

function normalizeBenchmark(model, task, benchmark) {
  const sourceUrl = benchmark.url ?? benchmark.source;
  const sourceId = sourceIdFromUrl(sourceUrl);

  return {
    id: `${model.id}:${task}:${model.benchmarkVersion}`,
    modelId: model.id,
    task,
    metric: benchmark.metric ?? 'score',
    value: Number(benchmark.value ?? benchmark.score),
    label: benchmark.label,
    source: {
      id: sourceId,
      name: benchmark.source,
      url: sourceUrl,
      usage: SOURCE_REGISTRY[sourceId]?.usage ?? 'unclassified'
    },
    release: model.benchmarkVersion,
    evaluatedAt: model.benchmarkDate,
    retrievedAt: model.benchmarkDate,
    confidence: model.sourceConfidence
  };
}

export function normalizeModel(model) {
  const benchmarkRecords = Object.entries(model.benchmarks).map(([task, benchmark]) => normalizeBenchmark(model, task, benchmark));

  return {
    ...model,
    schemaVersion: BENCHMARK_SCHEMA_VERSION,
    benchmarkRecords,
    provenance: {
      benchmarkVersion: model.benchmarkVersion,
      evaluatedAt: model.benchmarkDate,
      confidence: model.sourceConfidence,
      sources: benchmarkRecords.map((record) => record.source)
    }
  };
}

export function validateBenchmarkRecord(record) {
  const requiredFields = ['id', 'modelId', 'task', 'metric', 'value', 'release', 'evaluatedAt', 'retrievedAt', 'confidence'];
  const missingField = requiredFields.find((field) => record[field] === undefined || record[field] === null || record[field] === '');

  if (missingField) return `missing ${missingField}`;
  if (!Number.isFinite(record.value) || record.value < 0 || record.value > 100) return 'value must be between 0 and 100';
  if (!record.source?.id || !record.source?.url) return 'source provenance is incomplete';
  if (!['high', 'medium', 'low'].includes(record.confidence)) return 'confidence is invalid';
  return null;
}

export function validateModelCatalog(catalog) {
  if (!Array.isArray(catalog) || catalog.length === 0) {
    throw new Error('Benchmark catalog must contain at least one model');
  }

  const modelIds = new Set();
  const recordIds = new Set();

  for (const model of catalog) {
    if (!model.id || modelIds.has(model.id)) throw new Error(`Duplicate or missing model id: ${model.id || 'unknown'}`);
    modelIds.add(model.id);

    if (!Array.isArray(model.benchmarkRecords) || model.benchmarkRecords.length === 0) {
      throw new Error(`Model ${model.id} has no normalized benchmark records`);
    }

    for (const record of model.benchmarkRecords) {
      const validationError = validateBenchmarkRecord(record);
      if (validationError) throw new Error(`Invalid benchmark ${record.id || 'unknown'}: ${validationError}`);
      if (recordIds.has(record.id)) throw new Error(`Duplicate benchmark id: ${record.id}`);
      recordIds.add(record.id);
    }
  }

  return true;
}