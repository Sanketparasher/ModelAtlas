import { models } from '../data/models.js';

export const PRIVACY_REQUIRED_THRESHOLD = 72;

export function getLeaderboard(task = 'coding') {
  return models
    .map((model) => {
      const benchmark = model.benchmarks?.[task] ?? { score: 70, label: `${task} benchmark` };

      return {
        id: model.id,
        name: model.name,
        provider: model.provider,
        benchmark,
        benchmarkDate: model.benchmarkDate,
        benchmarkVersion: model.benchmarkVersion,
        sourceConfidence: model.sourceConfidence,
        score: Number(benchmark.score.toFixed(2))
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function getScenarioComparison(task = 'coding') {
  const ranked = models.map((model) => {
    const benchmark = model.benchmarks?.[task] ?? { score: 70, label: `${task} benchmark` };

    const valueScore = model.quality * 0.55 + model.costEfficiency * 0.45 + benchmark.score * 0.35;
    const budgetScore = model.costEfficiency * 0.8 + model.quality * 0.25 + benchmark.score * 0.2;
    const speedScore = model.speed * 0.7 + benchmark.score * 0.3 + model.reliability * 0.15;
    const longContextScore = model.context * 0.75 + benchmark.score * 0.25 + model.quality * 0.1;
    const privacyScore = model.privacy * 0.7 + model.reliability * 0.25 + benchmark.score * 0.1;
    const tokenEfficiencyScore = model.tokenEfficiency * 0.9 + benchmark.score * 0.25 + model.costEfficiency * 0.15;

    return {
      id: model.id,
      name: model.name,
      provider: model.provider,
      benchmark,
      valueScore,
      budgetScore,
      speedScore,
      longContextScore,
      privacyScore,
      tokenEfficiencyScore,
      reason: `${model.name} balances task quality with cost, speed, and context needs.`
    };
  });

  const pickBest = (field, reason) => {
    const winner = [...ranked].sort((a, b) => b[field] - a[field])[0];
    return {
      ...winner,
      reason
    };
  };

  return {
    bestValue: pickBest('valueScore', 'Best overall value for quality-per-cost tradeoff.'),
    bestBudget: pickBest('budgetScore', 'Strongest cost-effective choice when low spend matters more.'),
    bestSpeed: pickBest('speedScore', 'Fastest choice when latency matters most.'),
    bestLongContext: pickBest('longContextScore', 'Best long-context performance for large documents and codebases.'),
    bestPrivacy: pickBest('privacyScore', 'Best fit when compliance and privacy are important.'),
    bestTokenEfficiency: pickBest('tokenEfficiencyScore', 'Best token efficiency for reducing spend and increasing output density.'),
    task
  };
}

export function getCostComparison() {
  return [...models]
    .map((model) => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      costPer1M: Number(model.costPer1M ?? 0),
      tokenEfficiency: Number(model.tokenEfficiency ?? 0),
      benchmarkDate: model.benchmarkDate,
      benchmarkVersion: model.benchmarkVersion
    }))
    .sort((a, b) => a.costPer1M - b.costPer1M);
}

export function getBestByUseCase() {
  const taskOrder = [
    { key: 'writing', label: 'Writing' },
    { key: 'coding', label: 'Coding' },
    { key: 'research', label: 'Research' },
    { key: 'summarization', label: 'Summarization' },
    { key: 'general', label: 'General assistance' },
    { key: 'extraction', label: 'Extraction' }
  ];

  return taskOrder.map(({ key, label }) => {
    const bestModel = [...models]
      .map((model) => ({
        ...model,
        benchmark: model.benchmarks?.[key] ?? { score: 70 }
      }))
      .sort((a, b) => (b.benchmark.score + b.quality + b.tokenEfficiency) - (a.benchmark.score + a.quality + a.tokenEfficiency))[0];

    return {
      task: key,
      label,
      model: bestModel.name,
      provider: bestModel.provider,
      benchmarkScore: bestModel.benchmark.score
    };
  });
}

export function getNewestVsCheapestVsFastest() {
  const newest = [...models].sort((a, b) => new Date(b.benchmarkDate) - new Date(a.benchmarkDate))[0];
  const cheapest = [...models].sort((a, b) => (a.costPer1M ?? 0) - (b.costPer1M ?? 0))[0];
  const fastest = [...models].sort((a, b) => (b.speed ?? 0) - (a.speed ?? 0))[0];

  return {
    newest,
    cheapest,
    fastest,
    summary: {
      newestLabel: newest.name,
      cheapestLabel: cheapest.name,
      fastestLabel: fastest.name
    }
  };
}

export function getDecisionGuide(primary, budget, premium, task) {
  const taskText = {
    writing: 'writing and content creation',
    coding: 'coding, debugging, and software work',
    research: 'research synthesis and analysis',
    summarization: 'summarization and document distillation',
    general: 'general assistant workflows',
    extraction: 'structured extraction and document parsing'
  };

  return {
    primary: {
      name: primary.name,
      useWhen: `${primary.name} is the right choice when you need the strongest fit for ${taskText[task] || 'this workflow'} and can afford the premium quality tradeoff.`,
      avoidWhen: `Avoid ${primary.name} when your work is highly cost-sensitive, latency-sensitive, or you can get a good result from a smaller model with fewer tokens.`
    },
    budgetChoice: {
      name: budget.name,
      useWhen: `Use ${budget.name} when you want the lowest-cost option that still keeps quality high for ${taskText[task] || 'this workflow'}.`,
      avoidWhen: `Avoid ${budget.name} when quality or deep reasoning is the highest priority and the task requires frontier-level performance.`
    },
    premiumOption: {
      name: premium.name,
      useWhen: `Use ${premium.name} when you need the strongest quality, reasoning depth, and long-context handling for premium work.`,
      avoidWhen: `Avoid ${premium.name} when the task is routine, repetitive, or budget constrained and a smaller model can do the job at lower cost.`
    }
  };
}

function getTaskModifierProfile(task, formValues) {
  const profile = {
    quality: 1,
    cost: 1,
    speed: 1,
    context: 1,
    reliability: 1,
    privacy: 1
  };

  if (task === 'coding') {
    const codebaseSize = formValues.codebase_size || 'medium';
    const toolUse = formValues.tool_use || 'basic';
    const validation = formValues.validation || 'balanced';

    if (codebaseSize === 'large') {
      profile.context = 1.18;
      profile.quality = 1.12;
      profile.reliability = 1.1;
    } else if (codebaseSize === 'small') {
      profile.speed = 1.12;
      profile.cost = 1.08;
    }

    if (toolUse === 'deep' || toolUse === 'agentic') {
      profile.quality = 1.2;
      profile.context = 1.14;
      profile.reliability = 1.12;
    }

    if (validation === 'strict') {
      profile.reliability = 1.22;
      profile.quality = 1.1;
    } else if (validation === 'light') {
      profile.speed = 1.16;
      profile.cost = 1.1;
    }
  }

  if (task === 'research') {
    const sourceVolume = formValues.source_volume || 'medium';
    const factChecking = formValues.fact_checking || 'preferred';
    const researchMode = formValues.research_mode || 'fact_checking';

    if (sourceVolume === 'many') {
      profile.context = 1.2;
      profile.reliability = 1.14;
    }

    if (factChecking === 'essential') {
      profile.reliability = 1.24;
      profile.quality = 1.12;
    } else if (factChecking === 'not_required') {
      profile.speed = 1.12;
      profile.cost = 1.08;
    }

    if (researchMode === 'literature_review' || researchMode === 'data_extraction') {
      profile.context = 1.18;
      profile.quality = 1.1;
    }
  }

  if (task === 'writing') {
    const outputLength = formValues.output_length || 'medium';
    const writingStyle = formValues.writing_style || 'technical';

    if (outputLength === 'long') {
      profile.quality = 1.18;
      profile.context = 1.14;
    } else if (outputLength === 'short') {
      profile.speed = 1.14;
      profile.cost = 1.08;
    }

    if (writingStyle === 'technical' || writingStyle === 'marketing') {
      profile.quality = 1.12;
      profile.reliability = 1.08;
    }
  }

  if (task === 'summarization') {
    const documentVolume = formValues.document_volume || 'medium';
    const summaryDepth = formValues.summary_depth || 'balanced';

    if (documentVolume === 'large') {
      profile.context = 1.18;
      profile.quality = 1.12;
    }

    if (summaryDepth === 'detailed') {
      profile.quality = 1.16;
      profile.reliability = 1.1;
    } else if (summaryDepth === 'brief') {
      profile.speed = 1.14;
      profile.cost = 1.08;
    }
  }

  if (task === 'general') {
    const automationLevel = formValues.automation_level || 'medium';
    const assistantUsage = formValues.assistant_usage || 'structured';

    if (automationLevel === 'high') {
      profile.speed = 1.12;
      profile.reliability = 1.08;
    }

    if (assistantUsage === 'daily') {
      profile.cost = 1.1;
      profile.speed = 1.08;
    }
  }

  if (task === 'extraction') {
    const precision = formValues.extraction_precision || 'high';
    const documentType = formValues.document_type || 'reports';

    if (precision === 'critical') {
      profile.reliability = 1.24;
      profile.quality = 1.14;
    } else if (precision === 'standard') {
      profile.speed = 1.12;
      profile.cost = 1.08;
    }

    if (documentType === 'structured') {
      profile.context = 1.1;
      profile.reliability = 1.08;
    }
  }

  if (formValues.input_type === 'multimodal') {
    profile.quality = 1.08;
    profile.context = 1.08;
  }

  if (formValues.output_format === 'structured') {
    profile.reliability = 1.14;
    profile.quality = 1.06;
  }

  if (formValues.deployment === 'controlled' || formValues.deployment === 'local') {
    profile.privacy = 1.18;
    profile.reliability = 1.06;
  }

  return profile;
}

export function getRecommendation(formValues) {
  const task = formValues.task || 'coding';
  const priority = formValues.priority || 'balanced';
  const speed = formValues.speed || 'medium';
  const context = formValues.context || 'medium';
  const privacy = formValues.privacy || 'preferred';
  const taskModifiers = getTaskModifierProfile(task, formValues);

  const priorityBias = {
    quality: { quality: 1.3, costEfficiency: 0.8 },
    balanced: { quality: 1.1, costEfficiency: 1.05 },
    cost: { quality: 0.9, costEfficiency: 1.4 }
  };

  const speedBias = {
    high: 1.25,
    medium: 1.1,
    low: 0.9
  };

  const contextBias = {
    short: 0.9,
    medium: 1.0,
    long: 1.2
  };

  const privacyBias = {
    required: 1.3,
    preferred: 1.1,
    'not-important': 0.9
  };

  const eligibleModels = privacy === 'required'
    ? models.filter((model) => model.privacy >= PRIVACY_REQUIRED_THRESHOLD)
    : models;
  const scoringModels = eligibleModels.length > 0 ? eligibleModels : models;

  const scored = scoringModels.map((model) => {
    const benchmarkEntry = model.benchmarks?.[task] ?? { score: 70, label: 'benchmark mix' };
    const taskFit = benchmarkEntry.score / 20;
    const qualityScore = model.quality / 20;
    const costScore = model.costEfficiency / 20;
    const speedScore = model.speed / 20;
    const contextScore = model.context / 20;
    const reliability = model.reliability / 20;
    const privacyScore = model.privacy / 20;

    const deepTaskProfiles = {
      coding: ['large', 'deep', 'strict'],
      research: ['many', 'essential'],
      writing: ['long', 'technical'],
      summarization: ['large', 'detailed'],
      extraction: ['critical', 'structured']
    };

    let deepWorkPenalty = 1;
    const activeProfile = deepTaskProfiles[task] ?? [];

    if (
      task === 'coding' &&
      formValues.codebase_size === 'large' &&
      (formValues.tool_use === 'deep' || formValues.tool_use === 'agentic') &&
      formValues.validation === 'strict'
    ) {
      deepWorkPenalty *= model.context < 90 ? 0.82 : 1;
      deepWorkPenalty *= model.reliability < 90 ? 0.8 : 1;
      deepWorkPenalty *= model.quality < 90 ? 0.78 : 1;
      deepWorkPenalty *= model.id.includes('mini') || model.id.includes('haiku') ? 0.7 : 1;
    }

    if (
      task === 'research' &&
      (formValues.source_volume === 'many' || formValues.fact_checking === 'essential')
    ) {
      deepWorkPenalty *= model.context < 90 ? 0.8 : 1;
      deepWorkPenalty *= model.reliability < 90 ? 0.82 : 1;
      deepWorkPenalty *= model.quality < 90 ? 0.78 : 1;
      deepWorkPenalty *= model.id.includes('mini') || model.id.includes('haiku') ? 0.7 : 1;
    }

    if (
      task === 'writing' &&
      formValues.output_length === 'long' &&
      (formValues.writing_style === 'technical' || formValues.writing_style === 'marketing')
    ) {
      deepWorkPenalty *= model.context < 90 ? 0.84 : 1;
      deepWorkPenalty *= model.reliability < 90 ? 0.82 : 1;
      deepWorkPenalty *= model.quality < 90 ? 0.8 : 1;
      deepWorkPenalty *= model.id.includes('mini') || model.id.includes('haiku') ? 0.72 : 1;
    }

    if (
      task === 'summarization' &&
      formValues.document_volume === 'large' &&
      formValues.summary_depth === 'detailed'
    ) {
      deepWorkPenalty *= model.context < 90 ? 0.8 : 1;
      deepWorkPenalty *= model.reliability < 90 ? 0.82 : 1;
      deepWorkPenalty *= model.quality < 90 ? 0.8 : 1;
      deepWorkPenalty *= model.id.includes('mini') || model.id.includes('haiku') ? 0.72 : 1;
    }

    if (
      task === 'extraction' &&
      formValues.extraction_precision === 'critical' &&
      formValues.document_type === 'structured'
    ) {
      deepWorkPenalty *= model.reliability < 90 ? 0.8 : 1;
      deepWorkPenalty *= model.quality < 90 ? 0.78 : 1;
      deepWorkPenalty *= model.context < 90 ? 0.82 : 1;
      deepWorkPenalty *= model.id.includes('mini') || model.id.includes('haiku') ? 0.7 : 1;
    }

    const score =
      (taskFit * 35 +
      qualityScore * 25 * (priorityBias[priority]?.quality ?? 1) * (taskModifiers.quality ?? 1) +
      costScore * 15 * (priorityBias[priority]?.costEfficiency ?? 1) * (taskModifiers.cost ?? 1) +
      speedScore * 10 * (speedBias[speed] ?? 1) * (taskModifiers.speed ?? 1) +
      contextScore * 10 * (contextBias[context] ?? 1) * (taskModifiers.context ?? 1) +
      reliability * 5 * (taskModifiers.reliability ?? 1) +
      privacyScore * 5 * (privacyBias[privacy] ?? 1) * (taskModifiers.privacy ?? 1)) * deepWorkPenalty;

    return {
      id: model.id,
      name: model.name,
      provider: model.provider,
      benchmark: benchmarkEntry,
      benchmarkDate: model.benchmarkDate,
      benchmarkVersion: model.benchmarkVersion,
      sourceConfidence: model.sourceConfidence,
      score: Number(score.toFixed(2)),
      scoreBreakdown: {
        taskFit: Number((taskFit * 35).toFixed(2)),
        quality: Number((qualityScore * 25 * (priorityBias[priority]?.quality ?? 1) * (taskModifiers.quality ?? 1)).toFixed(2)),
        cost: Number((costScore * 15 * (priorityBias[priority]?.costEfficiency ?? 1) * (taskModifiers.cost ?? 1)).toFixed(2)),
        speed: Number((speedScore * 10 * (speedBias[speed] ?? 1) * (taskModifiers.speed ?? 1)).toFixed(2)),
        context: Number((contextScore * 10 * (contextBias[context] ?? 1) * (taskModifiers.context ?? 1)).toFixed(2)),
        reliability: Number((reliability * 5 * (taskModifiers.reliability ?? 1)).toFixed(2)),
        privacy: Number((privacyScore * 5 * (privacyBias[privacy] ?? 1) * (taskModifiers.privacy ?? 1)).toFixed(2))
      }
    };
  });

  const ranked = [...scored].sort((a, b) => b.score - a.score);
  const scenarioComparison = getScenarioComparison(task);
  const costComparison = getCostComparison();
  const bestByUseCase = getBestByUseCase();
  const newestVsCheapestVsFastest = getNewestVsCheapestVsFastest();
  const budget = [...ranked].sort((a, b) => b.score - a.score).find((item) => item.id.includes('mini') || item.id.includes('haiku') || item.id.includes('mistral')) ?? ranked[1] ?? ranked[0];
  const premium = [...models].sort((a, b) => b.quality - a.quality)[0];
  const decisionGuide = getDecisionGuide(ranked[0], budget, premium, task);

  return {
    primary: ranked[0],
    budget,
    fast: [...ranked].sort((a, b) => b.score - a.score).find((item) => item.id.includes('mini') || item.id.includes('haiku')) ?? ranked[1],
    fallback: ranked[ranked.length - 1],
    ranked,
    scenarioComparison,
    costComparison,
    bestByUseCase,
    newestVsCheapestVsFastest,
    decisionGuide,
    eligibleModelCount: eligibleModels.length,
    privacyConstraintApplied: privacy === 'required',
    explanation: buildExplanation(task, priority, speed, context, privacy, ranked, scenarioComparison)
  };
}

function buildExplanation(task, priority, speed, context, privacy, ranked, scenarioComparison) {
  const top = ranked[0];
  const benchmarkInfo = top.benchmark ?? { label: 'benchmark mix', score: 70 };
  const taskText = {
    writing: 'writing quality and clarity',
    coding: 'coding strength and reasoning',
    research: 'research synthesis and analysis',
    summarization: 'summarization and extraction quality',
    general: 'general-purpose assistant performance',
    extraction: 'structured extraction and document processing'
  };

  const priorityText = {
    quality: 'quality is weighted most heavily',
    balanced: 'quality and cost are balanced',
    cost: 'cost efficiency is prioritized'
  };

  const speedText = {
    high: 'speed is a major requirement',
    medium: 'speed matters but is not critical',
    low: 'speed is less important than quality'
  };

  const contextText = {
    short: 'short input work is the main need',
    medium: 'medium-length context is sufficient',
    long: 'long-context handling is important'
  };

  return `${top.name} is the best fit because its ${benchmarkInfo.label} benchmark is ${benchmarkInfo.score}/100 for ${taskText[task] || 'this task'}, and it wins the weighted comparison when ${priorityText[priority] || 'a balanced setup'} is applied. ${speedText[speed] || 'speed is considered'} and ${contextText[context] || 'context is included in the decision'}. For budget-sensitive work, ${scenarioComparison.bestBudget.name} is the best cost-effective alternative; for long-context workloads, ${scenarioComparison.bestLongContext.name} is the strongest contextual fit; for lower token usage, ${scenarioComparison.bestTokenEfficiency.name} is the most efficient model; and ${scenarioComparison.bestSpeed.name} is the speed-first option. This recommendation is benchmark-driven with ${top.sourceConfidence || 'medium'} source confidence, benchmark version ${top.benchmarkVersion || 'unknown'}, and benchmark date ${top.benchmarkDate || 'unknown'}.`;
}
