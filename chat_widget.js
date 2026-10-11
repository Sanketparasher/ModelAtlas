/**
 * ModelAtlas Hybrid AI Advisor Widget
 * Provides real-time interactive AI advisory powered by the ModelAtlas 384-model benchmark database.
 */

(function () {
  // Prevent duplicate initialization
  if (window.ModelAtlasChat) return;

  let activeQuizContext = null;
  let customApiKey = localStorage.getItem('atlas_api_key') || '';
  let customApiEndpoint = localStorage.getItem('atlas_api_endpoint') || 'smart_engine'; // 'smart_engine' | 'openrouter' | 'ollama'

  // Build UI Elements
  function initDOM() {
    // 1. Launcher button
    const btn = document.createElement('button');
    btn.id = 'atlas-chat-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Ask ModelAtlas AI Advisor');
    btn.innerHTML = `
      <span class="atlas-pulse-dot"></span>
      <span>💬 Ask AI Advisor</span>
    `;
    document.body.appendChild(btn);

    // 2. Chat panel
    const panel = document.createElement('div');
    panel.id = 'atlas-chat-panel';
    panel.innerHTML = `
      <div class="atlas-chat-hdr">
        <div class="atlas-hdr-left">
          <div class="atlas-hdr-icon">M</div>
          <div>
            <div class="atlas-hdr-title">ModelAtlas Advisor</div>
            <div class="atlas-hdr-status">
              <span class="atlas-hdr-pulse"></span>
              <span id="atlas-status-text">Live Brain · 384 Models</span>
            </div>
          </div>
        </div>
        <div class="atlas-hdr-actions">
          <button class="atlas-hdr-btn" id="atlas-settings-btn" title="Advisor Settings (API Key / Local Ollama)">⚙️</button>
          <button class="atlas-hdr-btn atlas-close-btn" id="atlas-close-btn" title="Close Advisor">&times;</button>
        </div>
      </div>

      <div class="atlas-context-bar" id="atlas-context-bar" style="display:none">
        <span id="atlas-context-label">Context active</span>
        <button class="atlas-context-clear" id="atlas-context-clear" title="Clear context">&times; Clear</button>
      </div>

      <!-- Settings Panel -->
      <div class="atlas-settings-modal" id="atlas-settings-modal">
        <div class="atlas-settings-hdr">
          <strong style="font-size:0.95rem;color:#fbbf24">Advisor Engine Settings</strong>
          <button class="atlas-hdr-btn" id="atlas-settings-close">&times;</button>
        </div>
        <p style="font-size:0.78rem;color:#7a8a9a;margin-bottom:14px;line-height:1.4">
          By default, ModelAtlas runs our instant client-side Knowledge Engine with zero API cost. You can optionally connect your own LLM backend below.
        </p>
        <div class="atlas-settings-field">
          <label>Inference Engine</label>
          <select class="atlas-settings-input" id="atlas-engine-select" style="padding:6px 8px">
            <option value="smart_engine">⚡ ModelAtlas Offline Knowledge Engine (Free / Instant)</option>
            <option value="ollama">🖥️ Local Ollama (http://localhost:11434)</option>
            <option value="openrouter">🌐 OpenRouter API (Bring your key)</option>
          </select>
        </div>
        <div class="atlas-settings-field" id="atlas-key-field" style="display:none">
          <label>API Key</label>
          <input type="password" class="atlas-settings-input" id="atlas-api-key" placeholder="sk-or-v1-..." />
        </div>
        <div style="margin-top:auto;display:flex;justify-content:flex-end">
          <button class="btn btn-primary" id="atlas-settings-save" style="padding:0.4rem 1rem;font-size:0.82rem">Save Preferences</button>
        </div>
      </div>

      <!-- Messages Body -->
      <div class="atlas-chat-msgs" id="atlas-chat-msgs">
        <div class="atlas-msg atlas-msg-bot">
          <div class="atlas-msg-bubble">
            👋 <strong>Hi! I'm your ModelAtlas AI Advisor.</strong><br><br>
            I have full benchmark and architecture data on <strong>384+ models</strong> across LMSYS Arena, Artificial Analysis, and Hugging Face.
            <br><br>
            Ask me anything about hardware requirements, token pricing, setup code, or trade-offs!
          </div>
          <span class="atlas-msg-time">Just now</span>
        </div>
      </div>

      <!-- Quick Suggestion Pills -->
      <div class="atlas-chat-pills" id="atlas-chat-pills">
        <button class="atlas-pill" data-q="What is the #1 model for coding?">🏆 Best Coding Model</button>
        <button class="atlas-pill" data-q="What hardware is needed to run Llama 3.3 70B locally?">🖥️ 70B VRAM Hardware</button>
        <button class="atlas-pill" data-q="How does Claude 3.7 compare to OpenAI o3-mini?">⚖️ Claude 3.7 vs o3-mini</button>
        <button class="atlas-pill" data-q="Which models have a 1M+ token context window?">📚 1M+ Context Models</button>
        <button class="atlas-pill" data-q="How much does 5 million tokens cost on DeepSeek V3?">💵 5M Token Cost</button>
      </div>

      <!-- Input Row -->
      <div class="atlas-chat-input-row">
        <textarea class="atlas-chat-input" id="atlas-chat-input" placeholder="Ask about models, pricing, hardware, or code..." rows="1"></textarea>
        <button class="atlas-chat-send" id="atlas-chat-send" title="Send message">↑</button>
      </div>
    `;
    document.body.appendChild(panel);

    // Event Listeners
    btn.addEventListener('click', () => toggleChat(true));
    document.getElementById('atlas-close-btn').addEventListener('click', () => toggleChat(false));

    // Settings Toggle
    const settingsModal = document.getElementById('atlas-settings-modal');
    document.getElementById('atlas-settings-btn').addEventListener('click', () => {
      document.getElementById('atlas-engine-select').value = customApiEndpoint;
      document.getElementById('atlas-api-key').value = customApiKey;
      toggleKeyField();
      settingsModal.classList.add('open');
    });
    document.getElementById('atlas-settings-close').addEventListener('click', () => settingsModal.classList.remove('open'));
    document.getElementById('atlas-engine-select').addEventListener('change', toggleKeyField);

    function toggleKeyField() {
      const mode = document.getElementById('atlas-engine-select').value;
      document.getElementById('atlas-key-field').style.display = (mode === 'openrouter') ? 'block' : 'none';
    }

    document.getElementById('atlas-settings-save').addEventListener('click', () => {
      customApiEndpoint = document.getElementById('atlas-engine-select').value;
      customApiKey = document.getElementById('atlas-api-key').value.trim();
      localStorage.setItem('atlas_api_endpoint', customApiEndpoint);
      localStorage.setItem('atlas_api_key', customApiKey);
      settingsModal.classList.remove('open');
      appendBotMessage(`⚙️ Settings saved. Operating with: <strong>${customApiEndpoint === 'smart_engine' ? 'ModelAtlas Knowledge Engine' : customApiEndpoint}</strong>.`);
    });

    // Clear context
    document.getElementById('atlas-context-clear').addEventListener('click', () => {
      activeQuizContext = null;
      document.getElementById('atlas-context-bar').style.display = 'none';
      appendBotMessage("🔄 Cleared quiz context. What would you like to explore next?");
    });

    // Quick pills click delegation
    document.getElementById('atlas-chat-pills').addEventListener('click', (e) => {
      const pill = e.target.closest('.atlas-pill');
      if (pill && pill.dataset.q) {
        handleUserMessage(pill.dataset.q);
      }
    });

    // Send on button or Enter (without Shift)
    const input = document.getElementById('atlas-chat-input');
    const sendBtn = document.getElementById('atlas-chat-send');
    sendBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if (text) {
        input.value = '';
        handleUserMessage(text);
      }
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          input.value = '';
          handleUserMessage(text);
        }
      }
    });
  }

  function toggleChat(open) {
    const btn = document.getElementById('atlas-chat-btn');
    const panel = document.getElementById('atlas-chat-panel');
    if (!btn || !panel) return;

    if (open) {
      panel.classList.add('chat-open');
      btn.classList.add('chat-hidden');
      setTimeout(() => document.getElementById('atlas-chat-input')?.focus(), 100);
    } else {
      panel.classList.remove('chat-open');
      btn.classList.remove('chat-hidden');
    }
  }

  function appendUserMessage(text) {
    const container = document.getElementById('atlas-chat-msgs');
    const msg = document.createElement('div');
    msg.className = 'atlas-msg atlas-msg-user';
    msg.innerHTML = `
      <div class="atlas-msg-bubble">${escapeHtml(text)}</div>
      <span class="atlas-msg-time">Just now</span>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function appendBotMessage(html) {
    const container = document.getElementById('atlas-chat-msgs');
    const msg = document.createElement('div');
    msg.className = 'atlas-msg atlas-msg-bot';
    msg.innerHTML = `
      <div class="atlas-msg-bubble">${html}</div>
      <span class="atlas-msg-time">Just now</span>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ─── EMBEDDED KNOWLEDGE ADVISOR (OFFLINE ENGINE) ───────────────────────────
  function queryKnowledgeEngine(query, context) {
    const q = query.toLowerCase();
    const models = window.MODELS_DATA || [];

    // Helper: find model by name / keyword
    function findModel(str) {
      return models.find(m => str.includes(m.id) || str.includes(m.name.toLowerCase()));
    }

    // 1. Quiz-Specific Questions
    if (context && (q.includes('recommend') || q.includes('why this') || q.includes('my pick') || q.includes('fit'))) {
      const top = context.primary;
      const runner = context.runner;
      return `
        🎯 <strong>Why ${top.name} is your #1 match:</strong><br><br>
        Based on your profile (<strong>${context.task}</strong> via <strong>${context.interface}</strong>):
        <ul>
          <li><strong>Benchmark Score:</strong> LMSYS Chatbot Arena Elo <strong>${top.benchmarks.arenaElo}</strong> ranks it among the world's best.</li>
          <li><strong>Context Capability:</strong> Its <strong>${top.contextWindow}</strong> context window easily handles your expected input size without memory degradation.</li>
          <li><strong>Economic Fit:</strong> Pricing of <strong>${top.pricing}</strong> aligns with your budget boundaries.</li>
        </ul>
        ${runner ? `<strong>Alternative to consider:</strong> <em>${runner.name}</em> (Elo ${runner.benchmarks.arenaElo}) is a close runner-up if you want to experiment.` : ''}
      `;
    }

    // 2. Hardware / VRAM Requirements
    if (q.includes('hardware') || q.includes('vram') || q.includes('ram') || q.includes('local') || q.includes('self-host') || q.includes('run')) {
      if (q.includes('70b') || q.includes('llama 3.3') || q.includes('qwen 2.5 72b')) {
        return `
          🖥️ <strong>Hardware Guide for 70B Models (Llama 3.3 70B / Qwen 2.5 72B):</strong><br><br>
          <ul>
            <li><strong>4-Bit Quantization (Q4_K_M via Ollama/vLLM):</strong> Requires <strong>~40GB VRAM</strong>. Setup: 2x NVIDIA RTX 3090/4090 (24GB each) or a Mac Studio / MacBook with <strong>48GB–64GB Unified Memory</strong>.</li>
            <li><strong>8-Bit (FP8):</strong> Requires <strong>~75GB VRAM</strong> (1x NVIDIA H100 80GB or 1x A100 80GB).</li>
            <li><strong>Full 16-Bit (BF16):</strong> Requires <strong>~145GB VRAM</strong> (2x A100 80GB).</li>
          </ul>
          💡 <em>Tip: If you're on a single consumer GPU (8GB–16GB VRAM), consider <strong>Qwen 2.5 Coder 32B (Q4 ~20GB)</strong> or <strong>Llama 3.1 8B (Q4 ~5.5GB)</strong>.</em>
        `;
      }
      if (q.includes('r1') || q.includes('deepseek r1') || q.includes('671b') || q.includes('deepseek v3')) {
        return `
          ⚡ <strong>Hardware Guide for DeepSeek R1 & V3 (671B MoE):</strong><br><br>
          Because R1 has 671B total parameters (37B active):
          <ul>
            <li><strong>Full Deployment:</strong> Requires an 8x H100/A100 GPU cluster (~600GB VRAM).</li>
            <li><strong>Quantized Local Deployment (IQ1_S to Q4):</strong> Requires a Mac with <strong>128GB to 192GB Unified Memory</strong> or specialized multi-GPU workstations.</li>
            <li><strong>Best Practical Setup:</strong> For 99% of developers, run DeepSeek R1 via API (DeepSeek native at <strong>$0.55 / $2.19 per M</strong> or Groq/Fireworks) for instant speed without $50,000 in server costs.</li>
          </ul>
        `;
      }
      if (q.includes('8b') || q.includes('14b') || q.includes('phi-4') || q.includes('nemo')) {
        return `
          💻 <strong>Hardware Guide for Small / Edge Models (8B–14B):</strong><br><br>
          <ul>
            <li><strong>Llama 3.1 8B / Granite 8B:</strong> Fits in <strong>6GB VRAM</strong> (runs on any RTX 3060/4060 or M1/M2/M3 Mac with 16GB RAM) at 100+ tokens/sec.</li>
            <li><strong>Phi-4 (14B) / NeMo (12B):</strong> Fits in <strong>10GB–12GB VRAM</strong> (ideal for single 16GB GPUs).</li>
          </ul>
        `;
      }
      return `
        🖥️ <strong>General VRAM Estimation Formula:</strong><br><br>
        <code>VRAM (GB) ≈ (Parameters in Billions × Bytes per Weight) × 1.25 (KV Cache overhead)</code><br><br>
        • <strong>8B model in Q4:</strong> ~5.5 GB VRAM<br>
        • <strong>14B model in Q4:</strong> ~9.5 GB VRAM<br>
        • <strong>32B model in Q4:</strong> ~20 GB VRAM<br>
        • <strong>70B model in Q4:</strong> ~40 GB VRAM<br>
        • <strong>405B model in Q4:</strong> ~230 GB VRAM
      `;
    }

    // 3. Head-to-Head Comparison
    if (q.includes('compare') || q.includes(' vs ') || q.includes('versus') || q.includes('difference between')) {
      const m1 = findModel(q);
      const remaining = m1 ? q.replace(m1.id, '').replace(m1.name.toLowerCase(), '') : q;
      const m2 = findModel(remaining);

      if (m1 && m2 && m1.id !== m2.id) {
        const higherElo = m1.benchmarks.arenaElo >= m2.benchmarks.arenaElo ? m1 : m2;
        const lowerElo = higherElo.id === m1.id ? m2 : m1;
        return `
          ⚖️ <strong>Head-to-Head: ${m1.name} vs. ${m2.name}</strong><br><br>
          <ul>
            <li><strong>LMSYS Arena Elo:</strong> <strong>${higherElo.name}</strong> leads at <strong>${higherElo.benchmarks.arenaElo}</strong> vs <strong>${lowerElo.benchmarks.arenaElo}</strong>.</li>
            <li><strong>Coding Elo:</strong> ${m1.name}: <code>${m1.benchmarks.arenaCoding || '—'}</code> | ${m2.name}: <code>${m2.benchmarks.arenaCoding || '—'}</code></li>
            <li><strong>Context Window:</strong> ${m1.name} (<strong>${m1.contextWindow}</strong>) vs. ${m2.name} (<strong>${m2.contextWindow}</strong>)</li>
            <li><strong>Throughput Speed:</strong> ${m1.name} (<strong>${m1.speedTps ? m1.speedTps + ' t/s' : '—'}</strong>) vs. ${m2.name} (<strong>${m2.speedTps ? m2.speedTps + ' t/s' : '—'}</strong>)</li>
            <li><strong>API Pricing:</strong> ${m1.name} (${m1.pricing}) vs. ${m2.name} (${m2.pricing})</li>
          </ul>
          💡 <em>Verdict: Choose <strong>${m1.name}</strong> for ${m1.bestForLabel}, or <strong>${m2.name}</strong> for ${m2.bestForLabel}.</em>
        `;
      }
    }

    // 4. Token Cost Calculations
    if (q.includes('cost') || q.includes('price') || q.includes('how much') || q.includes('token')) {
      const target = findModel(q) || (context ? context.primary : null) || models[0];
      const millionMatch = q.match(/(\d+)\s*(million|m\b)/i);
      const numMillions = millionMatch ? parseInt(millionMatch[1], 10) : 1;

      const inCost = (target.inputPrice * numMillions).toFixed(2);
      const outCost = (target.outputPrice * numMillions).toFixed(2);
      const blendedCost = ((target.inputPrice * 0.75 + target.outputPrice * 0.25) * numMillions).toFixed(2);

      return `
        💵 <strong>Cost Estimation for ${target.name} (${numMillions}M Tokens):</strong><br><br>
        Standard pricing: <code>$${target.inputPrice} input / $${target.outputPrice} output per 1M tokens</code><br><br>
        For <strong>${numMillions} million tokens</strong>:<br>
        • All Input tokens: <strong>$${inCost}</strong><br>
        • All Output tokens: <strong>$${outCost}</strong><br>
        • Typical Blended workflow (3:1 input-to-output ratio): <strong>~$${blendedCost}</strong><br><br>
        ${target.license === 'open_weights' ? '💡 <em>This model is open-weights. You can also self-host it for $0 API token costs!</em>' : ''}
      `;
    }

    // 5. Code Integration Snippet
    if (q.includes('code') || q.includes('python') || q.includes('curl') || q.includes('sdk') || q.includes('integrate')) {
      const target = findModel(q) || (context ? context.primary : null) || models.find(m => m.id === 'claude-3-7-sonnet');
      if (target.provider === 'Anthropic') {
        return `
          💻 <strong>Anthropic Python Integration (${target.name}):</strong><br>
          <pre>import anthropic

client = anthropic.Anthropic()
response = client.messages.create(
    model="${target.id}",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello ModelAtlas!"}]
)
print(response.content[0].text)</pre>
        `;
      }
      return `
        💻 <strong>OpenAI-Compatible Python Integration (${target.name}):</strong><br>
        <pre>from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="${target.id}",
    messages=[{"role": "user", "content": "Hello ModelAtlas!"}]
)
print(response.choices[0].message.content)</pre>
      `;
    }

    // 6. Coding Model Recommendation
    if (q.includes('coding') || q.includes('developer') || q.includes('cursor') || q.includes('swe')) {
      return `
        💻 <strong>Top 3 AI Models for Software Engineering (Oct 2026):</strong><br><br>
        <ol>
          <li><strong>Claude 3.7 Sonnet:</strong> #1 on SWE-bench Verified (70.3%) with toggleable hybrid reasoning. Best for Cursor & complex refactoring.</li>
          <li><strong>OpenAI o3-mini:</strong> High-speed reasoning leader (SWE-bench 61.2%) at only $1.10 / $4.40 per M.</li>
          <li><strong>Qwen 2.5 Coder 32B:</strong> Top open-weights coding model (SWE-bench 42.1%). Can be self-hosted on a single GPU.</li>
        </ol>
      `;
    }

    // 7. Context Window Query
    if (q.includes('context') || q.includes('1m') || q.includes('2m') || q.includes('long document')) {
      return `
        📚 <strong>Ultra-Long Context Leaders:</strong><br><br>
        <ul>
          <li><strong>Gemini 2.5 Pro:</strong> <strong>2,000,000 tokens</strong> (~1.5 million words / 3,000 pages of code or text).</li>
          <li><strong>Gemini 2.5 Flash:</strong> <strong>1,000,000 tokens</strong> with sub-second retrieval at $0.15 / $0.60 per M.</li>
          <li><strong>Amazon Nova Pro:</strong> <strong>300,000 tokens</strong> on AWS Bedrock.</li>
          <li><strong>Codestral 22B:</strong> <strong>256,000 tokens</strong> for massive code repositories.</li>
          <li><strong>Claude 3.7 Sonnet / o3-mini:</strong> <strong>200,000 tokens</strong> with high needle-in-haystack accuracy.</li>
        </ul>
      `;
    }

    // General fallback
    return `
      💡 <strong>ModelAtlas Advisor Insight:</strong><br><br>
      You asked about: <em>"${escapeHtml(query)}"</em>.<br><br>
      We track <strong>384 models</strong> across LMSYS Arena and Artificial Analysis. Here are key benchmark facts:
      <ul>
        <li><strong>Top Overall Arena Elo:</strong> Claude 3.7 Sonnet (1362), OpenAI o3-mini (1360), DeepSeek R1 (1358).</li>
        <li><strong>Best Value / Speed:</strong> Gemini 2.5 Flash (145 t/s, $0.15/M) & DeepSeek V3 ($0.14/M).</li>
        <li><strong>Best Open Weights:</strong> Llama 3.3 70B (Enterprise) & Qwen 2.5 72B (Multilingual).</li>
      </ul>
      Try asking: <em>"Compare Claude 3.7 vs o3-mini"</em> or <em>"How much VRAM do I need for 70B?"</em>.
    `;
  }

  // ─── LIVE LLM BACKEND (OLLAMA / OPENROUTER) ────────────────────────────────
  async function callLiveLLM(query, context) {
    if (customApiEndpoint === 'ollama') {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `You are the ModelAtlas AI Advisor. Answer concisely based on LLM benchmarks: ${query}`,
          stream: false
        })
      });
      const data = await res.json();
      return data.response;
    } else if (customApiEndpoint === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customApiKey}`
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-haiku',
          messages: [
            { role: 'system', content: 'You are ModelAtlas AI Advisor. Provide brief, benchmark-informed advice.' },
            { role: 'user', content: query }
          ]
        })
      });
      const data = await res.json();
      return data.choices[0].message.content;
    }
    return null;
  }

  async function handleUserMessage(text) {
    appendUserMessage(text);

    // Typing indicator
    const container = document.getElementById('atlas-chat-msgs');
    const loadingId = 'loading-' + Date.now();
    const loadingEl = document.createElement('div');
    loadingEl.id = loadingId;
    loadingEl.className = 'atlas-msg atlas-msg-bot';
    loadingEl.innerHTML = `<div class="atlas-msg-bubble" style="opacity:0.7">Thinking with 384 model benchmarks...</div>`;
    container.appendChild(loadingEl);
    container.scrollTop = container.scrollHeight;

    try {
      let botHtml = '';
      if (customApiEndpoint !== 'smart_engine' && (customApiKey || customApiEndpoint === 'ollama')) {
        try {
          const liveText = await callLiveLLM(text, activeQuizContext);
          botHtml = escapeHtml(liveText).replace(/\n/g, '<br>');
        } catch (err) {
          botHtml = `⚠️ Live API failed (${err.message}). Falling back to Knowledge Engine:<br><br>` + queryKnowledgeEngine(text, activeQuizContext);
        }
      } else {
        // Fast local knowledge query
        await new Promise(r => setTimeout(r, 200)); // slight natural response feel
        botHtml = queryKnowledgeEngine(text, activeQuizContext);
      }

      document.getElementById(loadingId)?.remove();
      appendBotMessage(botHtml);
    } catch (e) {
      document.getElementById(loadingId)?.remove();
      appendBotMessage(`❌ Error processing query: ${e.message}`);
    }
  }

  // ─── PUBLIC CONTROLLER ───────────────────────────────────────────────────
  window.ModelAtlasChat = {
    open: function (initialQuery) {
      toggleChat(true);
      if (initialQuery) {
        handleUserMessage(initialQuery);
      }
    },
    close: function () {
      toggleChat(false);
    },
    setQuizContext: function (ctx) {
      activeQuizContext = ctx;
      const bar = document.getElementById('atlas-context-bar');
      const label = document.getElementById('atlas-context-label');
      if (bar && label && ctx && ctx.primary) {
        label.textContent = `🎯 Profile: ${ctx.task} • Top Pick: ${ctx.primary.name}`;
        bar.style.display = 'flex';
      }
    }
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }
})();

