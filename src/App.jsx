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

const taskFields = {
  coding: [
    { key: 'codebase_size', label: 'Codebase size', type: 'select', options: ['small', 'medium', 'large'] },
    { key: 'tool_use', label: 'Tool use', type: 'select', options: ['basic', 'deep', 'agentic'] },
    { key: 'validation', label: 'Validation style', type: 'select', options: ['light', 'balanced', 'strict'] }
  ],
  research: [
    { key: 'source_volume', label: 'Source volume', type: 'select', options: ['many', 'medium', 'few'] },
    { key: 'fact_checking', label: 'Fact-checking', type: 'select', options: ['essential', 'preferred', 'not_required'] },
    { key: 'research_mode', label: 'Research mode', type: 'select', options: ['fact_checking', 'literature_review', 'data_extraction'] }
  ],
  writing: [
    { key: 'output_length', label: 'Output length', type: 'select', options: ['short', 'medium', 'long'] },
    { key: 'writing_style', label: 'Writing style', type: 'select', options: ['technical', 'marketing', 'creative'] }
  ],
  summarization: [
    { key: 'document_volume', label: 'Document volume', type: 'select', options: ['small', 'medium', 'large'] },
    { key: 'summary_depth', label: 'Summary depth', type: 'select', options: ['brief', 'balanced', 'detailed'] }
  ],
  general: [
    { key: 'automation_level', label: 'Automation level', type: 'select', options: ['low', 'medium', 'high'] },
    { key: 'assistant_usage', label: 'Assistant usage', type: 'select', options: ['structured', 'daily', 'supportive'] }
  ],
  extraction: [
    { key: 'extraction_precision', label: 'Precision need', type: 'select', options: ['standard', 'high', 'critical'] },
    { key: 'document_type', label: 'Document type', type: 'select', options: ['reports', 'structured', 'mixed'] }
  ],
  business: [
    { key: 'automation_level', label: 'Automation level', type: 'select', options: ['low', 'medium', 'high'] },
    { key: 'assistant_usage', label: 'Assistant usage', type: 'select', options: ['structured', 'daily', 'supportive'] }
  ],
  productivity: [
    { key: 'automation_level', label: 'Automation level', type: 'select', options: ['low', 'medium', 'high'] },
    { key: 'assistant_usage', label: 'Assistant usage', type: 'select', options: ['structured', 'daily', 'supportive'] }
  ]
};

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
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${dateString}T00:00:00`));
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
  const [activePage, setActivePage] = useState('recommendation');
  const [form, setForm] = useState(defaultForm);

  const metrics = useMemo(() => getMetricSummary(), []);
  const recommendation = useMemo(() => getRecommendation(form), [form]);
  const leaderboard = useMemo(() => getLeaderboard(form.task), [form.task]);
  const currentRoleGuide = roleGuide[form.user_type] ?? roleGuide.individual;
  const activeTaskFields = taskFields[form.task] ?? [];

  const updateForm = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const chooseRole = (role) => {
    setForm((previous) => ({ ...previous, user_type: role }));
  };

  const chooseTask = (task) => {
    setForm((previous) => ({ ...previous, task }));
  };

  const DashboardHome = () => (
    <>
      <header className="hero">
        <div className="topbar">
          <div className="brand-wrap brand-wrap-compact">
            <span className="brand-mark">M</span>
            <div>
              <p className="eyebrow">ModelAtlas</p>
            </div>
          </div>
          <div className="status-pill">Snapshot · {formatDate(benchmarkSnapshotDate)}</div>
        </div>

        <div className="hero-copy">
          <div>
            <p className="eyebrow">AI model selection</p>
            <h1>Find the right AI model for your work in under 30 seconds.</h1>
          </div>
          <p className="subtitle">
            Built for students, researchers, developers, freelancers, and growing teams who want faster, smarter, and more cost-aware choices.
          </p>
          <div className="trust-strip" aria-label="Key product benefits">
            <span>Benchmark-backed</span>
            <span>Cost-aware</span>
            <span>Privacy-aware</span>
            <span>Task-specific</span>
          </div>
        </div>

        <div className="metrics-strip">
          <div className="metric-box">
            <span className="metric-label">Models tracked</span>
            <strong>{metrics.modelsTracked}</strong>
          </div>
          <div className="metric-box">
            <span className="metric-label">Use cases</span>
            <strong>{metrics.useCasesTracked}</strong>
          </div>
          <div className="metric-box">
            <span className="metric-label">Best value</span>
            <strong>{metrics.bestValueModel}</strong>
          </div>
          <div className="metric-box">
            <span className="metric-label">Frontier pick</span>
            <strong>{metrics.frontierModel}</strong>
          </div>
        </div>
      </header>

      <section className="showcase-grid" aria-label="Popular use cases">
        <article className="showcase-card accent">
          <span className="showcase-tag">For builders</span>
          <h3>Ship faster with code-aware models</h3>
          <p>Debug faster, iterate cleaner, and keep large codebases productive.</p>
        </article>
        <article className="showcase-card purple">
          <span className="showcase-tag">For researchers</span>
          <h3>Turn long docs into clear insight</h3>
          <p>Smarter synthesis and evidence review for dense research workflows.</p>
        </article>
        <article className="showcase-card green">
          <span className="showcase-tag">For teams</span>
          <h3>Balance quality, privacy, and spend</h3>
          <p>Keep operational excellence without overspending on premium choices.</p>
        </article>
      </section>

      <section className="value-grid" aria-label="Value pillars">
        <div className="value-card">
          <span className="step-pill">01</span>
          <h3>Match by task</h3>
          <p>Choose a model that best supports the specific job you are trying to do.</p>
        </div>
        <div className="value-card">
          <span className="step-pill">02</span>
          <h3>Balance the trade-offs</h3>
          <p>Optimize for reasoning quality, speed, context, and budget without guesswork.</p>
        </div>
        <div className="value-card">
          <span className="step-pill">03</span>
          <h3>Act on evidence</h3>
          <p>Use benchmark-aware recommendations instead of hype-driven model selection.</p>
        </div>
      </section>
    </>
  );

  const RecommendationView = () => (
    <div className="card form-card">
      <div className="form-header">
        <div>
          <p className="eyebrow small">Assessment</p>
          <h2>Choose the model profile that fits your work</h2>
        </div>
        <p className="form-lead">The recommendation engine weights benchmark performance, quality, cost, speed, and privacy against your workflow.</p>
      </div>

      <div className="profession-selector">
        {roleOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`profession-card ${form.user_type === option.value ? 'active' : ''}`}
            onClick={() => chooseRole(option.value)}
          >
            <span className="profession-icon">{option.title.slice(0, 1)}</span>
            <span className="profession-title">{option.title}</span>
            <span className="profession-meta">{option.meta}</span>
          </button>
        ))}
      </div>

      <div className="panel-section">
        <p className="eyebrow small">Role guide</p>
        <h3 id="role-guide-title">{currentRoleGuide.title}</h3>
        <p id="role-guide-copy" className="role-guide-copy">{currentRoleGuide.copy}</p>
        <div className="role-picks" id="role-picks">
          {currentRoleGuide.picks.map((pick) => (
            <button key={pick.value} type="button" className="role-pick" onClick={() => chooseTask(pick.value)}>
              <span className="role-pick-title">{pick.label}</span>
              <span className="role-pick-meta">{pick.value}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="result-headline" style={{ marginTop: '28px' }}>
        <div>
          <p className="eyebrow small">Model fit</p>
          <h3>Recommendation inputs</h3>
        </div>
      </div>

      <div id="recommendation-form" className="field-group">
        <div className="field">
          <label htmlFor="task">Primary task</label>
          <select id="task" value={form.task} onChange={(event) => updateForm('task', event.target.value)}>
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
          <select id="priority" value={form.priority} onChange={(event) => updateForm('priority', event.target.value)}>
            <option value="quality">Quality first</option>
            <option value="balanced">Balanced</option>
            <option value="cost">Cost first</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="speed">Speed requirement</label>
          <select id="speed" value={form.speed} onChange={(event) => updateForm('speed', event.target.value)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="context">Context need</label>
          <select id="context" value={form.context} onChange={(event) => updateForm('context', event.target.value)}>
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="privacy">Privacy sensitivity</label>
          <select id="privacy" value={form.privacy} onChange={(event) => updateForm('privacy', event.target.value)}>
            <option value="required">Required</option>
            <option value="preferred">Preferred</option>
            <option value="not-important">Not important</option>
          </select>
        </div>

        {activeTaskFields.map((field) => (
          <div key={field.key} className="field">
            <label htmlFor={field.key}>{field.label}</label>
            <select id={field.key} value={form[field.key]} onChange={(event) => updateForm(field.key, event.target.value)}>
              {field.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="result-headline" style={{ marginTop: '30px' }}>
        <div>
          <p className="eyebrow small">Result</p>
          <h3>Recommended model mix</h3>
        </div>
      </div>

      <div id="recommendation-view" className="recommendation-panel">
        <div className="result-grid" id="result-summary">
          <div>
            <p className="label">Best overall</p>
            <p className="result-value">{recommendation.primary?.name}</p>
            <p className="result-meta">Highest-fit choice for the current workflow.</p>
          </div>
          <div>
            <p className="label">Best value</p>
            <p className="result-value">{recommendation.budget?.name}</p>
            <p className="result-meta">Lowest cost choice with strong utility.</p>
          </div>
          <div>
            <p className="label">Fastest option</p>
            <p className="result-value">{recommendation.fast?.name}</p>
            <p className="result-meta">Fastest low-latency fit in the ranked set.</p>
          </div>
          <div>
            <p className="label">Fallback</p>
            <p className="result-value">{recommendation.fallback?.name}</p>
            <p className="result-meta">Safe backup if constraints tighten.</p>
          </div>
        </div>

        <div className="explanation">
          <p className="eyebrow small">Why this fit</p>
          <p id="explanation-text">{recommendation.explanation}</p>
        </div>

        <div className="panel-section">
          <p className="panel-note">This recommendation is ranked by benchmark strength and adjusted for quality, cost, speed, context, reliability, and privacy preferences.</p>
          <div className="scenario-grid" id="scenario-comparison">
            {[
              { label: 'Best overall value', model: recommendation.scenarioComparison?.bestValue },
              { label: 'Best budget', model: recommendation.scenarioComparison?.bestBudget },
              { label: 'Best speed', model: recommendation.scenarioComparison?.bestSpeed },
              { label: 'Best long context', model: recommendation.scenarioComparison?.bestLongContext },
              { label: 'Best token efficiency', model: recommendation.scenarioComparison?.bestTokenEfficiency }
            ].map((entry) => (
              <div key={entry.label} className="scenario-card">
                <p className="label">{entry.label}</p>
                <p className="scenario-model">{entry.model?.name}</p>
                <p className="scenario-detail">{entry.model?.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const LeaderboardView = () => (
    <div className="card comparison-card">
      <div className="section-header">
        <p className="eyebrow small">Leaderboard</p>
        <h2>Benchmark ranking</h2>
      </div>
      <p className="comparison-summary">Current ranking for the selected task, weighed against model benchmark strength and operational trade-offs.</p>
      <div className="field" style={{ marginBottom: '18px' }}>
        <label htmlFor="leaderboard-task">Task</label>
        <select id="leaderboard-task" value={form.task} onChange={(event) => updateForm('task', event.target.value)}>
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

      <div className="table-wrap">
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
                  <div className="model-name-group">
                    <strong>{model.name}</strong>
                    <span>{model.provider}</span>
                  </div>
                </td>
                <td>{model.score}</td>
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
    </div>
  );

  return (
    <div className="page-shell fade-in">
      <div className="container">
        <nav className="top-nav" aria-label="Main navigation">
          <div className="brand-wrap">
            <span className="brand-mark">M</span>
            <div>
              <p className="eyebrow">ModelAtlas</p>
            </div>
          </div>
          <div className="nav-links">
            <button type="button" className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={() => setActivePage('home')}>Home</button>
            <button type="button" className={`nav-link ${activePage === 'recommendation' ? 'active' : ''}`} onClick={() => setActivePage('recommendation')}>Recommendation</button>
            <button type="button" className={`nav-link ${activePage === 'leaderboard' ? 'active' : ''}`} onClick={() => setActivePage('leaderboard')}>Leaderboard</button>
          </div>
        </nav>

        {activePage === 'home' && <DashboardHome />}
        {activePage === 'recommendation' && <RecommendationView />}
        {activePage === 'leaderboard' && <LeaderboardView />}
      </div>
    </div>
  );
}

export default App;
