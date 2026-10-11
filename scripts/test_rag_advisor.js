const fs = require('fs');
const path = require('path');
const models = require('../models.js');

const widgetCode = fs.readFileSync(path.join(__dirname, '../chat_widget.js'), 'utf8');

global.window = { MODELS_DATA: models };
global.document = {
  readyState: 'complete',
  createElement: () => ({ setAttribute(){}, addEventListener(){}, appendChild(){}, classList: { add(){}, remove(){} } }),
  body: { appendChild(){} },
  getElementById: () => ({ addEventListener(){}, style: {}, classList: { add(){}, remove(){} } })
};
global.localStorage = { getItem: () => null, setItem: () => null };

const vm = require('vm');
vm.runInThisContext(widgetCode);

const testCases = [
  {
    category: 'Conversational Recommendation - Student',
    query: 'Recommend a free model to summarize 300 page textbooks and explain biology chapters',
    expectCard: true,
    expectTerms: ['Gemini', '1M', 'tokens']
  },
  {
    category: 'Conversational Recommendation - Local Coder',
    query: 'What model should I use for coding on my 16GB RAM laptop offline?',
    expectCard: true,
    expectTerms: ['Qwen', '7B', '8B', 'Free']
  },
  {
    category: 'Conversational Recommendation - Workstation Coder',
    query: 'I have a 64GB Mac Studio and want to run a local open-weights model for refactoring Python code',
    expectCard: true,
    expectTerms: ['DeepSeek R1', 'QwQ', '32B', '70B', 'Open Weights']
  },
  {
    category: 'Conversational Recommendation - High-Scale API',
    query: 'Suggest an API model for high-volume JSON schema validation with sub-400ms latency',
    expectCard: true,
    expectTerms: ['Flash', 'Google', 'Speed']
  },
  {
    category: 'Conversational Recommendation - Sovereign Enterprise',
    query: 'We need an on-premise air-gapped model for corporate legal contract auditing',
    expectCard: true,
    expectTerms: ['DeepSeek R1', '72B', '70B', 'Open Weights']
  },
  {
    category: 'Conversational Recommendation - Long-Form Writer',
    query: 'I am writing a novel and want an AI that avoids corporate clichés and writes natural prose',
    expectCard: true,
    expectTerms: ['Claude', 'Anthropic']
  },
  {
    category: 'Direct Hardware Query',
    query: 'How much VRAM do I need for Llama 3.3 70B?',
    expectCard: false,
    expectTerms: ['40GB', 'Q4', '75GB']
  },
  {
    category: 'DeepSeek R1 Cluster Query',
    query: 'What hardware is needed to run DeepSeek R1 locally?',
    expectCard: false,
    expectTerms: ['671B', 'MoE', 'Unified Memory']
  },
  {
    category: 'Head-to-Head Benchmark Comparison',
    query: 'Compare Claude 3.7 vs OpenAI o3-mini',
    expectCard: false,
    expectTerms: ['Claude 3.7 Sonnet', 'OpenAI o3-mini', 'Arena Elo']
  },
  {
    category: 'Context Window Leaders',
    query: 'Which models have a 1M or 2M token context window?',
    expectCard: false,
    expectTerms: ['Gemini 2.5 Pro', '2,000,000', 'Gemini 2.5 Flash']
  },
  {
    category: 'Free Student Access Guidance',
    query: 'How to use top AI models 100% free as a student without a credit card?',
    expectCard: false,
    expectTerms: ['Google AI Studio', 'DeepSeek', 'Ollama']
  },
  {
    category: 'Token Pricing Calculation',
    query: 'How much does 10 million tokens cost on Gemini 2.5 Flash?',
    expectCard: false,
    expectTerms: ['10 million tokens', 'Gemini 2.5 Flash', '$']
  }
];

console.log('=== RUNNING MODELATLAS RAG ADVISOR TEST SUITE ===\n');

let passed = 0;
testCases.forEach((tc, idx) => {
  const resp = window.ModelAtlasChat.query(tc.query);
  const hasCard = resp.includes('atlas-card-recom');
  const cardMatch = tc.expectCard ? hasCard : !hasCard;
  
  const textClean = resp.replace(/<[^>]+>/g, ' ');
  const termsMatched = tc.expectTerms.some(term => textClean.toLowerCase().includes(term.toLowerCase()));

  const ok = cardMatch && termsMatched;
  if (ok) passed++;

  console.log(`Test ${idx + 1}: [${tc.category}]`);
  console.log(`  Query: "${tc.query}"`);
  console.log(`  Card: ${hasCard} (Expected: ${tc.expectCard}) | Terms: ${termsMatched} (${tc.expectTerms.join(', ')}) -> ${ok ? '✅ PASS' : '❌ FAIL'}`);
  if (!ok) {
    console.log(`  Preview: ${textClean.slice(0, 150)}...`);
  }
});

console.log(`\n=== TEST RESULTS: ${passed} / ${testCases.length} PASSED ===\n`);

// Multi-turn conversational memory tests
console.log('=== MULTI-TURN CONVERSATION MEMORY TESTS ===');
// Turn 1: recommend coding model
const t1 = window.ModelAtlasChat.query('Recommend a model for coding on a 16GB laptop');
const m1 = window.ModelAtlasChat.getMemory().lastRecommendedModel;
console.log(`Turn 1: Recommended ${m1?.name}`);

// Turn 2: pronoun follow-up
const t2 = window.ModelAtlasChat.query('How much VRAM does it need?');
const t2Ok = t2.toLowerCase().includes('vram') && (t2.includes(m1?.name) || t2.includes('5.5GB') || t2.includes('9.5GB') || t2.includes('Small Models'));
console.log(`Turn 2: Follow-up on "it" resolved to ${m1?.name}: ${t2Ok ? '✅ PASS' : '❌ FAIL'}`);

// Turn 3: code snippet for "it"
const t3 = window.ModelAtlasChat.query('Show me python code to run it');
const t3Ok = t3.includes('python') || t3.includes('ollama run') || t3.includes('client');
console.log(`Turn 3: Code generation for ${m1?.name}: ${t3Ok ? '✅ PASS' : '❌ FAIL'}`);
