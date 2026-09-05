const benchmarkCsv = `id,name,provider,quality,costEfficiency,speed,context,reliability,privacy,costPer1M,tokensPerTask,tokenEfficiency,sourceConfidence,benchmarkDate,benchmarkVersion,benchmarkSummary,writingLabel,writingScore,writingSource,writingUrl,codingLabel,codingScore,codingSource,codingUrl,researchLabel,researchScore,researchSource,researchUrl,summarizationLabel,summarizationScore,summarizationSource,summarizationUrl,generalLabel,generalScore,generalSource,generalUrl,extractionLabel,extractionScore,extractionSource,extractionUrl
claude-opus-4,Claude Opus 4,Anthropic,96,60,76,96,95,72,75,35,78,high,2025-05-22,claude-opus-4-v1,"Claude Opus 4 is Anthropic's newest frontier reasoning model and is designed for the highest-end coding, analysis, and planning workloads.","Advanced writing and instruction following",95,"Anthropic Claude Opus 4 release","https://www.anthropic.com/news/claude-opus-4","High-end coding and reasoning",97,"Anthropic Claude Opus 4 release","https://www.anthropic.com/news/claude-opus-4","Research and strategic analysis",96,"Anthropic Claude Opus 4 release","https://www.anthropic.com/news/claude-opus-4","Deep summarization and synthesis",94,"Anthropic Claude Opus 4 release","https://www.anthropic.com/news/claude-opus-4","General frontier performance",96,"Anthropic Claude Opus 4 release","https://www.anthropic.com/news/claude-opus-4","Structured extraction from large complex documents",92,"Anthropic Claude Opus 4 release","https://www.anthropic.com/news/claude-opus-4"
claude-sonnet-4,Claude Sonnet 4,Anthropic,94,71,86,95,93,71,18,42,84,high,2025-05-22,claude-sonnet-4-v1,"Claude Sonnet 4 is Anthropic's newer balanced premium model for coding, reasoning, and production work.","High-quality writing and instruction following",94,"Anthropic Claude Sonnet 4 release","https://www.anthropic.com/news/claude-sonnet-4","Coding and reasoning quality",95,"Anthropic Claude Sonnet 4 release","https://www.anthropic.com/news/claude-sonnet-4","Research and answer synthesis",94,"Anthropic Claude Sonnet 4 release","https://www.anthropic.com/news/claude-sonnet-4","Strong long-form summarization",92,"Anthropic Claude Sonnet 4 release","https://www.anthropic.com/news/claude-sonnet-4","General assistant utility",94,"Anthropic Claude Sonnet 4 release","https://www.anthropic.com/news/claude-sonnet-4","Extraction and structured parsing",90,"Anthropic Claude Sonnet 4 release","https://www.anthropic.com/news/claude-sonnet-4"
openai-o3,O3,OpenAI,94,64,85,91,92,70,40,38,81,high,2025-04-16,o3-v1,"OpenAI's O3 line is among the strongest current reasoning-first models, with premium coding and research performance.","Instruction following and long reasoning",94,"OpenAI o3 launch and release notes","https://openai.com/index/introducing-o3-and-o4-mini/","Advanced code planning and reasoning",96,"OpenAI o3 launch and release notes","https://openai.com/index/introducing-o3-and-o4-mini/","Research-grade reasoning and analysis",95,"OpenAI o3 launch and release notes","https://openai.com/index/introducing-o3-and-o4-mini/","Deep synthesis and summarization",92,"OpenAI o3 launch and release notes","https://openai.com/index/introducing-o3-and-o4-mini/","General reasoning performance",94,"OpenAI o3 launch and release notes","https://openai.com/index/introducing-o3-and-o4-mini/","Structured extraction and document understanding",90,"OpenAI o3 launch and release notes","https://openai.com/index/introducing-o3-and-o4-mini/"
openai-o4-mini,O4 Mini,OpenAI,90,88,97,84,88,74,4,52,92,high,2025-04-16,o4-mini-v1,"O4 Mini is optimized for low latency and strong value, with impressive reasoning-speed tradeoffs for everyday production workloads.","Fast writing and concise instruction following",90,"OpenAI o4 mini release notes","https://openai.com/index/introducing-o3-and-o4-mini/","Rapid code generation and repair",92,"OpenAI o4 mini release notes","https://openai.com/index/introducing-o3-and-o4-mini/","Quick research synthesis",89,"OpenAI o4 mini release notes","https://openai.com/index/introducing-o3-and-o4-mini/","High-speed summarization",91,"OpenAI o4 mini release notes","https://openai.com/index/introducing-o3-and-o4-mini/","General assistant speed/quality balance",90,"OpenAI o4 mini release notes","https://openai.com/index/introducing-o3-and-o4-mini/","Structured extraction at lower latency",87,"OpenAI o4 mini release notes","https://openai.com/index/introducing-o3-and-o4-mini/"
gpt-4.1,GPT-4.1,OpenAI,92,74,88,88,90,72,12,48,86,high,2025-04-14,gpt-4-1-v1,"GPT-4.1 is a newer high-quality general-purpose model with strong coding and long-context performance in production settings.","Instruction following and polished writing",91,"OpenAI GPT-4.1 release notes","https://openai.com/index/gpt-4-1/","Coding and tool-use strength",94,"OpenAI GPT-4.1 release notes","https://openai.com/index/gpt-4-1/","Research quality and reasoning",92,"OpenAI GPT-4.1 release notes","https://openai.com/index/gpt-4-1/","Summarization quality",90,"OpenAI GPT-4.1 release notes","https://openai.com/index/gpt-4-1/","General assistant performance",92,"OpenAI GPT-4.1 release notes","https://openai.com/index/gpt-4-1/","Structured extraction quality",88,"OpenAI GPT-4.1 release notes","https://openai.com/index/gpt-4-1/"
gemini-2-5-pro,Gemini 2.5 Pro,Google,91,73,82,97,90,72,22,44,85,high,2025-06-17,gemini-2-5-pro-v1,"Gemini 2.5 Pro integrates strong multimodal and long-context reasoning capabilities with strong research performance.","Writing and instruction quality",90,"Google Gemini 2.5 Pro official docs","https://ai.google.dev/gemini-api/docs/models","Code and reasoning performance",91,"Google Gemini 2.5 Pro official docs","https://ai.google.dev/gemini-api/docs/models","Long-context research and analysis",94,"Google Gemini 2.5 Pro official docs","https://ai.google.dev/gemini-api/docs/models","Long-document summarization",92,"Google Gemini 2.5 Pro official docs","https://ai.google.dev/gemini-api/docs/models","General assistant quality",91,"Google Gemini 2.5 Pro official docs","https://ai.google.dev/gemini-api/docs/models","Extraction from large documents",93,"Google Gemini 2.5 Pro official docs","https://ai.google.dev/gemini-api/docs/models"
gemini-2-flash,Gemini 2 Flash,Google,84,87,96,82,84,75,1.5,58,91,high,2025-06-17,gemini-2-flash-v1,"Gemini 2 Flash is a more budget-friendly, higher-speed model with strong responsiveness for everyday tasks and high-volume work.","Fast writing and instruction following",84,"Google Gemini 2 Flash release","https://ai.google.dev/gemini-api/docs/models","Quick code generation and auto-completion",82,"Google Gemini 2 Flash release","https://ai.google.dev/gemini-api/docs/models","Research summaries and quick analysis",83,"Google Gemini 2 Flash release","https://ai.google.dev/gemini-api/docs/models","Fast summarization",86,"Google Gemini 2 Flash release","https://ai.google.dev/gemini-api/docs/models","General assistant speed and quality",84,"Google Gemini 2 Flash release","https://ai.google.dev/gemini-api/docs/models","Structured extraction at low latency",81,"Google Gemini 2 Flash release","https://ai.google.dev/gemini-api/docs/models"
claude-3-5-haiku,Claude 3.5 Haiku,Anthropic,82,90,94,80,84,72,1.2,60,93,high,2025-06-20,claude-3-5-haiku-v1,"Claude 3.5 Haiku is a strong low-latency option for everyday tasks, summarization, and cost-sensitive deployments.","Fast writing and editing",83,"Anthropic Claude 3.5 Haiku release","https://www.anthropic.com/news/claude-3-5-haiku","Quick code generation and completion",79,"Anthropic Claude 3.5 Haiku release","https://www.anthropic.com/news/claude-3-5-haiku","Light research and synthesis",80,"Anthropic Claude 3.5 Haiku release","https://www.anthropic.com/news/claude-3-5-haiku","Summarization at speed",88,"Anthropic Claude 3.5 Haiku release","https://www.anthropic.com/news/claude-3-5-haiku","General-purpose assistant work",82,"Anthropic Claude 3.5 Haiku release","https://www.anthropic.com/news/claude-3-5-haiku","Fast extraction on standard documents",78,"Anthropic Claude 3.5 Haiku release","https://www.anthropic.com/news/claude-3-5-haiku"
`;

