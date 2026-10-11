const fs = require('fs');
const path = require('path');
const models = require('../models.js');

const html = fs.readFileSync(path.join(__dirname, '../finder.html'), 'utf8');
const scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/);

global.window = { MODELS_DATA: models };
global.document = {
  getElementById: () => ({ style: {}, classList: { add(){}, remove(){} }, innerHTML: '', querySelectorAll: () => [], appendChild: () => {} }),
  querySelectorAll: () => [],
  createElement: () => ({ className: '', textContent: '', style: {}, appendChild: () => {} })
};

const vm = require('vm');
const ctx = { window: global.window, document: global.document, console };
vm.createContext(ctx);
vm.runInContext(scriptMatches[1], ctx);

const scenarios = [
  {
    id: 1,
    title: 'Frontier SWE (Repo Refactoring, Cloud API, Extended Thinking, Frontier Budget)',
    expectedBest: 'Claude 3.7 Sonnet / o3-mini',
    ans: { persona: 'coder', coding_scope: 'repo_refactor', env_target: 'cloud_managed', reasoning_mode: 'extended_thinking', budget_level: 'frontier_tier' }
  },
  {
    id: 2,
    title: 'Offline Laptop Dev (Inline Autocomplete, 8GB-16GB VRAM, Instant Speed, $0 Free)',
    expectedBest: 'Qwen 2.5 7B / Granite 8B (Open Weights <= 14B)',
    ans: { persona: 'coder', coding_scope: 'inline_fim', env_target: 'local_consumer', reasoning_mode: 'instant_stream', budget_level: 'zero_cost' }
  },
  {
    id: 3,
    title: 'Local Workstation Engineer (Repo Refactoring, 24GB-64GB VRAM, Extended Thinking, Free)',
    expectedBest: 'Qwen 2.5 32B/72B / Llama 3.3 70B / DeepSeek R1',
    ans: { persona: 'coder', coding_scope: 'repo_refactor', env_target: 'local_workstation', reasoning_mode: 'extended_thinking', budget_level: 'zero_cost' }
  },
  {
    id: 4,
    title: 'High-Scale API SaaS (Strict JSON, Ultra-Fast <400ms TTFT, Standard Context, Sub-$0.50/M)',
    expectedBest: 'Gemini 2.5 Flash / Gemini 2.0 Flash / GPT-4o mini',
    ans: { persona: 'api', api_interface: 'strict_json', latency_sla: 'ultra_fast', context_scale: 'standard_ctx', api_budget: 'scale_budget' }
  },
  {
    id: 5,
    title: 'Complex Agentic Builder (Multi-Tool Calling, 1-3s SLA, Large Context 1M+, Premium Budget)',
    expectedBest: 'Claude 3.7 Sonnet / Gemini 2.5 Pro / GPT-4o',
    ans: { persona: 'api', api_interface: 'multi_tool', latency_sla: 'balanced_sla', context_scale: 'large_ctx', api_budget: 'premium_api' }
  },
  {
    id: 6,
    title: 'Sovereign Air-Gapped Enterprise (Strict On-Prem Air-Gapped, Legal/Audit, 128k Standard, Reserved)',
    expectedBest: 'Llama 3.3 70B / Qwen 2.5 72B / DeepSeek R1 (Strict Open Weights)',
    ans: { persona: 'enterprise', enterprise_compliance: 'air_gapped_onprem', enterprise_workload: 'legal_finance', enterprise_context: 'standard_docs', contracting_tier: 'reserved_ptu' }
  },
  {
    id: 7,
    title: 'Enterprise Archive Discovery (Commercial ZDR, Financial Audit, 2M Giant Context, Flexible)',
    expectedBest: 'Gemini 2.5 Pro (2M context leader) / Claude 3.7 Sonnet',
    ans: { persona: 'enterprise', enterprise_compliance: 'zdr_commercial', enterprise_workload: 'legal_finance', enterprise_context: 'archive_2m', contracting_tier: 'flexible_usage' }
  },
  {
    id: 8,
    title: 'Student Textbook Summarizer (300+ Page Book Summaries, 100% Free Tier, Socratic)',
    expectedBest: 'Gemini 2.5 Flash / Gemini 2.0 Flash (Free 1M-2M Context)',
    ans: { persona: 'student', academic_workload: 'book_summarization', student_budget: 'strictly_free', explanation_style: 'pedagogical_deep' }
  },
  {
    id: 9,
    title: 'STEM Math Olympiad Student (Calculus Proofs & Logic, 100% Free Tier, Step-by-Step)',
    expectedBest: 'DeepSeek R1 / QwQ 32B (MATH-500 Leader, Free)',
    ans: { persona: 'student', academic_workload: 'stem_math_logic', student_budget: 'strictly_free', explanation_style: 'pedagogical_deep' }
  },
  {
    id: 10,
    title: 'Long-Form Book Author (Longform Prose, Anti-AI Clichés, Deep Polish, Premium Pro)',
    expectedBest: 'Claude 3.7 Sonnet / Claude 3.5 Sonnet (Prose Gold Standard)',
    ans: { persona: 'creator', creator_focus: 'longform_prose', voice_nuance: 'avoid_cliches', deliberation_depth: 'deep_polish', creator_budget: 'premium_pro' }
  }
];

const results = [];

scenarios.forEach(s => {
  const scored = models.map(m => ({ model: m, score: ctx.scoreModelDynamic(m, s.ans) }));
  scored.sort((a, b) => b.score - a.score);
  results.push({
    id: s.id,
    title: s.title,
    expected: s.expectedBest,
    top1: scored[0].model.name,
    top1Score: Math.round(scored[0].score),
    top1Provider: scored[0].model.provider,
    top1Price: scored[0].model.pricing,
    top1License: scored[0].model.license,
    top2: scored[1].model.name,
    top2Score: Math.round(scored[1].score),
    top3: scored[2].model.name,
    top3Score: Math.round(scored[2].score)
  });
});

console.log(JSON.stringify(results, null, 2));
