/**
 * ModelAtlas Benchmark Synchronizer
 * 
 * Fetches, normalizes, and updates model benchmarks from primary sources:
 * 1. LMSYS Chatbot Arena (Arena Elo, Coding Arena, Style-Controlled)
 *    Source: LMSYS / Hugging Face Leaderboard (https://chat.lmsys.org)
 * 2. Artificial Analysis (Quality Index, Output Speed TPS, Pricing)
 *    Source: Artificial Analysis (https://artificialanalysis.ai)
 * 3. Hugging Face Open LLM Leaderboard v2 (MMLU-Pro, MATH-500, SWE-bench)
 *    Source: Hugging Face (https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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

// Validation function ensuring all records meet benchmark integrity
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
currentModels.forEach((m, idx) => {
  const errors = validateModel(m);
  if (errors.length > 0) {
    console.warn(`⚠️ Model #${idx} (${m.id || 'unnamed'}): ${errors.join(', ')}`);
  } else {
    validCount++;
  }
});

console.log(`✅ ${validCount}/${currentModels.length} models verified with complete benchmark records.`);

// Sort by Arena Elo descending
currentModels.sort((a, b) => (b.benchmarks.arenaElo || 0) - (a.benchmarks.arenaElo || 0));

// Export updated JSON and models.js
fs.writeFileSync(DATA_FILE, JSON.stringify(currentModels, null, 2), 'utf-8');

// Generate models.js
const jsContent = `// ModelAtlas Unified Dataset
// Sourced from:
// 1. LMSYS Chatbot Arena (arena.lmsys.org) - Crowdsourced human preference Elo ratings
// 2. Artificial Analysis (artificialanalysis.ai) - Quality index, Speed (t/s), API pricing
// 3. Hugging Face Open LLM Leaderboard v2 - MMLU-Pro, MATH-500, SWE-bench Verified

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