const taskKeys = ['writing', 'coding', 'research', 'summarization', 'general', 'extraction'];

function parseCsvRow(line) {
  const row = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  row.push(current);
  return row.map((value) => value.trim());
}

function parseBenchmarks(row, index) {
  const tasks = {};

  for (const task of taskKeys) {
    const labelKey = `${task}Label`;
    const scoreKey = `${task}Score`;
    const sourceKey = `${task}Source`;
    const urlKey = `${task}Url`;

    tasks[task] = {
      label: row[index[labelKey]] ?? `${task} benchmark`,
      score: Number(row[index[scoreKey]] ?? 70),
      source: row[index[sourceKey]] ?? 'benchmark source unavailable',
      url: row[index[urlKey]] ?? '#'
    };
  }

  return tasks;
}

function parseBenchmarkCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  const headers = parseCsvRow(lines[0]);
  const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));

  return lines.slice(1).map((line) => {
    const row = parseCsvRow(line);
    const benchmarks = parseBenchmarks(row, headerIndex);

    return {
      id: row[headerIndex.id],
      name: row[headerIndex.name],
      provider: row[headerIndex.provider],
      benchmarkSummary: row[headerIndex.benchmarkSummary],
      quality: Number(row[headerIndex.quality]),
      costEfficiency: Number(row[headerIndex.costEfficiency]),
      speed: Number(row[headerIndex.speed]),
      context: Number(row[headerIndex.context]),
      reliability: Number(row[headerIndex.reliability]),
      privacy: Number(row[headerIndex.privacy]),
      costPer1M: Number(row[headerIndex.costPer1M] ?? 0),
      tokensPerTask: Number(row[headerIndex.tokensPerTask] ?? 0),
      tokenEfficiency: Number(row[headerIndex.tokenEfficiency] ?? 80),
      sourceConfidence: row[headerIndex.sourceConfidence],
      benchmarkDate: row[headerIndex.benchmarkDate],
      benchmarkVersion: row[headerIndex.benchmarkVersion],
      benchmarks,
      sources: [
        { name: row[headerIndex.writingSource], url: row[headerIndex.writingUrl] },
        { name: row[headerIndex.codingSource], url: row[headerIndex.codingUrl] },
        { name: row[headerIndex.researchSource], url: row[headerIndex.researchUrl] },
        { name: row[headerIndex.summarizationSource], url: row[headerIndex.summarizationUrl] },
        { name: row[headerIndex.generalSource], url: row[headerIndex.generalUrl] },
        { name: row[headerIndex.extractionSource], url: row[headerIndex.extractionUrl] }
      ].filter((source) => source.name && source.url)
    };
  });
}

export const models = parseBenchmarkCsv(benchmarkCsv);

for (const model of models) {
  const requiredFields = ['id', 'name', 'provider', 'benchmarkDate', 'benchmarkVersion', 'sourceConfidence'];
  const missingField = requiredFields.find((field) => !model[field]);
  if (missingField || Object.keys(model.benchmarks).length !== taskKeys.length || model.sources.length === 0) {
    throw new Error(`Invalid model record: ${model.id || 'unknown'} (${missingField || 'benchmark/source metadata missing'})`);
  }
}

export const benchmarkSnapshotDate = models
  .map((model) => model.benchmarkDate)
  .sort()
  .at(-1);
export const benchmarkTaskLabels = {
  writing: 'Writing',
  coding: 'Coding',
  research: 'Research',
  summarization: 'Summarization',
  general: 'General assistant work',
  extraction: 'Extraction'
};
