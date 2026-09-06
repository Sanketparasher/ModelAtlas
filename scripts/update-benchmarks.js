import { writeFile } from 'node:fs/promises';

const SOURCES = {
  arena: 'https://lmarena.ai/leaderboard',
  sweBench: 'https://www.swebench.com/index.html'
};

const OUTPUT_FILE = new URL('../src/data/generated-models.js', import.meta.url);

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'ModelAtlas benchmark updater' } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  return response.text();
}

function extractJsonArray(text, marker) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Could not find embedded data marker: ${marker}`);

  const start = text.indexOf('[', markerIndex + marker.length);
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === '[') depth += 1;
    else if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        const raw = text.slice(start, index + 1);
        try {
          return JSON.parse(raw);
        } catch {
          return JSON.parse(raw.replaceAll('\\"', '"').replaceAll('\\\\', '\\'));
        }
      }
    }
  }

  throw new Error(`Could not parse embedded array after marker: ${marker}`);
}

function parseEmbeddedJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(raw.replaceAll('\\"', '"').replaceAll('\\\\', '\\'));
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function providerName(value) {
  if (/anthropic/i.test(value)) return 'Anthropic';
  if (/google|deepmind/i.test(value)) return 'Google';
  if (/openai/i.test(value)) return 'OpenAI';
  if (/meta/i.test(value)) return 'Meta';
  return value || 'Unknown';
}

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

function parseArena(html) {
  const marker = 'leaderboard-snapshots/latest\\",\\"entries\\":';
  const markerIndex = html.indexOf(marker);
  const start = html.indexOf('[', markerIndex + marker.length);
  const end = html.indexOf('],\\"voteCutoffISOString', start);
  if (markerIndex < 0 || start < 0 || end < 0) throw new Error('Could not find current Arena leaderboard snapshot');
  const entries = parseEmbeddedJson(html.slice(start, end + 1));
  const voteCutoff = html.match(/voteCutoffISOString\\":\\"([^\\"]+)/)?.[1] ?? new Date().toISOString();
  const maxRating = Math.max(...entries.map((entry) => entry.rating));
  const minRating = Math.min(...entries.map((entry) => entry.rating));

  return entries.map((entry) => ({
    id: slugify(entry.modelDisplayName || entry.modelKey),
    name: entry.modelDisplayName || entry.modelKey,
    provider: providerName(entry.modelOrganization),
    benchmark: {
      task: 'general',
      value: clamp(((entry.rating - minRating) / (maxRating - minRating || 1)) * 100),
      label: `Chatbot Arena Elo ${Math.round(entry.rating)}`,
      metric: 'normalized_elo',
      source: SOURCES.arena,
      evaluatedAt: voteCutoff.slice(0, 10),
      confidence: entry.votes >= 10000 ? 'high' : 'medium'
    },
    costPer1M: Number(entry.inputPricePerMillion ?? 0),
    contextLength: Number(entry.contextLength ?? 0),
    modelUrl: entry.modelUrl
  }));
}

function parseSweBench(html) {
  const script = html.match(/<script type="application\/json" id="leaderboard-data">\s*([\s\S]*?)\s*<\/script>/)?.[1];
  if (!script) throw new Error('Could not find SWE-bench leaderboard data');

  const boards = JSON.parse(script);
  const verified = boards.find((board) => board.name === 'Verified');
  if (!verified) throw new Error('SWE-bench Verified leaderboard is unavailable');

  return verified.results
    .filter((result) => result.checked && result.per_instance_details)
    .map((result) => {
      const instances = Object.values(result.per_instance_details);
      const resolved = instances.filter((instance) => instance.resolved).length;

      return {
        id: slugify(result.model_display || result.name),
        name: result.model_display || result.name,
        provider: providerName(result.model_org),
        benchmark: {
          task: 'coding',
          value: clamp((resolved / instances.length) * 100),
          label: `SWE-bench Verified ${resolved}/${instances.length} resolved`,
          metric: 'resolved_percent',
          source: 'https://www.swebench.com/verified.html',
          evaluatedAt: result.date,
          confidence: result.checked ? 'high' : 'medium'
        },
        costPer1M: 0,
        modelUrl: result.model_url
      };
    });
}

function mergeModels(arenaModels, sweModels) {
  const byId = new Map();

  for (const entry of [...arenaModels, ...sweModels]) {
    const existing = byId.get(entry.id);
    if (!existing) {
      byId.set(entry.id, {
        id: entry.id,
        name: entry.name,
        provider: entry.provider,
        benchmarks: {},
        sources: [],
        costPer1M: entry.costPer1M,
        contextLength: entry.contextLength ?? 0,
        modelUrl: entry.modelUrl
      });
    }

    const model = byId.get(entry.id);
    model.benchmarks[entry.benchmark.task] = entry.benchmark;
    model.sources.push({ name: entry.benchmark.label, url: entry.benchmark.source });
    if (!model.costPer1M && entry.costPer1M) model.costPer1M = entry.costPer1M;
    if (!model.contextLength && entry.contextLength) model.contextLength = entry.contextLength;
    if (!model.modelUrl && entry.modelUrl) model.modelUrl = entry.modelUrl;
  }

  const mergedModels = [...byId.values()];
  const pricedModels = mergedModels.filter((model) => model.costPer1M > 0);
  const lowestPrice = Math.min(...pricedModels.map((model) => model.costPer1M));
  const highestPrice = Math.max(...pricedModels.map((model) => model.costPer1M));

  return mergedModels.map((model) => ({
    ...model,
    benchmarkVersion: `live-${Object.values(model.benchmarks).map((benchmark) => benchmark.evaluatedAt).sort().at(-1)}`,
    benchmarkDate: Object.values(model.benchmarks).map((benchmark) => benchmark.evaluatedAt).sort().at(-1),
    sourceConfidence: Object.values(model.benchmarks).every((benchmark) => benchmark.confidence === 'high') ? 'high' : 'medium',
    benchmarkSummary: 'Scores fetched from current public benchmark leaderboards.',
    quality: 0,
    costEfficiency: model.costPer1M > 0
      ? clamp(100 - ((model.costPer1M - lowestPrice) / (highestPrice - lowestPrice || 1)) * 100)
      : 0,
    speed: 0,
    context: 0,
    reliability: 0,
    privacy: 0,
    tokenEfficiency: 0,
    privacyAvailable: false
  }));
}

const [arenaHtml, sweBenchHtml] = await Promise.all([
  fetchText(SOURCES.arena),
  fetchText(SOURCES.sweBench)
]);
const models = mergeModels(parseArena(arenaHtml), parseSweBench(sweBenchHtml));
const output = `// Generated by scripts/update-benchmarks.js. Do not edit manually.\nimport { normalizeModel, validateModelCatalog } from './benchmark-schema.js';\n\nconst sourceModels = ${JSON.stringify(models, null, 2)};\nexport const models = sourceModels.map(normalizeModel);\nvalidateModelCatalog(models);\nexport const benchmarkSnapshotDate = models.map((model) => model.benchmarkDate).sort().at(-1);\nexport const benchmarkTaskLabels = { coding: 'Coding', general: 'General assistance' };\n`;

await writeFile(OUTPUT_FILE, output, 'utf8');
console.log(`Fetched ${models.length} models from ${SOURCES.arena} and ${SOURCES.sweBench}.`);