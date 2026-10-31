const fs = require('fs');
const path = require('path');
const vm = require('vm');

const models = require('../models.js');
const finderHtml = fs.readFileSync(path.join(__dirname, '../finder.html'), 'utf8');
const widgetCode = fs.readFileSync(path.join(__dirname, '../chat_widget.js'), 'utf8');

// Set up mock browser environment
global.window = { MODELS_DATA: models };
global.document = {
  readyState: 'complete',
  createElement: () => ({ setAttribute(){}, addEventListener(){}, appendChild(){}, classList: { add(){}, remove(){} }, style: {} }),
  body: { appendChild(){} },
  getElementById: () => ({ addEventListener(){}, style: {}, classList: { add(){}, remove(){} }, innerHTML: '', querySelectorAll: () => [], appendChild: () => {} }),
  querySelectorAll: () => []
};
global.localStorage = { getItem: () => null, setItem: () => null };

// Load finder scripts into context
const finderScriptMatches = finderHtml.match(/<script>([\s\S]*?)<\/script>/);
const finderCtx = {
  window: global.window,
  document: global.document,
  console,
  setTimeout: (fn) => fn(),
  scrollTo: () => {}
};
vm.createContext(finderCtx);
vm.runInContext(finderScriptMatches[1], finderCtx);

// Load chat widget
vm.runInThisContext(widgetCode);

console.log('=== MODELATLAS DEEP CUSTOMER PERSONA AUDIT ===\n');

const personas = [
  {
    name: 'Alex',
    role: 'Senior AI Engineer & Tech Lead',
    archetype: 'Developer / High-Scale API',
    situation: 'Building an autonomous agent with multi-tool calling and terminal execution. Evaluating token costs for 100M tokens/month with prompt caching, sub-400ms TTFT, and SWE-bench rankings.',
    finderInput: {
      persona: 'coder',
      coding_scope: 'agentic_loop',
      env_target: 'cloud_managed',
      reasoning_mode: 'extended_thinking',
      budget_level: 'frontier_tier'
    },
    advisorQueries: [
      'What model should I use for autonomous agentic loops with bash terminal execution and multi-tool calling?',
      'If I send 100,000 requests per day with 1,000 tokens per request, how much will it cost on Claude 3.7 Sonnet vs Gemini 2.5 Flash?',
      'Does ModelAtlas support prompt caching discounts for repetitive system instructions?'
    ]
  },
  {
    name: 'Priya',
    role: 'Non-Technical Solo Founder & Small Business Owner',
    archetype: 'Everyday Assistant / Productive Generalist',
    situation: 'Needs an AI co-pilot to write marketing emails, draft landing page text, brainstorm sales strategies, and organize her daily schedule. Has no technical background, no local GPU, and cannot spend $200/mo.',
    finderInput: {
      persona: 'general',
      general_use: 'all_rounder',
      response_speed: 'fast_chat',
      general_budget: 'free_everyday',
      platform_pref: 'web_portal'
    },
    advisorQueries: [
      'I do not know how to code, what is the best free AI to help me write emails and plan my small business?',
      'What is the best alternative to ChatGPT plus that does not cost 20 dollars?',
      'How do I use this model? Do I need to install Python or is there a simple website?'
    ]
  },
  {
    name: 'Marcus',
    role: 'Enterprise CISO & Compliance Director',
    archetype: 'Enterprise IT Decision Maker',
    situation: 'Auditing LLMs for medical records and contract risk. Strictly requires HIPAA BAA, SOC-2 Type II, Zero Data Retention (ZDR), or fully sovereign on-premises air-gapped deployment.',
    finderInput: {
      persona: 'enterprise',
      enterprise_compliance: 'air_gapped_onprem',
      enterprise_workload: 'legal_finance',
      enterprise_context: 'standard_docs',
      contracting_tier: 'reserved_ptu'
    },
    advisorQueries: [
      'We need an on-premise air-gapped model for corporate legal contract auditing without internet access',
      'What are the Zero Data Retention and HIPAA compliance terms for Claude 3.7 Sonnet and GPT-4o?',
      'What is the difference between MIT licensed models like DeepSeek R1 and Meta Llama community license for enterprise commercial use?'
    ]
  },
  {
    name: 'Zack',
    role: 'University Student (CS & Math Major)',
    archetype: 'Student & Academic Researcher',
    situation: 'Studying for algorithms and calculus exams. Needs step-by-step Socratic math proofs and textbook chapter summaries. Has $0 budget and an 8GB RAM student laptop.',
    finderInput: {
      persona: 'student',
      academic_workload: 'stem_math_logic',
      student_budget: 'strictly_free',
      explanation_style: 'pedagogical_deep'
    },
    advisorQueries: [
      'I need a 100% free AI model for step-by-step calculus proofs and algorithms homework tutoring',
      'How to use top AI models 100% free as a student without a credit card?',
      'Can you generate 5 sample practice exam questions on Dijkstra algorithm with answer keys?'
    ]
  },
  {
    name: 'Elena',
    role: 'Freelance Content Strategist & Copywriter',
    archetype: 'Content Creator & Knowledge Worker',
    situation: 'Writing long-form thought leadership and brand articles. Hates AI clichés ("in today\'s fast-paced world", "delve", "tapestry"). Willing to pay $20/month for authentic voice and prose flow.',
    finderInput: {
      persona: 'creator',
      creator_focus: 'longform_prose',
      voice_nuance: 'avoid_cliches',
      deliberation_depth: 'deep_polish',
      creator_budget: 'premium_pro'
    },
    advisorQueries: [
      'I am writing a longform book and want an AI that avoids corporate clichés and writes in a natural human voice',
      'How to prompt Claude to avoid AI clichés like delve and tapestry?',
      'Compare Claude 3.7 vs GPT-4o for creative storytelling and voice cadence'
    ]
  },
  {
    name: 'David',
    role: 'Self-Hoster & Homelab Enthusiast',
    archetype: 'Local LLM Power User',
    situation: 'Owns a MacBook Pro M3 Max (64GB RAM) and an RTX 4090 desktop. Wants to self-host open-weights models offline via Ollama and vLLM with zero cloud dependency.',
    finderInput: {
      persona: 'coder',
      coding_scope: 'repo_refactor',
      env_target: 'local_workstation',
      reasoning_mode: 'extended_thinking',
      budget_level: 'zero_cost'
    },
    advisorQueries: [
      'I have a 64GB Mac Studio and want to run a local open-weights model for refactoring Python code',
      'What hardware and VRAM do I need for Llama 3.3 70B?',
      'How does KV cache overhead affect VRAM when running 128k context locally?'
    ]
  }
];

