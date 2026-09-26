import { useMemo, useState } from 'react';
import { benchmarkSnapshotDate, models } from './data/models.js';
import { getLeaderboard, getRecommendation } from './logic/scoring.js';

const defaultForm = {
  user_type: 'individual',
  task: 'coding',
  priority: 'balanced',
  speed: 'medium',
  context: 'medium',
  privacy: 'preferred',
  codebase_size: 'medium',
  tool_use: 'basic',
  validation: 'balanced',
  source_volume: 'medium',
  fact_checking: 'preferred',
  research_mode: 'fact_checking',
  output_length: 'medium',
  writing_style: 'technical',
  document_volume: 'medium',
  summary_depth: 'balanced',
  automation_level: 'medium',
  assistant_usage: 'structured',
  extraction_precision: 'high',
  document_type: 'reports',
  deployment: 'cloud'
};

const roleOptions = [
  { value: 'individual', title: 'Solo professional', meta: 'Fast, private, and practical for day-to-day work.' },
  { value: 'freelancer', title: 'Freelancer', meta: 'Balance budget, speed, and client-facing quality.' },
  { value: 'small_business', title: 'Small business', meta: 'Reliable, cost-aware support for team workflows.' },
  { value: 'business', title: 'Business', meta: 'Structured execution for teams and operations.' },
  { value: 'enterprise', title: 'Enterprise', meta: 'High-trust, secure, context-heavy choices.' }
];

const roleGuide = {
  individual: {
    title: 'Solo professional workflow',
    copy: 'Prioritize quick output, low friction, and good value for daily work.',
    picks: [
      { label: 'Productivity', value: 'general' },
      { label: 'Writing', value: 'writing' },
      { label: 'Research', value: 'research' }
    ]
  },
  freelancer: {
    title: 'Freelancer workflow',
    copy: 'Aim for strong client quality while keeping costs efficient and turnaround fast.',
    picks: [
      { label: 'Writing', value: 'writing' },
      { label: 'Research', value: 'research' },
      { label: 'Summaries', value: 'summarization' }
    ]
  },
  small_business: {
    title: 'Small business workflow',
    copy: 'Balance quality, speed, and value for team-wide knowledge work.',
    picks: [
      { label: 'General help', value: 'general' },
      { label: 'Business ops', value: 'business' },
      { label: 'Coding', value: 'coding' }
    ]
  },
  business: {
    title: 'Team workflow',
    copy: 'Look for reliability, structure, and better context handling for operations.',
    picks: [
      { label: 'Summaries', value: 'summarization' },
      { label: 'Research', value: 'research' },
      { label: 'General AI', value: 'general' }
    ]
  },
  enterprise: {
    title: 'Enterprise workflow',
    copy: 'Favor secure, context-rich, high-trust choices with strong compliance posture.',
    picks: [
      { label: 'Research', value: 'research' },
      { label: 'Extraction', value: 'extraction' },
      { label: 'Coding', value: 'coding' }
    ]
  }
};

function formatDate(dateString) {
  if (!dateString) return 'unknown';
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(
    new Date(`${dateString}T00:00:00`),
  );
}

function getMetricSummary() {
  const valueModel = [...models].sort((a, b) => (b.costEfficiency ?? 0) - (a.costEfficiency ?? 0))[0];
  const frontierModel = [...models].sort((a, b) => (b.quality ?? 0) - (a.quality ?? 0))[0];
  const useCases = new Set(models.flatMap((model) => Object.keys(model.benchmarks ?? {}))).size;

  return {
    modelsTracked: models.length,
    useCasesTracked: useCases,
    bestValueModel: valueModel?.name ?? 'Unavailable',
    frontierModel: frontierModel?.name ?? 'Unavailable'
  };
}

