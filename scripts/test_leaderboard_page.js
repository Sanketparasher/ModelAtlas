const fs = require('fs');
const path = require('path');

// Read leaderboard.html
const htmlPath = path.join(__dirname, '..', 'leaderboard.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Check that the 8 exact categories are present verbatim in the file
const EXPECTED_CATEGORIES = [
  'Best coding models',
  'Best reasoning models',
  'Best models for tool use',
  'Best long-context models',
  'Best open-weight models',
  'Best local models by hardware class',
  'Best value models',
  'Best models for writing and research'
];

console.log('=== VERIFYING LEADERBOARD HTML CONFORMANCE ===');

let allPassed = true;
EXPECTED_CATEGORIES.forEach(cat => {
  const hasCat = htmlContent.includes(cat);
  console.log(`Checking category title "${cat}":`, hasCat ? '✅ FOUND' : '❌ MISSING');
  if (!hasCat) allPassed = false;
});

// Check key features
const FEATURES = [
  { name: 'Category Explorer button', term: 'viewBtnExplorer' },
  { name: 'All 8 Categories Digest button', term: 'viewBtnDigest' },
  { name: 'Hardware Selector card', term: 'hwSelectorCard' },
  { name: 'Podium Champions grid', term: 'podiumGrid' },
  { name: 'Ollama 1-click copy support', term: 'ollama run' },
  { name: 'CSV export', term: 'exportCsvBtn' },
  { name: 'JSON export', term: 'exportJsonBtn' },
  { name: 'Chat Widget integration', term: 'chat_widget.js' }
];

console.log('\n=== VERIFYING INTERACTIVE COMPONENTS ===');
FEATURES.forEach(f => {
  const hasFeature = htmlContent.includes(f.term);
  console.log(`Checking feature "${f.name}":`, hasFeature ? '✅ FOUND' : '❌ MISSING');
  if (!hasFeature) allPassed = false;
});

// Load models and test category champions
const models = require('../models.js');

function isObsoleteLegacy(m) {
  const text = ((m.name || '') + ' ' + (m.id || '')).trim();
  return /\b(OpenChat|Starling|WizardLM|Llama-?2|SOLAR|Qwen1\.5|Qwen2(?![-.]?5)|Qwen-[0-9]+[bB]|NV-Llama|Vicuna|Guanaco|MPT|ChatGLM|Zephyr|Tulu|OpenAssistant|Mistral-Medium|Mixtral-8x7B|Mistral-7B|GPT-[34].*-(0314|0613|0301)|Claude-[12]|Claude-Instant)\b/i.test(text);
}

function getEffectiveElo(m) {
  const raw = m.benchmarks?.arenaElo;
  if (raw == null) return 0;
  let elo = raw;
  if (isObsoleteLegacy(m)) elo -= 250;
  return elo;
}

function getEffectiveCoding(m) {
  const raw = m.benchmarks?.arenaCoding;
  if (raw == null) return 0;
  let coding = raw;
  if (isObsoleteLegacy(m)) coding -= 250;
  return coding;
}

console.log('\n=== VERIFYING TOP 3 CHAMPIONS FOR ALL 8 DISCIPLINES ===');

const CATEGORIES = {
  coding: {
    title: 'Best coding models',
    filter: (m) => !isObsoleteLegacy(m) && ((m.tags && m.tags.includes('coding')) || m.id.includes('coder') || (m.benchmarks?.arenaCoding >= 1260) || m.benchmarks?.sweBench),
    sort: (a, b) => {
      const sweA = (a.benchmarks?.sweBench || 0) * 15;
      const sweB = (b.benchmarks?.sweBench || 0) * 15;
      const scoreA = (a.id.includes('coder') ? 60 : 0) + (a.tags?.includes('coding') ? 40 : 0) + sweA + getEffectiveCoding(a);
      const scoreB = (b.id.includes('coder') ? 60 : 0) + (b.tags?.includes('coding') ? 40 : 0) + sweB + getEffectiveCoding(b);
      return scoreB - scoreA;
    }
  },
  reasoning: {
    title: 'Best reasoning models',
    filter: (m) => !isObsoleteLegacy(m) && ((m.tags && m.tags.includes('reasoning')) || m.id.includes('r1') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('qwq')),
    sort: (a, b) => getEffectiveElo(b) - getEffectiveElo(a)
  },
  tool_use: {
    title: 'Best models for tool use',
    filter: (m) => !isObsoleteLegacy(m) && m.benchmarks?.arenaElo != null,
    sort: (a, b) => {
      const provScore = m => ['Anthropic', 'OpenAI', 'Google'].includes(m.provider) ? 40 : (m.license === 'open_weights' ? 15 : 0);
      const scoreA = (a.benchmarks?.bfcl || (a.scores?.reliability || 80) * 0.9) * 12 + provScore(a) + (a.benchmarks?.sweBench || 0) * 8 + getEffectiveElo(a);
      const scoreB = (b.benchmarks?.bfcl || (b.scores?.reliability || 80) * 0.9) * 12 + provScore(b) + (b.benchmarks?.sweBench || 0) * 8 + getEffectiveElo(b);
      return scoreB - scoreA;
    }
  },
  long_context: {
    title: 'Best long-context models',
    filter: (m) => !isObsoleteLegacy(m) && (m.contextTokens || 0) >= 128000,
    sort: (a, b) => (b.contextTokens || 0) - (a.contextTokens || 0) || getEffectiveElo(b) - getEffectiveElo(a)
  },
  open_weights: {
    title: 'Best open-weight models',
    filter: (m) => !isObsoleteLegacy(m) && m.license === 'open_weights',
    sort: (a, b) => getEffectiveElo(b) - getEffectiveElo(a)
  },
  local_hardware: {
    title: 'Best local models by hardware class',
    filter: (m) => !isObsoleteLegacy(m) && m.license === 'open_weights',
    sort: (a, b) => getEffectiveElo(b) - getEffectiveElo(a)
  },
  value: {
    title: 'Best value models',
    filter: (m) => !isObsoleteLegacy(m) && (m.inputPrice !== undefined || m.license === 'open_weights'),
    sort: (a, b) => {
      const rateA = a.license === 'open_weights' ? 0.05 : Math.max(0.10, (a.inputPrice * 0.75 + a.outputPrice * 0.25));
      const rateB = b.license === 'open_weights' ? 0.05 : Math.max(0.10, (b.inputPrice * 0.75 + b.outputPrice * 0.25));
      const valA = getEffectiveElo(a) / Math.pow(rateA, 0.4);
      const valB = getEffectiveElo(b) / Math.pow(rateB, 0.4);
      return valB - valA;
    }
  },
  writing_research: {
    title: 'Best models for writing and research',
    filter: (m) => !isObsoleteLegacy(m),
    sort: (a, b) => {
      const provBoost = m => m.provider === 'Anthropic' ? 100 : (m.provider === 'OpenAI' || m.provider === 'Google' ? 40 : 0);
      const scoreA = (a.scores?.quality || 80) * 8 + provBoost(a) + (a.benchmarks?.mmluPro || 60) * 2 + getEffectiveElo(a);
      const scoreB = (b.scores?.quality || 80) * 8 + provBoost(b) + (b.benchmarks?.mmluPro || 60) * 2 + getEffectiveElo(b);
      return scoreB - scoreA;
    }
  }
};

for (const [key, def] of Object.entries(CATEGORIES)) {
  const filtered = models.filter(def.filter).sort(def.sort);
  const top3 = filtered.slice(0, 3).map(m => m.name);
  console.log(`[${def.title}] (${filtered.length} models) -> Top 3: ${top3.join(' | ')}`);
  if (filtered.length < 3) allPassed = false;
}

console.log('\n=== VERIFYING FULL CATALOG SORT (P1-A) ===');
const fullCatalogSorted = [...models].sort((a, b) => getEffectiveElo(b) - getEffectiveElo(a));
const top5Catalog = fullCatalogSorted.slice(0, 5).map(m => m.name);
console.log('Full catalog top 5:', top5Catalog.join(' | '));
const hasClaude37InTop5 = top5Catalog.some(n => n.includes('Claude 3.7'));
const hasO3MiniInTop5 = top5Catalog.some(n => n.includes('o3-mini'));
if (hasClaude37InTop5 && hasO3MiniInTop5) {
  console.log('✅ P1-A Verified: Claude 3.7 Sonnet & o3-mini are in full catalog top 5!');
} else {
  console.error('❌ P1-A Failed: Frontier champions not in full catalog top 5!');
  allPassed = false;
}

if (allPassed) {
  console.log('\n🎉 ALL LEADERBOARD CHECKS PASSED!');
  process.exit(0);
} else {
  console.error('\n❌ SOME CHECKS FAILED!');
  process.exit(1);
}