const auditResults = [];

personas.forEach(p => {
  console.log(`\n======================================================`);
  console.log(`👤 PERSONA: ${p.name} (${p.role})`);
  console.log(`📌 Archetype: ${p.archetype}`);
  console.log(`📝 Situation: ${p.situation}`);
  console.log(`------------------------------------------------------`);

  // 1. Finder Questionnaire Scoring Test
  const scored = models.map(m => ({ model: m, score: finderCtx.scoreModelDynamic(m, p.finderInput) }));
  scored.sort((a, b) => b.score - a.score);

  const top1 = scored[0].model;
  const top2 = scored[1].model;
  const top3 = scored[2].model;

  console.log(`🏆 Finder Recommendation:`);
  console.log(`   #1: ${top1.name} (${top1.provider}) - Score: ${Math.round(scored[0].score)} | Pricing: ${top1.pricing} | License: ${top1.license}`);
  console.log(`   #2: ${top2.name} (${top2.provider}) - Score: ${Math.round(scored[1].score)}`);
  console.log(`   #3: ${top3.name} (${top3.provider}) - Score: ${Math.round(scored[2].score)}`);

  // 2. AI Advisor Queries Test
  console.log(`\n💬 AI Advisor Conversational Responses:`);
  const advisorResponses = [];

  p.advisorQueries.forEach((q, qIdx) => {
    const rawResp = window.ModelAtlasChat.query(q);
    const textClean = rawResp.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const isCard = rawResp.includes('atlas-card-recom');
    const isWidget = rawResp.includes('atlas-widget-card');
    const preview = textClean.slice(0, 180) + '...';
    console.log(`   Q${qIdx + 1}: "${q}"`);
    console.log(`      Card: ${isCard} | Widget: ${isWidget}`);
    console.log(`      Snippet: ${preview}`);
    advisorResponses.push({ query: q, hasCard: isCard, hasWidget: isWidget, preview, fullResp: rawResp });
  });

  auditResults.push({
    persona: p.name,
    role: p.role,
    top1: top1.name,
    top2: top2.name,
    advisorResponses
  });
});

fs.writeFileSync(path.join(__dirname, 'persona_audit_output.json'), JSON.stringify(auditResults, null, 2));
console.log('\n=== AUDIT COMPLETE: Stored in persona_audit_output.json ===');
