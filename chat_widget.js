/**
 * ModelAtlas Hybrid AI Advisor Widget
 * Provides real-time interactive AI advisory powered by an In-Browser RAG
 * (Retrieval-Augmented Generation) engine over the ModelAtlas 384-model database.
 */

(function () {
  // Prevent duplicate initialization
  if (window.ModelAtlasChat) return;

  // ─── STATE & MEMORY ────────────────────────────────────────────────────────
  let activeQuizContext = null;
  let customApiKey = localStorage.getItem('atlas_api_key') || '';
  let customApiEndpoint = localStorage.getItem('atlas_api_endpoint') || 'smart_engine'; // 'smart_engine' | 'openrouter' | 'ollama'

  // Multi-turn conversation session memory
  let sessionMemory = {
    lastRecommendedModel: null,
    runnerModel: null,
    budgetModel: null,
    activeTrack: null,
    extractedConstraints: null,
    turns: [] // Array of { role: 'user' | 'bot', text: string }
  };

  // ─── DOMAIN KNOWLEDGE CHUNKS (RAG CORPUS) ──────────────────────────────────
  const KNOWLEDGE_DOCS = [
    {
      id: 'doc-vram-sizing',
      title: 'VRAM & Quantization Sizing Guide',
      category: 'hardware',
      keywords: ['vram', 'ram', 'gpu', 'hardware', 'ollama', 'quantization', 'q4', 'q8', 'fp8', 'bf16', 'rtx', 'mac', 'memory', 'run', 'local', 'self-host'],
      content: `VRAM Estimation Formula: VRAM in GB ≈ (Model Parameters in Billions × Bytes per weight) × 1.25 (KV cache overhead).
• 7B/8B Models (Llama 3.1 8B, Qwen 2.5 7B, Granite 8B): In 4-bit (Q4_K_M via Ollama/vLLM), requires ~5.5GB VRAM. Fits consumer GPUs (RTX 3060/4060, Mac 16GB) at 100+ tokens/sec.
• 14B Models (Qwen 2.5 14B, Phi-4 14B): In Q4_K_M, requires ~9.5GB–11GB VRAM. Fits a single 12GB–16GB GPU (RTX 4070/4080).
• 32B Models (Qwen 2.5 Coder 32B, QwQ 32B Preview): In Q4_K_M, requires ~20.5GB VRAM. Fits a single 24GB GPU (RTX 3090/4090) or 32GB+ Mac Studio.
• 70B/72B Models (Llama 3.3 70B, Qwen 2.5 72B): In 4-bit (Q4), requires ~40GB VRAM (2x RTX 3090/4090 or Mac Studio 48GB–64GB Unified Memory). In FP8, requires ~75GB (1x H100 80GB). In BF16, requires ~145GB (2x A100/H100 80GB).
• 671B MoE Models (DeepSeek R1, DeepSeek V3): 671B total (37B active). Full deployment requires 8x H100 cluster (~600GB VRAM). Local quantized execution requires 128GB–192GB Unified Memory Mac. Best practical setup for developers is managed API at $0.55 / $2.19 per million tokens.`
    },
    {
      id: 'doc-enterprise-compliance',
      title: 'Enterprise Compliance & Sovereign Governance',
      category: 'compliance',
      keywords: ['compliance', 'enterprise', 'zdr', 'zero data retention', 'hipaa', 'soc-2', 'soc2', 'air-gap', 'airgapped', 'onprem', 'on-premise', 'privacy', 'sovereign', 'audit', 'legal'],
      content: `Enterprise Compliance and Data Sovereignty:
• Commercial Cloud Zero Data Retention (ZDR): Anthropic (Claude), OpenAI, and Google Cloud Vertex AI provide contractually guaranteed ZDR, SOC-2 Type II verification, and HIPAA BAA eligibility confirming prompt data is never retained or trained on.
• Sovereign Air-Gapped On-Premises: Strictly requires open-weights models (Llama 3.3 70B, Qwen 2.5 72B, DeepSeek R1). Executed inside private data center perimeter using vLLM or Ollama with zero external telemetry or internet egress.`
    },
    {
      id: 'doc-student-academic',
      title: 'Academic, Exam Prep & Textbook Summaries',
      category: 'academic',
      keywords: ['student', 'textbook', 'book', 'summarize', 'exam', 'quiz', 'mock', 'sample question', 'medical', 'engineering', 'math', 'calculus', 'homework', 'free', 'usmle'],
      content: `Academic & Research Workflows:
• 300+ Page Textbook Summarization: Ingesting whole books requires 1M–2M context: Gemini 2.5 Pro (2M tokens, 1.5M words) or Gemini 2.5 Flash (1M tokens). Available free in Google AI Studio.
• STEM Proofs & Logic: Chain-of-thought models (DeepSeek R1, OpenAI o3-mini) lead MATH-500 (>95%) for step-by-step calculus, differential equations, and Olympiad physics proofs.
• Medical & Engineering Research: High MMLU-Pro domain accuracy (Claude 3.7 Sonnet, GPT-4o, DeepSeek R1) for clinical USMLE vignettes and engineering thermodynamics/circuits.
• Zero-Cost Student Route: Google AI Studio (free Gemini 2.5 Pro 2M window), DeepSeek Web (free DeepSeek R1 reasoning without credit card), and Local Ollama (Qwen 2.5 7B offline).`
    },
    {
      id: 'doc-developer-coding',
      title: 'Software Development & Autonomous Agentic Loops',
      category: 'developer',
      keywords: ['coding', 'code', 'python', 'refactor', 'swe-bench', 'swe', 'cursor', 'autocomplete', 'fim', 'agent', 'tools', 'function calling', 'bug'],
      content: `Software Engineering & Autonomous Agents:
• Multi-File Repo Refactoring: Claude 3.7 Sonnet (#1 on SWE-bench Verified at 70.3%) with toggleable hybrid reasoning navigates complex dependency graphs.
• Sub-150ms Inline Autocomplete: High throughput models: Qwen 2.5 Coder 7B/14B (>120 t/s), Gemini 2.0 Flash (145 t/s), Granite 8B.
• Agentic Function Calling: Leaders on Berkeley Function Calling Leaderboard (BFCL): Claude 3.7 Sonnet, Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Pro.`
    }
  ];

  // ─── IN-BROWSER BM25 RAG RETRIEVER ─────────────────────────────────────────
  function tokenize(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9_\-\.]/g, ' ').split(/\s+/).filter(w => w.length > 1);
  }

  let ragIndex = null;

  function buildRAGIndex() {
    const models = window.MODELS_DATA || [];
    const docs = [];

    // 1. Index 384 models
    models.forEach(m => {
      const text = `${m.name} ${m.provider} ${m.desc || ''} ${(m.tags || []).join(' ')} ${(m.bestFor || []).join(' ')} ${m.pricing || ''} ${m.license || ''} context ${m.contextWindow || ''} elo ${m.benchmarks?.arenaElo || ''}`;
      docs.push({
        type: 'model',
        data: m,
        id: m.id,
        tokens: tokenize(text)
      });
    });

    // 2. Index knowledge documents
    KNOWLEDGE_DOCS.forEach(k => {
      docs.push({
        type: 'knowledge',
        data: k,
        id: k.id,
        tokens: tokenize(`${k.title} ${k.category} ${k.keywords.join(' ')} ${k.content}`)
      });
    });

    // Compute BM25 statistics
    const docCount = docs.length;
    const docLengths = docs.map(d => d.tokens.length);
    const avgDocLength = docLengths.reduce((a, b) => a + b, 0) / (docCount || 1);
    const df = {};
    docs.forEach(d => {
      const seen = new Set(d.tokens);
      seen.forEach(t => { df[t] = (df[t] || 0) + 1; });
    });

    ragIndex = {
      docs,
      docCount,
      docLengths,
      avgDocLength,
      df,
      search: function (query, k = 4) {
        const qTokens = tokenize(query);
        const k1 = 1.2;
        const b = 0.75;
        const scores = this.docs.map((d, idx) => {
          let s = 0;
          const tf = {};
          d.tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
          const len = this.docLengths[idx];
          qTokens.forEach(t => {
            if (!tf[t]) return;
            const docFreq = this.df[t] || 1;
            const idf = Math.log((this.docCount - docFreq + 0.5) / (docFreq + 0.5) + 1);
            const termFreq = tf[t];
            const num = termFreq * (k1 + 1);
            const denom = termFreq + k1 * (1 - b + b * (len / (this.avgDocLength || 1)));
            s += idf * (num / denom);
          });
          return { item: d, score: s };
        });
        scores.sort((a, b) => b.score - a.score);
        return scores.filter(x => x.score > 0).slice(0, k);
      }
    };
  }

  // ─── CONVERSATIONAL INTENT & CONSTRAINT EXTRACTOR ─────────────────────────
  function detectRecommendationIntent(text) {
    const t = text.toLowerCase();
    // Exclude purely informational queries like "which models have 1M context", "list models with", etc.
    if (/which models (have|support|are)|list models|what models (have|support|are)/i.test(t)) {
      return false;
    }
    return /(recommend|suggest|which.*model.*should|what.*model.*should|should i use|best.*model|help me pick|i need an? (ai|model)|we need an? (ai|model)|find me.*(ai|model)|looking for.*(ai|model)|want to run.*(ai|model)|want an? (ai|model)|what to use|good.*model.*for|model to use|pick a model|need a.*model|need an.*model|run.*model)/i.test(t);
  }

  function extractConstraintsFromChat(text, prevMemory) {
    const t = text.toLowerCase();
    let persona = prevMemory?.activeTrack || 'coder';

    // Persona identification
    if (/novel|fiction|writing|writer|blog|article|author|prose|clich|copywriting|creative/i.test(t)) {
      persona = 'creator';
    } else if (/student|homework|study|exam|test prep|mock test|quiz|textbook|medical|usmle|doctor|engineering|calculus|math|biology|college|university|school|thesis|essay/i.test(t)) {
      persona = 'student';
    } else if (/api|json|schema|saas|backend|latency|throughput|ttft|tool calling|function calling/i.test(t)) {
      persona = 'api';
    } else if (/enterprise|corporate|compliance|hipaa|soc-2|soc2|zdr|air-gap|airgapped|on-prem|sovereign|legal|contract|audit|finance/i.test(t)) {
      persona = 'enterprise';
    } else if (/code|coding|developer|python|react|refactor|software|git|bug|swe|cursor|terminal/i.test(t)) {
      persona = 'coder';
    }

    const ans = { persona };

    // Track-specific constraint mapping
    if (persona === 'coder') {
      if (/inline|autocomplete|tab|fim|typing/i.test(t)) ans.coding_scope = 'inline_fim';
      else if (/agent|autonomous|terminal|bash/i.test(t)) ans.coding_scope = 'agentic_loop';
      else ans.coding_scope = 'repo_refactor';

      if (/laptop|macbook|consumer|8gb|16gb|single gpu|rtx 3060|rtx 4060|offline|local/i.test(t)) ans.env_target = 'local_consumer';
      else if (/workstation|mac studio|24gb|32gb|48gb|64gb|rtx 3090|rtx 4090|multi-gpu/i.test(t)) ans.env_target = 'local_workstation';
      else ans.env_target = 'cloud_managed';

      if (/reasoning|think|deep|math|logic/i.test(t)) ans.reasoning_mode = 'extended_thinking';
      else ans.reasoning_mode = 'instant_stream';

      if (/free|\$0|zero cost|open weight/i.test(t)) ans.budget_level = 'zero_cost';
      else if (/premium|best possible|frontier/i.test(t)) ans.budget_level = 'frontier_tier';
      else ans.budget_level = 'value_tier';
    } else if (persona === 'student') {
      if (/book|textbook|300 page|summar/i.test(t)) ans.academic_workload = 'book_summarization';
      else if (/medical|engineering|usmle|doctor|clinical|thermo/i.test(t)) ans.academic_workload = 'specialized_research';
      else if (/exam|quiz|mock|sample question|test prep/i.test(t)) ans.academic_workload = 'exam_prep';
      else if (/math|calculus|proof|logic|physics/i.test(t)) ans.academic_workload = 'stem_math_logic';
      else ans.academic_workload = 'homework_assignment';

      if (/free|\$0|no money|without.*pay|without.*credit/i.test(t)) ans.student_budget = 'strictly_free';
      else ans.student_budget = 'student_sub';
      ans.explanation_style = 'pedagogical_deep';
    } else if (persona === 'api') {
      if (/json|schema|pydantic|zod/i.test(t)) ans.api_interface = 'strict_json';
      else if (/tool|agent|function/i.test(t)) ans.api_interface = 'multi_tool';
      else ans.api_interface = 'chat_stream';

      if (/fast|< 400|sub-400|sub-500|ultra/i.test(t)) ans.latency_sla = 'ultra_fast';
      else ans.latency_sla = 'balanced_sla';

      if (/book|repo|1m|large|million/i.test(t)) ans.context_scale = 'large_ctx';
      else ans.context_scale = 'standard_ctx';

      if (/free|cheap|scale|volume|sub-\$0.50/i.test(t)) ans.api_budget = 'scale_budget';
      else ans.api_budget = 'premium_api';
    } else if (persona === 'enterprise') {
      if (/air-gap|on-prem|sovereign/i.test(t)) ans.enterprise_compliance = 'air_gapped_onprem';
      else ans.enterprise_compliance = 'zdr_commercial';

      if (/customer|support|ticket/i.test(t)) ans.enterprise_workload = 'customer_ops';
      else ans.enterprise_workload = 'legal_finance';

      if (/2m|archive|large doc/i.test(t)) ans.enterprise_context = 'archive_2m';
      else ans.enterprise_context = 'standard_docs';
    } else if (persona === 'creator') {
      if (/marketing|ad|hook/i.test(t)) ans.creator_focus = 'marketing_copy';
      else ans.creator_focus = 'longform_prose';

      ans.voice_nuance = 'avoid_cliches';
      ans.deliberation_depth = 'deep_polish';
      ans.creator_budget = /free|\$0/i.test(t) ? 'free_accessible' : 'premium_pro';
    }

    return ans;
  }

  // ─── SCORING ENGINE (CALIBRATED EMPIRICAL MATCHER) ─────────────────────────
  function computeWeightedSum(model, weights) {
    for (let k in weights) weights[k] = Math.max(0.02, weights[k]);
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    for (let k in weights) weights[k] /= sum;

    let total = 0;
    for (const [dim, w] of Object.entries(weights)) {
      total += w * ((model.scores && model.scores[dim]) || 80);
    }
    return total;
  }

  function scoreModelAdvisor(model, ans) {
    const p = ans.persona || 'coder';
    let weights = { quality: 0.25, cost: 0.20, speed: 0.15, context: 0.15, privacy: 0.15, reliability: 0.10 };
    let score = 0;

    if (p === 'coder') {
      weights = { quality: 0.35, cost: 0.10, speed: 0.20, context: 0.15, privacy: 0.10, reliability: 0.10 };
      if (ans.coding_scope === 'inline_fim') { weights.speed += 0.25; weights.cost += 0.10; weights.quality -= 0.10; }
      else if (ans.coding_scope === 'repo_refactor' || ans.coding_scope === 'agentic_loop') { weights.quality += 0.25; weights.context += 0.15; }
      if (ans.reasoning_mode === 'extended_thinking') { weights.quality += 0.25; weights.speed -= 0.15; }
      if (ans.budget_level === 'zero_cost') weights.cost += 0.35;
      else if (ans.budget_level === 'frontier_tier') { weights.quality += 0.30; weights.cost = 0.02; }

      score = computeWeightedSum(model, weights);

      // Boost dedicated coding models
      if (model.tags && model.tags.includes('coding')) score *= 1.25;
      if (model.id.includes('coder') || model.id === 'qwen-2-5-7b' || model.id === 'qwen-2-5-14b' || model.id === 'ibm-granite-3-8b') score *= 1.20;

      if (ans.coding_scope === 'repo_refactor' || ans.coding_scope === 'agentic_loop') {
        if (model.benchmarks && model.benchmarks.sweBench >= 45) score *= 1.30;
        else if (model.benchmarks && model.benchmarks.sweBench >= 38) score *= 1.25;
        if (model.benchmarks && model.benchmarks.arenaCoding >= 1350) score *= 1.25;
        else if (model.benchmarks && model.benchmarks.arenaCoding >= 1300) score *= 1.15;
      }
      if (ans.coding_scope === 'inline_fim') {
        if ((model.speedTps || 0) >= 100) score *= 1.25;
      }
      if (ans.env_target === 'local_consumer') {
        if (model.license !== 'open_weights') score *= 0.10;
        else if (model.name.includes('7B') || model.name.includes('8B') || model.name.includes('14B')) score *= 1.40;
        else score *= 0.35; // Penalize oversized models (32B, 70B, 671B) for consumer laptops
      } else if (ans.env_target === 'local_workstation') {
        if (model.license !== 'open_weights') score *= 0.10;
        else {
          if (model.name.includes('32B') || model.name.includes('70B') || model.name.includes('72B')) score *= 1.40;
          if (model.id === 'qwq-32b-preview' || model.id === 'qwen-2-5-coder-32b' || model.id === 'llama-3-3-70b' || model.id === 'deepseek-r1') score *= 1.30;
        }
      }
      if (ans.reasoning_mode === 'extended_thinking' && model.tags && model.tags.includes('reasoning')) score *= 1.30;
      if (ans.budget_level === 'zero_cost' && model.inputPrice > 0 && model.license !== 'open_weights') score *= 0.35;
    } else if (p === 'api') {
      weights = { quality: 0.25, cost: 0.30, speed: 0.25, context: 0.10, privacy: 0.05, reliability: 0.05 };
      if (ans.latency_sla === 'ultra_fast') { weights.speed += 0.30; weights.cost += 0.10; }
      if (ans.context_scale === 'large_ctx') weights.context += 0.30;
      if (ans.api_budget === 'scale_budget') weights.cost += 0.35;
      else if (ans.api_budget === 'premium_api') { weights.quality += 0.35; weights.cost = 0.02; }

      score = computeWeightedSum(model, weights);
      if (ans.api_interface === 'strict_json') {
        if (model.provider === 'Google' || model.provider === 'OpenAI' || model.provider === 'Anthropic') score *= 1.25;
      } else if (ans.api_interface === 'multi_tool') {
        if (model.name.includes('Claude 3.7') || model.name.includes('Claude 3.5') || model.name.includes('GPT-4o') || model.name.includes('Gemini 2.5 Pro')) score *= 1.35;
        if (model.benchmarks && model.benchmarks.sweBench >= 45) score *= 1.20;
      }
      if (ans.latency_sla === 'ultra_fast') {
        if ((model.speedTps || 0) >= 110) score *= 1.35;
        else if ((model.speedTps || 0) < 50) score *= 0.70;
      }
      if (ans.context_scale === 'large_ctx') {
        if ((model.contextTokens || 0) >= 1000000) score *= 1.35;
        else if ((model.contextTokens || 0) >= 200000) score *= 1.25;
        else if ((model.contextTokens || 0) < 128000) score *= 0.60;
      }
      if (ans.api_budget === 'scale_budget') {
        if (model.inputPrice <= 0.25) score *= 1.35;
        else if (model.inputPrice > 2.0) score *= 0.50;
      } else if (ans.api_budget === 'premium_api') {
        if (model.scores && model.scores.quality >= 93) score *= 1.25;
      }
    } else if (p === 'enterprise') {
      weights = { quality: 0.30, cost: 0.10, speed: 0.10, context: 0.20, privacy: 0.20, reliability: 0.10 };
      if (ans.enterprise_compliance === 'air_gapped_onprem') weights.privacy += 0.35;
      if (ans.enterprise_context === 'archive_2m') weights.context += 0.30;

      score = computeWeightedSum(model, weights);
      if (ans.enterprise_compliance === 'air_gapped_onprem') {
        if (model.license !== 'open_weights') score *= 0.05;
        else {
          score *= 1.45;
          if (model.id === 'deepseek-r1' || model.id === 'llama-3-3-70b' || model.id === 'qwen-2-5-72b') score *= 1.30;
        }
      } else if (ans.enterprise_compliance === 'zdr_commercial') {
        if (model.provider === 'Anthropic' || model.provider === 'Google' || model.provider === 'OpenAI') score *= 1.25;
      }
      if (ans.enterprise_workload === 'legal_finance') {
        if (model.benchmarks && model.benchmarks.mmluPro >= 75) score *= 1.30;
        if (model.benchmarks && model.benchmarks.arenaElo >= 1350) score *= 1.20;
        if (model.name.match(/\b(7B|8B|3B|1B|6B|OpenChat)\b/i)) score *= 0.60;
        if (model.name.match(/\b(70B|72B|405B|R1|8x22B)\b/i) || model.id === 'deepseek-r1') score *= 1.25;
      }
      if (ans.enterprise_context === 'archive_2m') {
        if ((model.contextTokens || 0) >= 1000000) score *= 1.40;
      }
    } else if (p === 'student') {
      weights = { quality: 0.30, cost: 0.35, speed: 0.10, context: 0.15, privacy: 0.05, reliability: 0.05 };
      if (ans.academic_workload === 'book_summarization') { weights.context += 0.35; weights.cost += 0.10; }
      else if (ans.academic_workload === 'specialized_research') { weights.quality += 0.30; weights.reliability += 0.20; weights.cost -= 0.10; }
      else if (ans.academic_workload === 'exam_prep') { weights.quality += 0.20; weights.speed += 0.15; }
      else if (ans.academic_workload === 'homework_assignment') { weights.quality += 0.15; weights.cost += 0.20; }
      else if (ans.academic_workload === 'stem_math_logic') { weights.quality += 0.30; weights.speed -= 0.10; }

      score = computeWeightedSum(model, weights);
      if (ans.academic_workload === 'book_summarization') {
        if ((model.contextTokens || 0) >= 1000000) score *= 1.45;
        else if ((model.contextTokens || 0) >= 200000) score *= 1.20;
        else if ((model.contextTokens || 0) < 128000) score *= 0.60;
      } else if (ans.academic_workload === 'specialized_research') {
        if (model.benchmarks && model.benchmarks.mmluPro >= 84) score *= 1.30;
        if (model.benchmarks && model.benchmarks.arenaElo >= 1350) score *= 1.25;
      } else if (ans.academic_workload === 'exam_prep') {
        if (model.benchmarks && model.benchmarks.arenaElo >= 1300) score *= 1.25;
        if (model.scores && model.scores.quality >= 90) score *= 1.15;
      } else if (ans.academic_workload === 'stem_math_logic') {
        if (model.benchmarks && model.benchmarks.mmluPro >= 80) score *= 1.25;
        if (model.tags && model.tags.includes('reasoning')) score *= 1.35;
      }
      if (ans.student_budget === 'strictly_free') {
        if (model.inputPrice === 0 || model.license === 'open_weights') score *= 1.35;
        else if (model.inputPrice <= 0.20) score *= 1.20;
        else score *= 0.45;
      }
    } else if (p === 'creator') {
      weights = { quality: 0.40, cost: 0.15, speed: 0.15, context: 0.15, privacy: 0.05, reliability: 0.10 };
      score = computeWeightedSum(model, weights);
      if (ans.voice_nuance === 'avoid_cliches' || ans.creator_focus === 'longform_prose') {
        if (model.provider === 'Anthropic') score *= 1.35;
        else if (model.benchmarks?.arenaElo >= 1350) score *= 1.20;
      }
    }

    return score;
  }

  // ─── INTERACTIVE IN-CHAT RECOMMENDATION CARD BUILDER ──────────────────────
  function renderRecommendationCard(primary, runner, budget, ans, rawScore) {
    const normScore = Math.min(99, Math.round(rawScore));
    const trackBadgeMap = {
      coder: '💻 Developer',
      student: '🎒 Student',
      api: '🔌 API Builder',
      enterprise: '🏢 Enterprise',
      creator: '✍️ Creator'
    };
    const trackBadge = trackBadgeMap[ans.persona] || '🎯 AI Pick';

    let verdict = `Based on your request, <strong>${primary.name}</strong> is your ideal match.`;
    if (ans.persona === 'student') {
      if (ans.academic_workload === 'book_summarization') verdict = `<strong>${primary.name}</strong> provides a massive ${primary.contextWindow} window to ingest whole 300+ page books in a single prompt for $0.`;
      else if (ans.academic_workload === 'specialized_research') verdict = `<strong>${primary.name}</strong> provides verified high domain accuracy on medical and engineering benchmarks.`;
      else if (ans.academic_workload === 'exam_prep') verdict = `<strong>${primary.name}</strong> excels at generating challenging mock exam questions and step-by-step diagnostic answer keys.`;
      else verdict = `<strong>${primary.name}</strong> offers patient Socratic tutoring for assignments with generous free access.`;
    } else if (ans.persona === 'coder') {
      if (ans.env_target === 'local_consumer') verdict = `<strong>${primary.name}</strong> is lightweight open-weights, specifically sized to run offline on your 8GB–16GB laptop via Ollama.`;
      else if (ans.env_target === 'local_workstation') verdict = `<strong>${primary.name}</strong> is a high-parameter open-weights powerhouse for multi-file repo refactoring on local hardware.`;
      else verdict = `<strong>${primary.name}</strong> leads world coding benchmarks (SWE-bench Verified) for repository-level software engineering.`;
    } else if (ans.persona === 'api') {
      verdict = `<strong>${primary.name}</strong> delivers high reliability (${primary.speedTps ? primary.speedTps + ' t/s' : 'Fast'}) and competitive pricing (${primary.pricing}) for backend production.`;
    } else if (ans.persona === 'enterprise') {
      verdict = `<strong>${primary.name}</strong> satisfies your regulatory and governance boundaries with sovereign on-prem or ZDR compliance.`;
    }

    const safePrimary = escapeHtml(primary.name);
    const safeRunner = runner ? escapeHtml(runner.name) : '';

    return `
      <div class="atlas-card-recom">
        <div class="atlas-card-hdr">
          <span class="atlas-card-badge">🏆 #1 Recommendation</span>
          <span class="atlas-card-track">${trackBadge}</span>
        </div>
        <div class="atlas-card-body">
          <div class="atlas-card-title-row">
            <div>
              <div class="atlas-card-name">${safePrimary}</div>
              <div class="atlas-card-provider">${primary.provider} · Arena Elo ${primary.benchmarks?.arenaElo || 'Top Tier'}</div>
            </div>
            <div class="atlas-card-score-pill">
              <span>${normScore}</span>
              <span class="atlas-card-score-sub">Fit</span>
            </div>
          </div>
          <div class="atlas-card-verdict">${verdict}</div>
          <div class="atlas-card-specs">
            <div class="atlas-spec-item"><span>📏</span><span>Context: <strong>${primary.contextWindow}</strong></span></div>
            <div class="atlas-spec-item"><span>💵</span><span>Cost: <strong>${primary.pricing}</strong></span></div>
            <div class="atlas-spec-item"><span>⚡</span><span>Speed: <strong>${primary.speedTps ? primary.speedTps + ' t/s' : 'High Speed'}</strong></span></div>
            <div class="atlas-spec-item"><span>🛡️</span><span>License: <strong>${primary.license === 'open_weights' ? 'Open Weights' : 'API Service'}</strong></span></div>
          </div>
          ${runner ? `
            <div class="atlas-card-runner">
              <strong>Close Runner-up:</strong> ${safeRunner} (${runner.provider}, Elo ${runner.benchmarks?.arenaElo || 'Top'})
            </div>
          ` : ''}
          <div class="atlas-card-actions">
            <button type="button" class="atlas-action-btn" onclick="window.ModelAtlasChat.sendQuick('Show integration code and setup for ${safePrimary}')">💻 Code Setup</button>
            <button type="button" class="atlas-action-btn" onclick="window.ModelAtlasChat.sendQuick('What hardware and VRAM is needed for ${safePrimary}?')">🖥️ Hardware Specs</button>
            ${runner ? `<button type="button" class="atlas-action-btn" onclick="window.ModelAtlasChat.sendQuick('Compare ${safePrimary} vs ${safeRunner}')">⚖️ Compare vs ${safeRunner}</button>` : ''}
            ${runner ? `<a href="compare.html?m1=${encodeURIComponent(primary.id)}&m2=${encodeURIComponent(runner.id)}" class="atlas-action-btn" style="text-decoration:none">📊 Compare Page &rarr;</a>` : ''}
            <a href="leaderboard.html" class="atlas-action-btn" style="text-decoration:none">🏆 Leaderboard &rarr;</a>
          </div>
        </div>
      </div>
    `;
  }

  // ─── CONVERSATIONAL PRONOUN & MULTI-TURN RESOLVER ─────────────────────────
  function resolvePronounQuery(query, memory) {
    let q = query.trim();
    const lastModel = memory?.lastRecommendedModel;
    if (!lastModel) return q;

    // Replace pronouns like "it", "this model", "the model" with the actual model name
    const pronounRegex = /\b(it|this model|the model|this ai|that model)\b/gi;
    if (pronounRegex.test(q)) {
      return q.replace(pronounRegex, lastModel.name);
    }
    return q;
  }

  // ─── QUERY DISPATCHER (RAG + KNOWLEDGE ENGINE) ─────────────────────────────
  function queryKnowledgeEngine(rawQuery, context) {
    if (!ragIndex) buildRAGIndex();

    // Check multi-turn pronoun resolution
    const query = resolvePronounQuery(rawQuery, sessionMemory);
    const q = query.toLowerCase();
    const models = window.MODELS_DATA || [];

    // Helper: find model in database
    function findModel(str) {
      return models.find(m => str.includes(m.id) || str.includes(m.name.toLowerCase()));
    }

    // ─── PATH 1: CONVERSATIONAL RECOMMENDATION REQUEST ───
    if (detectRecommendationIntent(q)) {
      const extracted = extractConstraintsFromChat(query, sessionMemory);
      const scored = models.map(m => ({ model: m, score: scoreModelAdvisor(m, extracted) }));
      scored.sort((a, b) => b.score - a.score);

      const primary = scored[0].model;
      const runner = scored[1] ? scored[1].model : null;
      const budget = scored.slice(0, 8).sort((a, b) => ((b.model.scores?.cost || 0) - (a.model.scores?.cost || 0)))[0].model;

      // Save to conversational memory
      sessionMemory.lastRecommendedModel = primary;
      sessionMemory.runnerModel = runner;
      sessionMemory.budgetModel = budget;
      sessionMemory.activeTrack = extracted.persona;
      sessionMemory.extractedConstraints = extracted;

      const cardHtml = renderRecommendationCard(primary, runner, budget, extracted, scored[0].score);
      return cardHtml;
    }

    // ─── PATH 2: QUIZ CONTEXT EXPLANATION ───
    if (context && (q.includes('why this') || q.includes('my pick') || q.includes('my recommendation') || q.includes('why was this chosen'))) {
      const top = context.primary;
      const runner = context.runner;
      return `
        🎯 <strong>Why ${top.name} is your #1 match:</strong><br><br>
        Based on your profile (<strong>${context.track || 'Selected'}</strong> track):
        <ul>
          <li><strong>Benchmark Standing:</strong> LMSYS Arena Elo <strong>${top.benchmarks?.arenaElo || 'Top'}</strong> places it in the upper echelon of verified models.</li>
          <li><strong>Context Window:</strong> Its <strong>${top.contextWindow}</strong> capacity fits your document and workflow volume without truncation.</li>
          <li><strong>Pricing & Architecture:</strong> At <strong>${top.pricing}</strong>, it optimizes your budget and execution boundaries.</li>
        </ul>
        ${runner ? `<strong>Alternative to consider:</strong> <em>${runner.name}</em> (Elo ${runner.benchmarks?.arenaElo || 'Top'}) is a strong runner-up.` : ''}
      `;
    }

    // ─── PATH 3: CODE INTEGRATION SNIPPET (Checked before hardware) ───
    if (q.includes('code') || q.includes('python') || q.includes('curl') || q.includes('sdk') || q.includes('integrate') || q.includes('ollama run') || q.includes('snippet') || q.includes('script')) {
      const target = findModel(q) || sessionMemory.lastRecommendedModel || models.find(m => m.id === 'claude-3-7-sonnet');
      if (target.license === 'open_weights') {
        const ollamaTag = target.id.replace(/-instruct|-chat/g, '');
        return `
          💻 <strong>Local Ollama Execution (${target.name}):</strong><br>
          <pre style="position:relative"><button class="atlas-copy-code-btn" type="button" onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText); this.textContent='✓ Copied!'; setTimeout(()=>this.textContent='📋 Copy', 1500)">📋 Copy</button><code># 1. Pull and run locally via Ollama
ollama run ${ollamaTag}

# 2. Test in Python (OpenAI-compatible local server)
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
response = client.chat.completions.create(
    model="${ollamaTag}",
    messages=[{"role": "user", "content": "Hello ModelAtlas!"}]
)
print(response.choices[0].message.content)</code></pre>
        `;
      }
      if (target.provider === 'Anthropic') {
        return `
          💻 <strong>Anthropic Python Integration (${target.name}):</strong><br>
          <pre style="position:relative"><button class="atlas-copy-code-btn" type="button" onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText); this.textContent='✓ Copied!'; setTimeout(()=>this.textContent='📋 Copy', 1500)">📋 Copy</button><code>import anthropic

client = anthropic.Anthropic()
response = client.messages.create(
    model="${target.id}",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello ModelAtlas!"}]
)
print(response.content[0].text)</code></pre>
        `;
      }
      return `
        💻 <strong>OpenAI-Compatible Python Integration (${target.name}):</strong><br>
        <pre style="position:relative"><button class="atlas-copy-code-btn" type="button" onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText); this.textContent='✓ Copied!'; setTimeout(()=>this.textContent='📋 Copy', 1500)">📋 Copy</button><code>from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="${target.id}",
    messages=[{"role": "user", "content": "Hello ModelAtlas!"}]
)
print(response.choices[0].message.content)</code></pre>
      `;
    }

    // ─── PATH 4: HARDWARE & VRAM SIZING ───
    if (q.includes('hardware') || q.includes('vram') || q.includes('gpu memory') || q.includes('quantiz') || 
        (q.includes('run') && (q.includes('local') || q.includes('offline') || q.includes('laptop') || q.includes('mac') || q.includes('workstation') || q.includes('gpu') || q.includes('spec') || q.includes('self-host'))) ||
        (q.includes('ram') && !q.includes('program'))) {
      const targetModel = findModel(q) || sessionMemory.lastRecommendedModel;
      if (targetModel && (targetModel.name.includes('70B') || targetModel.name.includes('72B'))) {
        return `
          🖥️ <strong>Hardware Guide for 70B Models (${targetModel.name}):</strong><br><br>
          <ul>
            <li><strong>4-Bit Quantization (Q4_K_M via Ollama/vLLM):</strong> Requires <strong>~40GB VRAM</strong>. Setup: 2x NVIDIA RTX 3090/4090 (24GB each) or Mac Studio / MacBook with <strong>48GB–64GB Unified Memory</strong>.</li>
            <li><strong>8-Bit (FP8):</strong> Requires <strong>~75GB VRAM</strong> (1x NVIDIA H100 80GB or 1x A100 80GB).</li>
            <li><strong>Full 16-Bit (BF16):</strong> Requires <strong>~145GB VRAM</strong> (2x A100/H100 80GB).</li>
          </ul>
          💡 <em>Tip: For a single consumer GPU (8GB–16GB VRAM), use <strong>Qwen 2.5 Coder 32B (Q4 ~20GB)</strong> or <strong>Llama 3.1 8B (Q4 ~5.5GB)</strong>.</em>
        `;
      }
      if (targetModel && (targetModel.name.includes('R1') || targetModel.name.includes('V3') || targetModel.name.includes('671B'))) {
        return `
          ⚡ <strong>Hardware Guide for DeepSeek R1 & V3 (671B MoE):</strong><br><br>
          Because R1 has 671B total parameters (37B active):
          <ul>
            <li><strong>Full Deployment:</strong> Requires an 8x H100/A100 GPU cluster (~600GB VRAM).</li>
            <li><strong>Quantized Local Deployment (IQ1_S to Q4):</strong> Requires a Mac with <strong>128GB to 192GB Unified Memory</strong>.</li>
            <li><strong>Best Practical Setup:</strong> For 99% of developers, run DeepSeek R1 via managed API at <strong>$0.55 / $2.19 per M</strong> for instant speed with zero server capex.</li>
          </ul>
        `;
      }
      if (targetModel && (targetModel.name.includes('7B') || targetModel.name.includes('8B') || targetModel.name.includes('14B'))) {
        return `
          💻 <strong>Hardware Guide for Small Models (${targetModel.name}):</strong><br><br>
          <ul>
            <li><strong>7B / 8B in Q4:</strong> Fits in <strong>~5.5GB VRAM</strong> (runs smoothly on any RTX 3060/4060 or 16GB Apple Silicon Mac at >100 tokens/sec).</li>
            <li><strong>14B in Q4:</strong> Fits in <strong>~9.5GB–11GB VRAM</strong> (ideal for single 12GB–16GB RTX 4070/4080 GPUs).</li>
          </ul>
        `;
      }
      return `
        🖥️ <strong>General VRAM Estimation Formula:</strong><br><br>
        <code>VRAM (GB) ≈ (Parameters in Billions × Bytes per Weight) × 1.25 (KV Cache overhead)</code><br><br>
        • <strong>8B model in Q4:</strong> ~5.5 GB VRAM<br>
        • <strong>14B model in Q4:</strong> ~9.5 GB VRAM<br>
        • <strong>32B model in Q4:</strong> ~20.5 GB VRAM<br>
        • <strong>70B model in Q4:</strong> ~40 GB VRAM<br>
        • <strong>405B model in Q4:</strong> ~230 GB VRAM
      `;
    }

    // ─── PATH 5: CONTEXT WINDOW LEADERS ───
    if (q.includes('context') || q.includes('1m') || q.includes('2m') || q.includes('long document') || q.includes('largest context') || q.includes('million tokens')) {
      return `
        📚 <strong>Ultra-Long Context Leaders:</strong><br><br>
        <ul>
          <li><strong>Gemini 2.5 Pro:</strong> <strong>2,000,000 tokens</strong> (~1.5 million words / 3,000 pages of code or text in a single prompt).</li>
          <li><strong>Gemini 2.5 Flash:</strong> <strong>1,000,000 tokens</strong> with sub-second retrieval at $0.15 / $0.60 per M.</li>
          <li><strong>Amazon Nova Pro:</strong> <strong>300,000 tokens</strong> on AWS Bedrock.</li>
          <li><strong>Codestral 22B:</strong> <strong>256,000 tokens</strong> for massive code repositories.</li>
          <li><strong>Claude 3.7 Sonnet / OpenAI o3-mini:</strong> <strong>200,000 tokens</strong> with high needle-in-haystack accuracy.</li>
        </ul>
      `;
    }

    // ─── PATH 6: HEAD-TO-HEAD COMPARISON ───
    if (q.includes('compare') || q.includes(' vs ') || q.includes('versus') || q.includes('difference between')) {
      const m1 = findModel(q) || sessionMemory.lastRecommendedModel;
      const remaining = m1 ? q.replace(m1.id, '').replace(m1.name.toLowerCase(), '') : q;
      const m2 = findModel(remaining) || sessionMemory.runnerModel;

      if (m1 && m2 && m1.id !== m2.id) {
        const higherElo = (m1.benchmarks?.arenaElo || 0) >= (m2.benchmarks?.arenaElo || 0) ? m1 : m2;
        const lowerElo = higherElo.id === m1.id ? m2 : m1;
        return `
          ⚖️ <strong>Head-to-Head: ${m1.name} vs. ${m2.name}</strong><br><br>
          <ul>
            <li><strong>LMSYS Arena Elo:</strong> <strong>${higherElo.name}</strong> leads at <strong>${higherElo.benchmarks?.arenaElo || '—'}</strong> vs <strong>${lowerElo.benchmarks?.arenaElo || '—'}</strong>.</li>
            <li><strong>Coding Elo:</strong> ${m1.name}: <code>${m1.benchmarks?.arenaCoding || '—'}</code> | ${m2.name}: <code>${m2.benchmarks?.arenaCoding || '—'}</code></li>
            <li><strong>Context Window:</strong> ${m1.name} (<strong>${m1.contextWindow}</strong>) vs. ${m2.name} (<strong>${m2.contextWindow}</strong>)</li>
            <li><strong>Throughput Speed:</strong> ${m1.name} (<strong>${m1.speedTps ? m1.speedTps + ' t/s' : '—'}</strong>) vs. ${m2.name} (<strong>${m2.speedTps ? m2.speedTps + ' t/s' : '—'}</strong>)</li>
            <li><strong>API Pricing:</strong> ${m1.name} (${m1.pricing}) vs. ${m2.name} (${m2.pricing})</li>
          </ul>
          💡 <em>Verdict: Choose <strong>${m1.name}</strong> for ${m1.bestForLabel || 'performance'}, or <strong>${m2.name}</strong> for ${m2.bestForLabel || 'value'}.</em>
        `;
      }
    }

    // ─── PATH 7: TOKEN COST CALCULATIONS ───
    if (q.includes('cost') || q.includes('price') || q.includes('pricing') || q.includes('how much') || q.includes('tokens')) {
      const target = findModel(q) || sessionMemory.lastRecommendedModel || models[0];
      const millionMatch = q.match(/(\d+)\s*(million|m\b)/i);
      const numMillions = millionMatch ? parseInt(millionMatch[1], 10) : 1;

      const inCost = ((target.inputPrice || 0.15) * numMillions).toFixed(2);
      const outCost = ((target.outputPrice || 0.60) * numMillions).toFixed(2);
      const blendedCost = (((target.inputPrice || 0.15) * 0.75 + (target.outputPrice || 0.60) * 0.25) * numMillions).toFixed(2);

      return `
        💵 <strong>Cost Estimation for ${target.name} (${numMillions}M Tokens):</strong><br><br>
        Standard pricing: <code>$${target.inputPrice || 0} input / $${target.outputPrice || 0} output per 1M tokens</code><br><br>
        For <strong>${numMillions} million tokens</strong>:<br>
        • All Input tokens: <strong>$${inCost}</strong><br>
        • All Output tokens: <strong>$${outCost}</strong><br>
        • Typical Blended workflow (3:1 input-to-output ratio): <strong>~$${blendedCost}</strong><br><br>
        ${target.license === 'open_weights' ? '💡 <em>This model is open-weights. You can also self-host it for $0 API token costs!</em>' : ''}
      `;
    }

    // ─── PATH 8: STUDENT DOMAIN WORKFLOWS ───
    if (q.includes('free student') || q.includes('without a credit card') || q.includes('free access') || (q.includes('free') && q.includes('student'))) {
      return `
        🆓 <strong>How to Use Top AI Models 100% Free as a Student:</strong><br><br>
        You do <strong>not</strong> need to pay $20/month. Here is how to access frontier intelligence at zero cost:<br><br>
        <ol>
          <li><strong>Google AI Studio (Gemini 2.5 Pro & Flash):</strong> Free access with your Google account. Gives you a <strong>2 Million token context window</strong> for full textbooks completely free.</li>
          <li><strong>DeepSeek Web (chat.deepseek.com):</strong> 100% free web chat with <strong>DeepSeek R1</strong> (world-class math reasoning) and <strong>DeepSeek V3</strong> with no credit card required.</li>
          <li><strong>Local Ollama (Offline Laptop):</strong> Download <strong>Ollama</strong> (free) and run <strong>Qwen 2.5 Coder 7B</strong> or <strong>Llama 3.1 8B</strong> on your laptop with zero internet required.</li>
        </ol>
      `;
    }
    if (q.includes('exam') || q.includes('sample question') || q.includes('mock') || q.includes('quiz') || q.includes('test prep')) {
      const target = sessionMemory.lastRecommendedModel || findModel(q) || { name: 'Claude 3.7 Sonnet' };
      return `
        🎯 <strong>Exam Prep & Practice Test Generator with ${target.name}:</strong><br><br>
        High reasoning models excel at generating authentic exam questions because they understand curriculum standards.<br><br>
        <strong>Recommended Exam Prompt Template:</strong><br>
        <pre>Act as a university professor in [Subject, e.g., Fluid Mechanics / Organic Chemistry].
Generate 5 challenging exam questions (3 Multiple Choice with tricky distractors + 2 Conceptual Proofs).
Provide an answer key with detailed step-by-step rationales explaining why incorrect options are wrong.</pre>
        <strong>Top Models for Exam Creation:</strong>
        <ul>
          <li><strong>Claude 3.7 Sonnet:</strong> Best for conceptual essay questions and clinical vignettes.</li>
          <li><strong>DeepSeek R1 / OpenAI o3-mini:</strong> Best for STEM, physics derivations, and calculus.</li>
          <li><strong>Gemini 2.5 Flash:</strong> Ultra-fast generation of 50+ question flashcard decks in seconds.</li>
        </ul>
      `;
    }
    if (q.includes('textbook') || q.includes('summarize book') || q.includes('300 page') || q.includes('whole book') || q.includes('chapter')) {
      return `
        📖 <strong>Textbook & Whole-Book Summarization Strategy:</strong><br><br>
        To summarize entire 300+ page books or textbooks without hitting context limits or losing details:<br><br>
        <ul>
          <li><strong>#1 Pick — Gemini 2.5 Pro (2M Tokens):</strong> Fits an entire 1,500-page textbook in a single prompt. Free in Google AI Studio.</li>
          <li><strong>#2 Pick — Gemini 2.5 Flash (1M Tokens):</strong> Ultra-fast generation of chapter flashcards and outlines in under 5 seconds.</li>
          <li><strong>#3 Pick — Claude 3.7 Sonnet (200K Tokens):</strong> Ideal for 50–100 page course packets, retaining high academic nuance.</li>
        </ul>
      `;
    }
    if (q.includes('medical') || q.includes('engineering') || q.includes('clinical') || q.includes('coursework') || q.includes('usmle')) {
      return `
        🩺 <strong>Medical & Engineering Coursework Research:</strong><br><br>
        Technical courses require high benchmark scores on domain-specific evaluations (MedQA, MMLU-Pro STEM, MATH-500) where hallucinations can be dangerous:<br><br>
        <ul>
          <li><strong>Medicine & Life Sciences (USMLE / Anatomy / Pharmacology):</strong>
            <br>• <strong>Claude 3.7 Sonnet / GPT-4o:</strong> Highest accuracy on multi-step clinical diagnostic vignettes.
            <br>• <strong>DeepSeek R1:</strong> Outstanding at biochemical reaction mechanisms and genetics proofs.
          </li>
          <li><strong>Engineering (Mechanical, Electrical, Chemical, Civil):</strong>
            <br>• <strong>OpenAI o3-mini / DeepSeek R1:</strong> Chain-of-thought models that derive formulas and thermodynamics integrals step-by-step.
          </li>
        </ul>
      `;
    }

    // ─── PATH 6: RAG RETRIEVAL GENERAL FALLBACK ───
    const ragResults = ragIndex.search(query, 2);
    if (ragResults.length > 0) {
      let ragSnippets = ragResults.map(r => {
        if (r.item.type === 'knowledge') {
          return `<strong>📘 ${r.item.data.title}:</strong><br>${r.item.data.content.replace(/\n/g, '<br>')}`;
        } else {
          const m = r.item.data;
          return `<strong>🤖 ${m.name} (${m.provider}):</strong> LMSYS Arena Elo <code>${m.benchmarks?.arenaElo || 'Top'}</code>, Context <code>${m.contextWindow}</code>, Price <code>${m.pricing}</code>.`;
        }
      }).join('<br><br>');

      return `
        💡 <strong>ModelAtlas RAG Knowledge Retrieval:</strong><br><br>
        ${ragSnippets}<br><br>
        Try asking: <em>"What model should I use for [your task]?"</em> or <em>"How much VRAM do I need for 70B?"</em>
      `;
    }

    // Safe fallback
    return `
      💡 <strong>ModelAtlas Advisor:</strong><br><br>
      You asked about: <em>"${escapeHtml(query)}"</em>.<br><br>
      We index <strong>384 models</strong> across LMSYS Arena, SWE-bench Verified, and Artificial Analysis.
      Try asking:
      <ul>
        <li><em>"Recommend a model for coding on a 16GB laptop"</em></li>
        <li><em>"Best model for summarizing 300-page textbooks for free"</em></li>
        <li><em>"How much VRAM do I need for Llama 3.3 70B?"</em></li>
        <li><em>"Compare Claude 3.7 vs o3-mini"</em></li>
      </ul>
    `;
  }

  // ─── LIVE LLM BACKEND WITH RAG AUGMENTATION ────────────────────────────────
  async function callLiveLLM(query, context) {
    if (!ragIndex) buildRAGIndex();
    const ragMatches = ragIndex.search(query, 3);
    const retrievedFacts = ragMatches.map(r => {
      if (r.item.type === 'knowledge') return `[FACT]: ${r.item.data.content}`;
      const m = r.item.data;
      return `[MODEL]: ${m.name} | Provider: ${m.provider} | Arena Elo: ${m.benchmarks?.arenaElo} | Coding Elo: ${m.benchmarks?.arenaCoding} | Context: ${m.contextWindow} | Price: ${m.pricing} | License: ${m.license}`;
    }).join('\n');

    const systemPrompt = `You are the ModelAtlas AI Advisor. Use the following verified benchmark facts from the ModelAtlas 384-model database to ground your response. Do not hallucinate:
=== VERIFIED BENCHMARK & HARDWARE FACTS ===
${retrievedFacts}
=== CONVERSATION STATE ===
Last model: ${sessionMemory.lastRecommendedModel ? sessionMemory.lastRecommendedModel.name : 'None'}
Track: ${sessionMemory.activeTrack || 'General'}`;

    if (customApiEndpoint === 'ollama') {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `${systemPrompt}\n\nUser: ${query}\nAssistant:`,
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
          ]
        })
      });
      const data = await res.json();
      return data.choices[0].message.content;
    }
    return null;
  }

  // ─── MESSAGE HANDLERS ──────────────────────────────────────────────────────
  async function handleUserMessage(text) {
    appendUserMessage(text);
    sessionMemory.turns.push({ role: 'user', text });

    // Typing indicator
    const container = document.getElementById('atlas-chat-msgs');
    const loadingId = 'loading-' + Date.now();
    const loadingEl = document.createElement('div');
    loadingEl.id = loadingId;
    loadingEl.className = 'atlas-msg atlas-msg-bot';
    loadingEl.innerHTML = `<div class="atlas-msg-bubble" style="opacity:0.7">Searching 384 model benchmarks via RAG...</div>`;
    container.appendChild(loadingEl);
    container.scrollTop = container.scrollHeight;

    try {
      let botHtml = '';
      if (customApiEndpoint !== 'smart_engine' && (customApiKey || customApiEndpoint === 'ollama')) {
        try {
          const liveText = await callLiveLLM(text, activeQuizContext);
          botHtml = escapeHtml(liveText).replace(/\n/g, '<br>');
        } catch (err) {
          botHtml = `⚠️ Live API unreachable (${err.message}). Grounded response via RAG Knowledge Engine:<br><br>` + queryKnowledgeEngine(text, activeQuizContext);
        }
      } else {
        await new Promise(r => setTimeout(r, 160)); // Natural responsiveness
        botHtml = queryKnowledgeEngine(text, activeQuizContext);
      }

      document.getElementById(loadingId)?.remove();
      appendBotMessage(botHtml);
      sessionMemory.turns.push({ role: 'bot', text: botHtml });
    } catch (e) {
      document.getElementById(loadingId)?.remove();
      appendBotMessage(`❌ Error processing query: ${e.message}`);
    }
  }

  // ─── UI BUILDER ────────────────────────────────────────────────────────────
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
              <span id="atlas-status-text">RAG Brain · 384 Models</span>
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
          ModelAtlas runs our instant In-Browser RAG Knowledge Engine over 384 models with zero API cost. You can optionally connect a live backend below.
        </p>
        <div class="atlas-settings-field">
          <label>Inference Engine</label>
          <select class="atlas-settings-input" id="atlas-engine-select" style="padding:6px 8px">
            <option value="smart_engine">⚡ In-Browser RAG Knowledge Engine (Free / Instant)</option>
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
            I run an <strong>In-Browser RAG Engine</strong> indexing <strong>384+ models</strong> across LMSYS Arena, SWE-bench Verified, and Artificial Analysis.
            <br><br>
            Ask me for a model recommendation, or ask about VRAM hardware sizing, token pricing, and setup code!
          </div>
          <span class="atlas-msg-time">Just now</span>
        </div>
      </div>

      <!-- Quick Suggestion Pills -->
      <div class="atlas-chat-pills" id="atlas-chat-pills">
        <button class="atlas-pill" data-q="Recommend a model for coding on a 16GB laptop">💻 16GB Laptop Coding</button>
        <button class="atlas-pill" data-q="Best free model for 300 page textbook summaries">📖 Textbook Summarizer</button>
        <button class="atlas-pill" data-q="What hardware is needed to run Llama 3.3 70B locally?">🖥️ 70B VRAM Hardware</button>
        <button class="atlas-pill" data-q="Compare Claude 3.7 vs OpenAI o3-mini">⚖️ Claude 3.7 vs o3-mini</button>
        <button class="atlas-pill" data-q="Best API model for strict JSON with sub-400ms latency">⚡ Sub-400ms JSON API</button>
      </div>

      <!-- Input Row -->
      <div class="atlas-chat-input-row">
        <textarea class="atlas-chat-input" id="atlas-chat-input" placeholder="Ask for a model recommendation, VRAM specs, pricing, or code..." rows="1"></textarea>
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
      appendBotMessage(`⚙️ Settings saved. Operating with: <strong>${customApiEndpoint === 'smart_engine' ? 'In-Browser RAG Knowledge Engine' : customApiEndpoint}</strong>.`);
    });

    // Clear context
    document.getElementById('atlas-context-clear').addEventListener('click', () => {
      activeQuizContext = null;
      sessionMemory.lastRecommendedModel = null;
      sessionMemory.runnerModel = null;
      sessionMemory.budgetModel = null;
      sessionMemory.activeTrack = null;
      document.getElementById('atlas-context-bar').style.display = 'none';
      appendBotMessage("🔄 Cleared context. What model or workload would you like to explore next?");
    });

    // Quick pills delegation
    document.getElementById('atlas-chat-pills').addEventListener('click', (e) => {
      const pill = e.target.closest('.atlas-pill');
      if (pill && pill.dataset.q) {
        handleUserMessage(pill.dataset.q);
      }
    });

    // Input handlers
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

    // Build the RAG index
    buildRAGIndex();
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
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    sendQuick: function (prompt) {
      toggleChat(true);
      handleUserMessage(prompt);
    },
    setQuizContext: function (ctx) {
      activeQuizContext = ctx;
      if (ctx && ctx.primary) {
        sessionMemory.lastRecommendedModel = ctx.primary;
        sessionMemory.runnerModel = ctx.runner;
        sessionMemory.budgetModel = ctx.budget;
        sessionMemory.activeTrack = ctx.answers?.persona;
      }
      const bar = document.getElementById('atlas-context-bar');
      const label = document.getElementById('atlas-context-label');
      if (bar && label && ctx && ctx.primary) {
        label.textContent = `🎯 Profile: ${ctx.track || 'Quiz'} • Top Pick: ${ctx.primary.name}`;
        bar.style.display = 'flex';
      }
    },
    query: function (q, ctx) {
      return queryKnowledgeEngine(q, ctx || activeQuizContext);
    },
    getMemory: function () {
      return sessionMemory;
    }
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }
})();