function App() {
  const [activePage, setActivePage] = useState('home');
  const [form, setForm] = useState(defaultForm);

  const metrics = useMemo(() => getMetricSummary(), []);
  const recommendation = useMemo(() => getRecommendation(form), [form]);
  const leaderboard = useMemo(() => getLeaderboard(form.task), [form.task]);
  const currentRoleGuide = roleGuide[form.user_type] ?? roleGuide.individual;

  const handleRoleSelect = (value) => setForm((previous) => ({ ...previous, user_type: value }));
  const handleTaskSelect = (value) => setForm((previous) => ({ ...previous, task: value }));

  return (
    <>
      <style>{`
        :root {
          --bg: #09090b;
          --panel: rgba(18, 18, 20, 0.8);
          --panel-strong: rgba(21, 21, 23, 0.96);
          --panel-soft: rgba(26, 26, 30, 0.9);
          --border: rgba(255,255,255,0.08);
          --text: #f8fafc;
          --muted: #a1a1aa;
          --subtle: #d4d4d8;
          --amber: #f59e0b;
          --amber-soft: rgba(245, 158, 11, 0.12);
          --orange: #f97316;
          --shadow: rgba(0, 0, 0, 0.28);
        }

        * { box-sizing: border-box; }
        html, body, #root { margin: 0; min-height: 100%; background: var(--bg); }
        body {
          background:
            radial-gradient(circle at top left, rgba(245, 158, 11, 0.12), transparent 18%),
            radial-gradient(circle at bottom right, rgba(249, 115, 22, 0.12), transparent 22%),
            var(--bg);
          color: var(--text);
          font-family: Inter, 'Segoe UI', sans-serif;
        }
        button, select { font: inherit; }

        .obsidian-app {
          min-height: 100vh;
          background: linear-gradient(180deg, rgba(9,9,11,0.98), rgba(9,9,11,1));
          color: var(--text);
        }

        .obsidian-container {
          width: min(1180px, calc(100vw - 32px));
          margin: 0 auto;
          padding: 26px 0 60px;
        }

        .obsidian-nav {
          position: sticky;
          top: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 18px;
          margin-bottom: 24px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: rgba(9, 9, 11, 0.72);
          backdrop-filter: blur(12px);
          box-shadow: 0 18px 36px rgba(0,0,0,0.2);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }

        .brand-mark {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24, #f97316);
          color: #111827;
          font-weight: 800;
          box-shadow: 0 12px 24px rgba(245, 158, 11, 0.18);
        }

        .brand-name {
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .nav-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .nav-button {
          border: 1px solid transparent;
          background: transparent;
          color: var(--muted);
          padding: 9px 12px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          text-transform: capitalize;
          transition: all 0.2s ease;
        }

        .nav-button.active,
        .nav-button:hover {
          background: rgba(245, 158, 11, 0.08);
          border-color: rgba(245, 158, 11, 0.25);
          color: var(--text);
        }

        .page-shell {
          animation: fadeUp 0.45s ease;
        }

        .hero-panel {
          position: relative;
          text-align: center;
          padding: 28px 0 10px;
        }

        .hero-glow {
          position: absolute;
          left: 50%;
          top: 34%;
          width: 520px;
          height: 520px;
          transform: translate(-50%, -50%);
          background: rgba(245, 158, 11, 0.09);
          filter: blur(100px);
          pointer-events: none;
        }

        .eyebrow {
          display: inline-block;
          margin: 0 0 14px;
          color: var(--muted);
          font-size: 0.73rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hero-copy {
          position: relative;
          max-width: 920px;
          margin: 0 auto;
        }

        .hero-copy h1 {
          margin: 0 auto;
          max-width: 980px;
          font-size: clamp(2.8rem, 5vw, 5.4rem);
          line-height: 1.04;
          letter-spacing: -0.06em;
          font-weight: 900;
        }

        .gradient-text {
          background: linear-gradient(90deg, #fbbf24, #f97316);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-subtitle {
          margin: 20px auto 0;
          max-width: 760px;
          color: var(--muted);
          font-size: 1.08rem;
          line-height: 1.7;
        }

        .cta-row {
          margin-top: 28px;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .primary-btn,
        .secondary-btn {
          border: none;
          border-radius: 14px;
          padding: 0.95rem 1.45rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, filter 0.2s ease;
        }

        .primary-btn {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #111827;
          box-shadow: 0 16px 28px rgba(245, 158, 11, 0.2);
        }

        .secondary-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          color: var(--text);
        }

        .primary-btn:hover,
        .secondary-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 18px;
          margin-top: 42px;
        }

        .stat-card,
        .feature-card,
        .panel,
        .role-card,
        .task-card,
        .leaderboard-table,
        .result-box {
          border: 1px solid var(--border);
          background: rgba(18,18,20,0.82);
          box-shadow: 0 18px 30px rgba(0,0,0,0.14);
        }

        .stat-card {
          padding: 20px 18px;
          border-radius: 18px;
        }

        .stat-label {
          display: block;
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .stat-value {
          font-size: clamp(1.5rem, 2vw, 2.3rem);
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .value-accent { color: #fbbf24; }
        .value-alt { color: #f97316; }

        .section-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(220px, 1fr));
          gap: 18px;
          margin-top: 30px;
        }

        .feature-card {
          padding: 22px 18px;
          border-radius: 20px;
        }

        .feature-pill {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          color: var(--subtle);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .feature-card h3 {
          margin: 12px 0 10px;
          font-size: 1.2rem;
          letter-spacing: -0.03em;
        }

        .feature-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .panel {
          padding: 30px 28px;
          border-radius: 24px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 14px;
          margin-bottom: 16px;
        }

        .panel-header h2 {
          margin: 0;
          font-size: clamp(1.8rem, 2.4vw, 2.5rem);
          letter-spacing: -0.04em;
        }

        .panel-copy {
          margin: 0;
          max-width: 760px;
          color: var(--muted);
          line-height: 1.8;
        }

        .progress {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin: 26px 0;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--muted);
          font-weight: 700;
        }

        .step-number {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
        }

        .step.active .step-number {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245,158,11,0.28);
          color: #fbbf24;
        }

        .step.active {
          color: var(--text);
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(200px, 1fr));
          gap: 18px;
          margin-top: 8px;
        }

        .role-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          text-align: left;
          padding: 22px 20px;
          border-radius: 18px;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .role-card:hover,
        .role-card.selected {
          transform: translateY(-1px);
          border-color: rgba(245, 158, 11, 0.24);
          background: rgba(245, 158, 11, 0.04);
        }

        .role-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          color: #fbbf24;
          font-weight: 800;
        }

        .role-card h3 {
          margin: 0;
          font-size: 1.12rem;
        }

        .role-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
        }

        .task-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(220px, 1fr));
          gap: 14px;
          margin-top: 18px;
        }

        .task-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 18px;
          border-radius: 16px;
          color: var(--text);
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        .task-card:hover {
          border-color: rgba(245, 158, 11, 0.24);
        }

        .speed-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          color: var(--subtle);
          font-size: 0.73rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .input-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(220px, 1fr));
          gap: 14px;
          margin-top: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          color: var(--muted);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .field select {
          appearance: none;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0.82rem 0.9rem;
          background: rgba(255,255,255,0.02);
          color: var(--text);
        }

        .result-box {
          margin-top: 24px;
          padding: 22px 20px;
          border-radius: 22px;
          border-color: rgba(245, 158, 11, 0.28);
          background: linear-gradient(180deg, rgba(245,158,11,0.08), rgba(17,17,19,0.95));
        }

        .result-top {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .result-badge {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.18);
          border: 1px solid rgba(245, 158, 11, 0.26);
          color: #fbbf24;
          font-weight: 900;
        }

        .result-box h3 {
          margin: 0;
          font-size: clamp(2.2rem, 4vw, 3rem);
          line-height: 1.08;
          letter-spacing: -0.05em;
        }

        .result-box p {
          margin: 0;
          color: var(--muted);
          line-height: 1.7;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }

        .kpi-card {
          padding: 14px 12px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
        }

        .kpi-label {
          display: block;
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .cta-row.result {
          justify-content: flex-start;
          margin-top: 22px;
        }

        .leaderboard-table {
          margin-top: 20px;
          overflow: auto;
          border-radius: 18px;
        }

        table {
          width: 100%;
          min-width: 820px;
          border-collapse: collapse;
        }

        thead th {
          text-align: left;
          padding: 16px 18px;
          color: var(--muted);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }

        tbody td {
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }

        tbody tr:hover {
          background: rgba(255,255,255,0.02);
        }

        .model-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .model-meta strong {
          font-size: 1.02rem;
        }

        .model-meta span {
          color: var(--muted);
          font-size: 0.8rem;
        }

        .score-pill {
          display: inline-flex;
          min-width: 52px;
          justify-content: center;
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(245, 158, 11, 0.08);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.22);
          font-weight: 800;
        }

        .footnote {
          margin-top: 16px;
          color: var(--muted);
          line-height: 1.7;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .stat-grid, .section-grid, .role-grid, .kpi-grid { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 680px) {
          .obsidian-container { width: min(100vw - 20px, 1180px); }
          .obsidian-nav { flex-direction: column; align-items: flex-start; }
          .nav-controls { width: 100%; }
          .nav-button { flex: 1 1 auto; }
          .stat-grid, .section-grid, .role-grid, .task-grid, .input-grid, .kpi-grid { grid-template-columns: 1fr; }
          .panel { padding: 20px 16px; }
          .result-box { padding: 18px 16px; }
        }
      `}</style>

      <div className="obsidian-app">
        <div className="obsidian-container">
          <nav className="obsidian-nav" aria-label="Main navigation">
            <div className="brand" onClick={() => setActivePage('home')}>
              <div className="brand-mark">M</div>
              <div className="brand-name">ModelAtlas</div>
            </div>

            <div className="nav-controls">
              {['home', 'recommendation', 'leaderboard'].map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`nav-button ${activePage === page ? 'active' : ''}`}
                  onClick={() => setActivePage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          </nav>

          <div className="page-shell">
            {activePage === 'home' && (
              <>
                <header className="hero-panel">
                  <div className="hero-glow" />
                  <div className="hero-copy">
                    <p className="eyebrow">AI model selection</p>
                    <h1>
                      Find the right AI model for your work in <span className="gradient-text">under 30 seconds</span>
                    </h1>
                    <p className="hero-subtitle">
                      Benchmark-backed, cost-aware guidance for developers, researchers, teams, and operators who need fast, high-confidence model choices.
                    </p>
                    <div className="cta-row">
                      <button type="button" className="primary-btn" onClick={() => setActivePage('recommendation')}>Start Assessment</button>
                      <button type="button" className="secondary-btn" onClick={() => setActivePage('leaderboard')}>View Leaderboard</button>
                    </div>
                  </div>

                  <div className="stat-grid">
                    <div className="stat-card">
                      <span className="stat-label">Models tracked</span>
                      <div className="stat-value">{metrics.modelsTracked}</div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Best value</span>
                      <div className="stat-value value-accent">{metrics.bestValueModel}</div>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Frontier pick</span>
                      <div className="stat-value value-alt">{metrics.frontierModel}</div>
                    </div>
                  </div>
                </header>

                <section className="section-grid">
                  <article className="feature-card">
                    <span className="feature-pill">For builders</span>
                    <h3>Ship faster with code-aware models</h3>
                    <p>Debug faster, reduce iteration time, and keep large codebases productive.</p>
                  </article>
                  <article className="feature-card">
                    <span className="feature-pill">For research</span>
                    <h3>Turn long docs into clear insight</h3>
                    <p>Surface trends and evidence faster with high-context synthesis models.</p>
                  </article>
                  <article className="feature-card">
                    <span className="feature-pill">For teams</span>
                    <h3>Balance quality, privacy, and spend</h3>
                    <p>Use benchmark-aware recommendations without overspending on premium tiers.</p>
                  </article>
                </section>
              </>
            )}

            {activePage === 'recommendation' && (
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Assessment</p>
                    <h2>Choose the model profile that fits your work</h2>
                  </div>
                </div>
                <p className="panel-copy">
                  The recommendation engine combines benchmark strength, quality, cost, speed, privacy, and context requirements to match your workflow.
                </p>

                <div className="progress">
                  {['Role', 'Workload', 'Result'].map((stepName, index) => (
                    <div key={stepName} className={`step ${form.user_type ? 'active' : ''}`}>
                      <span className="step-number">{index + 1}</span>
                      <span>{stepName}</span>
                    </div>
                  ))}
                </div>

                <div className="role-grid">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`role-card ${form.user_type === option.value ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect(option.value)}
                    >
                      <span className="role-icon">{option.title.slice(0, 1)}</span>
                      <h3>{option.title}</h3>
                      <p>{option.meta}</p>
                    </button>
                  ))}
                </div>

                <div className="task-grid">
                  {currentRoleGuide.picks.map((pick) => (
                    <button
                      key={pick.value}
                      type="button"
                      className="task-card"
                      onClick={() => handleTaskSelect(pick.value)}
                    >
                      <span>{pick.label}</span>
                      <span className="speed-pill">{pick.value}</span>
                    </button>
                  ))}
                </div>

                <div className="input-grid">
                  <div className="field">
                    <label htmlFor="task">Primary task</label>
                    <select id="task" value={form.task} onChange={(event) => setForm((previous) => ({ ...previous, task: event.target.value }))}>
                      <option value="coding">Coding</option>
                      <option value="research">Research</option>
                      <option value="writing">Writing</option>
                      <option value="summarization">Summarization</option>
                      <option value="general">General assistance</option>
                      <option value="extraction">Extraction</option>
                      <option value="business">Business operations</option>
                      <option value="productivity">Productivity</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="priority">Priority</label>
                    <select id="priority" value={form.priority} onChange={(event) => setForm((previous) => ({ ...previous, priority: event.target.value }))}>
                      <option value="quality">Quality first</option>
                      <option value="balanced">Balanced</option>
                      <option value="cost">Cost first</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="speed">Speed requirement</label>
                    <select id="speed" value={form.speed} onChange={(event) => setForm((previous) => ({ ...previous, speed: event.target.value }))}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="context">Context need</label>
                    <select id="context" value={form.context} onChange={(event) => setForm((previous) => ({ ...previous, context: event.target.value }))}>
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="privacy">Privacy sensitivity</label>
                    <select id="privacy" value={form.privacy} onChange={(event) => setForm((previous) => ({ ...previous, privacy: event.target.value }))}>
                      <option value="required">Required</option>
                      <option value="preferred">Preferred</option>
                      <option value="not-important">Not important</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="research_mode">Research mode</label>
                    <select id="research_mode" value={form.research_mode} onChange={(event) => setForm((previous) => ({ ...previous, research_mode: event.target.value }))}>
                      <option value="fact_checking">Fact-checking</option>
                      <option value="literature_review">Literature review</option>
                      <option value="data_extraction">Data extraction</option>
                    </select>
                  </div>
                </div>

                <div className="result-box">
                  <div className="result-top">
                    <div className="result-badge">★</div>
                    <p className="eyebrow">Top recommendation</p>
                  </div>
                  <h3>{recommendation.primary?.name}</h3>
                  <p>{recommendation.explanation}</p>

                  <div className="kpi-grid">
                    <div className="kpi-card">
                      <span className="kpi-label">Quality</span>
                      <strong>{recommendation.primary?.qualityLabel ?? 'High'}</strong>
                    </div>
                    <div className="kpi-card">
                      <span className="kpi-label">Cost</span>
                      <strong>{recommendation.budget?.name ?? 'Balanced'}</strong>
                    </div>
                    <div className="kpi-card">
                      <span className="kpi-label">Speed</span>
                      <strong>{recommendation.fast?.name ?? 'Fast'}</strong>
                    </div>
                    <div className="kpi-card">
                      <span className="kpi-label">Context</span>
                      <strong>{recommendation.primary?.contextLabel ?? 'Large'}</strong>
                    </div>
                  </div>

                  <div className="cta-row result">
                    <button type="button" className="primary-btn" onClick={() => setActivePage('leaderboard')}>View full leaderboard</button>
                    <button type="button" className="secondary-btn" onClick={() => setForm(defaultForm)}>Start over</button>
                  </div>
                </div>
              </div>
            )}

            {activePage === 'leaderboard' && (
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Leaderboard</p>
                    <h2>Benchmark ranking</h2>
                  </div>
                  <span className="speed-pill">Updated: {formatDate(benchmarkSnapshotDate)}</span>
                </div>
                <p className="panel-copy">
                  Current ranking for the selected task, weighed against model quality, efficiency, reliability, and privacy.
                </p>

                <div className="field" style={{ marginTop: 18, maxWidth: 280 }}>
                  <label htmlFor="leaderboard-task">Task</label>
                  <select id="leaderboard-task" value={form.task} onChange={(event) => setForm((previous) => ({ ...previous, task: event.target.value }))}>
                    <option value="coding">Coding</option>
                    <option value="research">Research</option>
                    <option value="writing">Writing</option>
                    <option value="summarization">Summarization</option>
                    <option value="general">General assistance</option>
                    <option value="extraction">Extraction</option>
                    <option value="business">Business operations</option>
                    <option value="productivity">Productivity</option>
                  </select>
                </div>

                <div className="leaderboard-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Score</th>
                        <th>Benchmark</th>
                        <th>Quality</th>
                        <th>Cost</th>
                        <th>Speed</th>
                        <th>Context</th>
                        <th>Reliability</th>
                        <th>Privacy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((model) => (
                        <tr key={model.id}>
                          <td>
                            <div className="model-meta">
                              <strong>{model.name}</strong>
                              <span>{model.provider}</span>
                            </div>
                          </td>
                          <td><span className="score-pill">{model.score}</span></td>
                          <td>{model.benchmark.score}</td>
                          <td>{model.scoreBreakdown?.quality ?? 0}</td>
                          <td>{model.scoreBreakdown?.cost ?? 0}</td>
                          <td>{model.scoreBreakdown?.speed ?? 0}</td>
                          <td>{model.scoreBreakdown?.context ?? 0}</td>
                          <td>{model.scoreBreakdown?.reliability ?? 0}</td>
                          <td>{model.scoreBreakdown?.privacy ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="footnote">
                  This leaderboard is benchmark-oriented and intentionally optimized for a practical workflow mix rather than a single raw benchmark winner.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
