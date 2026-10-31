const fs = require('fs');
const path = require('path');

const modelsPath = path.join(__dirname, '../models.js');
let code = fs.readFileSync(modelsPath, 'utf8');

const nameFixes = {
  'gemini-pro': 'Gemini 1.0 Pro',
  'bard-jan-24-gemini-pro': 'Bard / Gemini Pro (2024-01-24)',
  'claude-3-opus-20240229': 'Claude 3 Opus',
  'command-r': 'Cohere Command R (04-2024)',
  'command-r-plus': 'Cohere Command R+ (04-2024)',
  'gemini-advanced-0514': 'Gemini Advanced (2024-05-14)',
  'claude-3-5-sonnet-20240620': 'Claude 3.5 Sonnet (2024-06-20)',
  'chatgpt-4o-latest': 'ChatGPT-4o Latest (2024-08-08)',
  'chatgpt-4o-latest-20240808': 'ChatGPT-4o (2024-08-08)',
  'minicpm-v-2_6': 'MiniCPM-V 2.6',
  'command-r-plus-08-2024': 'Cohere Command R+ (08-2024)',
  'command-r-08-2024': 'Cohere Command R (08-2024)',
  'chatgpt-4o-latest-20240903': 'ChatGPT-4o (2024-09-03)',
  'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (2024-10-22)',
  'chatgpt-4o-latest-20241120': 'ChatGPT-4o (2024-11-20)',
  'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku (2024-10-22)',
  'amazon-nova-pro-v1-0': 'Amazon Nova Pro 1.0',
  'amazon-nova-lite-v1-0': 'Amazon Nova Lite 1.0',
  'amazon-nova-micro-v1-0': 'Amazon Nova Micro 1.0',
  'step-1o-vision-32k-highres': 'Step-1o Vision 32K (Highres)',
  'chatgpt-4o-latest-20250129': 'ChatGPT-4o (2025-01-29)',
  'command-a-03-2025': 'Cohere Command A (03-2025)',
  'claude-3-7-sonnet-20250219-thinking-32k': 'Claude 3.7 Sonnet (Thinking 32K)',
  'chatgpt-4o-latest-20250326': 'ChatGPT-4o (2025-03-26)',
  'mistral-medium-2505': 'Mistral Medium (2505)',
  'claude-opus-4-20250514': 'Claude 4 Opus (Projected)',
  'claude-sonnet-4-20250514': 'Claude 4 Sonnet (Projected)',
  'recraft-v3': 'Recraft V3',
  'ideogram-v2': 'Ideogram v2.0',
  'flux-1-dev-fp8': 'FLUX.1 Dev (FP8)',
  'dall-e-3': 'DALL-E 3',
  'ideogram-v3-quality': 'Ideogram v3 (Quality)',
  'seedream-3': 'ByteDance SeaDream 3.0',
  'claude-opus-4-20250514-thinking-16k': 'Claude 4 Opus (Thinking 16K)',
  'claude-sonnet-4-20250514-thinking-32k': 'Claude 4 Sonnet (Thinking 32K)'
};

let replacedCount = 0;
for (const [id, newName] of Object.entries(nameFixes)) {
  const regex = new RegExp('("id":\\s*"' + id + '",\\s*"name":\\s*)"[^"]*"');
  if (regex.test(code)) {
    code = code.replace(regex, '$1"' + newName + '"');
    replacedCount++;
  }
}

fs.writeFileSync(modelsPath, code, 'utf8');
console.log(`Successfully replaced ${replacedCount} broken model names in models.js`);

