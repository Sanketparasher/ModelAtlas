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
  const [activeSection, setActiveSection] = useState('overview');
  const [form, setForm] = useState(defaultForm);

  const metrics = useMemo(() => getMetricSummary(), []);
  const recommendation = useMemo(() => getRecommendation(form), [form]);
  const leaderboard = useMemo(() => getLeaderboard(form.task), [form.task]);
  const currentRoleGuide = roleGuide[form.user_type] ?? roleGuide.individual;

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'recommendation', label: 'Recommendation' },
    { id: 'leaderboard', label: 'Leaderboard' }
  ];

  const handleRoleSelect = (value) => setForm((previous) => ({ ...previous, user_type: value }));
  const handleTaskSelect = (value) => setForm((previous) => ({ ...previous, task: value }));

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <style>{`
        :root {
          --bg: #08090d;
          --bg-soft: #101319;
          --panel: rgba(17, 20, 26, 0.82);
          --panel-strong: rgba(19, 22, 28, 0.96);
          --panel-elevated: rgba(26, 30, 38, 0.9);
          --border: rgba(148, 163, 184, 0.16);
          --border-strong: rgba(251, 191, 36, 0.28);
          --text: #f8fafc;
          --muted: #a5b4c7;
          --subtle: #dfe7f3;
          --amber: #fbbf24;
          --amber-strong: #f59e0b;
          --orange: #f97316;
          --cyan: #67e8f9;
          --shadow: rgba(2, 6, 23, 0.42);
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        html, body, #root { margin: 0; min-height: 100%; background: var(--bg); }
        body {
          color: var(--text);
          font-family: Inter, 'Segoe UI', sans-serif;
          background:
            radial-gradient(circle at top left, rgba(251, 191, 36, 0.18), transparent 18%),
            radial-gradient(circle at bottom right, rgba(103, 232, 249, 0.12), transparent 24%),
            linear-gradient(180deg, #090b12 0%, #0a0d13 100%);
        }

        a { color: inherit; text-decoration: none; }
        button, select { font: inherit; }

        .site-shell {
          min-height: 100vh;
          background: linear-gradient(180deg, rgba(9, 11, 18, 0.86), rgba(9, 11, 18, 1));
          color: var(--text);
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 30;
          width: min(1220px, calc(100vw - 24px));
          margin: 18px auto 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 18px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: rgba(8, 11, 17, 0.76);
          backdrop-filter: blur(16px);
          box-shadow: 0 18px 36px rgba(2, 6, 23, 0.3);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .brand-mark {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--amber), var(--orange));
          color: #161b2b;
          font-size: 0.95rem;
          font-weight: 900;
          box-shadow: 0 10px 20px rgba(251, 191, 36, 0.22);
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .nav-list {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .nav-item {
          border: 1px solid transparent;
          background: transparent;
          color: var(--muted);
          border-radius: 10px;
          padding: 9px 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-item:hover,
        .nav-item.active {
          color: var(--text);
          border-color: rgba(251, 191, 36, 0.22);
          background: rgba(251, 191, 36, 0.08);
          box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.08);
        }

        .nav-cta {
          background: linear-gradient(135deg, var(--amber), var(--amber-strong));
          color: #1b1b22;
          border: 0;
          border-radius: 12px;
          padding: 10px 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 16px 28px rgba(251, 191, 36, 0.18);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 28px rgba(251, 191, 36, 0.24);
        }

        .page-content {
          width: min(1220px, calc(100vw - 24px));
          margin: 0 auto;
          padding: 36px 0 72px;
        }

        .hero-section {
          position: relative;
          padding: 20px 0 8px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 24px;
          align-items: center;
        }

        .hero-copy {
          position: relative;
          z-index: 1;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 16px;
          color: var(--muted);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .eyebrow::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--amber), var(--orange));
          box-shadow: 0 0 18px rgba(251, 191, 36, 0.7);
        }

        .hero-title {
          margin: 0;
          max-width: 640px;
          font-size: clamp(2.8rem, 5vw, 5.1rem);
          line-height: 0.96;
          letter-spacing: -0.06em;
          font-weight: 900;
        }

        .gradient-text {
          background: linear-gradient(135deg, #fde68a 0%, #fbbf24 18%, #f59e0b 45%, #f97316 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .hero-text {
          margin: 18px 0 0;
          max-width: 600px;
          color: var(--muted);
          font-size: 1.06rem;
          line-height: 1.8;
        }

        .cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 28px;
        }

        .primary-btn,
        .ghost-btn {
          border: none;
          border-radius: 14px;
          padding: 0.92rem 1.35rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .primary-btn {
          background: linear-gradient(135deg, var(--amber), var(--amber-strong));
          color: #1f2430;
          box-shadow: 0 18px 30px rgba(251, 191, 36, 0.2);
        }

        .ghost-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          color: var(--text);
        }

        .primary-btn:hover,
        .ghost-btn:hover {
          transform: translateY(-1px);
        }

        .inline-badges {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
        }

        .inline-badges span {
          display: inline-flex;
          align-items: center;
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          color: var(--subtle);
          font-size: 0.76rem;
          font-weight: 700;
        }

        .hero-visual {
          position: relative;
          min-height: 440px;
        }

        .visual-card {
          position: relative;
          height: 100%;
          min-height: 440px;
          padding: 22px;
          border-radius: 28px;
          border: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(17, 20, 26, 0.96), rgba(12, 14, 20, 0.98));
          box-shadow: 0 30px 60px rgba(2, 6, 23, 0.4);
          overflow: hidden;
        }

        .visual-card::before {
          content: '';
          position: absolute;
          inset: -35% auto auto -10%;
          width: 210px;
          height: 210px;
          border-radius: 50%;
          background: rgba(251, 191, 36, 0.12);
          filter: blur(30px);
        }

        .visual-card::after {
          content: '';
          position: absolute;
          inset: auto -10% -30% auto;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: rgba(103, 232, 249, 0.08);
          filter: blur(30px);
        }

        .chart-panel {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 16px;
        }

        .mini-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 8px;
        }

        .mini-header strong {
          letter-spacing: -0.02em;
          font-size: 1.02rem;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid rgba(103, 232, 249, 0.22);
          background: rgba(103, 232, 249, 0.08);
          color: #a5f3fc;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #67e8f9;
          box-shadow: 0 0 12px rgba(103, 232, 249, 0.8);
        }

        .chart-block {
          display: grid;
          gap: 10px;
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: rgba(255,255,255,0.02);
        }

        .bars {
          display: flex;
          align-items: end;
          gap: 10px;
          height: 150px;
          padding-top: 12px;
        }

        .bar {
          flex: 1 1 0;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(180deg, rgba(251, 191, 36, 0.9), rgba(249, 115, 22, 0.8));
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08);
        }

        .bar:nth-child(2) { background: linear-gradient(180deg, rgba(103,232,249,0.9), rgba(56,189,248,0.8)); }
        .bar:nth-child(3) { background: linear-gradient(180deg, rgba(251,191,36,0.9), rgba(251,146,60,0.8)); }
        .bar:nth-child(4) { background: linear-gradient(180deg, rgba(168,85,247,0.85), rgba(96,165,250,0.8)); }

        .metric-stack {
          display: grid;
          grid-template-columns: repeat(2, minmax(120px, 1fr));
          gap: 12px;
        }

        .metric-box {
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: rgba(255,255,255,0.02);
        }

        .metric-box span {
          display: block;
          color: var(--muted);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-weight: 800;
        }

        .metric-box strong {
          font-size: 1.08rem;
          letter-spacing: -0.03em;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(170px, 1fr));
          gap: 18px;
          margin-top: 34px;
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          padding: 20px 18px;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(18, 20, 26, 0.9), rgba(13,15,19,0.9));
          box-shadow: 0 14px 24px rgba(2, 6, 23, 0.28);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.5), transparent);
        }

        .stat-label {
          display: block;
          color: var(--muted);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: clamp(1.35rem, 2vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .value-accent { color: #fbbf24; }
        .value-alt { color: #67e8f9; }

        .feature-band {
          margin-top: 28px;
          padding: 16px 0 0;
        }

        .section-heading {
          display: grid;
          gap: 10px;
          margin-bottom: 18px;
        }

        .section-heading.center {
          text-align: center;
        }

        .section-heading h2 {
          margin: 0;
          font-size: clamp(2rem, 3vw, 3rem);
          letter-spacing: -0.05em;
        }

        .section-heading p {
          margin: 0;
          color: var(--muted);
          line-height: 1.7;
        }

        .feature-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(220px, 1fr));
          gap: 18px;
        }

        .feature-card {
          position: relative;
          overflow: hidden;
          padding: 22px 18px 18px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(19, 22, 28, 0.92), rgba(12,15,20,0.96));
          box-shadow: 0 20px 32px rgba(2, 6, 23, 0.2);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .feature-card:hover {
          transform: translateY(-2px);
          border-color: rgba(251, 191, 36, 0.24);
        }

        .feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          color: var(--subtle);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .feature-card h3 {
          margin: 16px 0 10px;
          font-size: 1.22rem;
          letter-spacing: -0.03em;
        }

        .feature-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.7;
        }

        .tool-section,
        .leaderboard-section {
          margin-top: 42px;
          padding-top: 12px;
        }

        .tool-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          margin-top: 16px;
        }

        .inspector-panel,
        .result-card,
        .leaderboard-shell {
          border: 1px solid var(--border);
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(18,20,26,0.9), rgba(11,14,18,0.95));
          box-shadow: 0 24px 40px rgba(2, 6, 23, 0.22);
        }

        .inspector-panel {
          padding: 24px 20px 20px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .mini-label {
          display: block;
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.5rem;
          letter-spacing: -0.04em;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(170px, 1fr));
          gap: 14px;
          margin-top: 10px;
        }

        .role-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
          padding: 18px 16px;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          color: var(--text);
          cursor: pointer;
          text-align: left;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .role-card:hover,
        .role-card.selected {
          transform: translateY(-1px);
          border-color: rgba(251, 191, 36, 0.26);
          background: linear-gradient(180deg, rgba(251, 191, 36, 0.08), rgba(18,18,20,0.8));
        }

        .role-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: rgba(251, 191, 36, 0.12);
          border: 1px solid rgba(251, 191, 36, 0.22);
          color: #fbbf24;
          font-weight: 800;
        }

        .role-card h3 {
          margin: 0;
          font-size: 1.05rem;
        }

        .role-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.6;
          font-size: 0.85rem;
        }

        .task-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(160px, 1fr));
          gap: 12px;
          margin-top: 18px;
        }

        .task-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          width: 100%;
          padding: 16px 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          color: var(--text);
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .task-card:hover,
        .task-card.selected {
          transform: translateY(-1px);
          border-color: rgba(251, 191, 36, 0.26);
          background: linear-gradient(180deg, rgba(251, 191, 36, 0.08), rgba(18, 18, 20, 0.8));
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(200px, 1fr));
          gap: 14px;
          margin-top: 22px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          color: var(--muted);
          font-size: 0.78rem;
          font-weight: 700;
        }

        .field select {
          appearance: none;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
          color: var(--text);
          padding: 0.8rem 0.9rem;
        }

        .result-card {
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .result-badge {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: rgba(251, 191, 36, 0.12);
          border: 1px solid rgba(251, 191, 36, 0.22);
          color: #fbbf24;
          font-weight: 900;
        }

        .result-head h3 {
          margin: 8px 0 0;
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.06em;
        }

        .result-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.75;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(120px, 1fr));
          gap: 12px;
        }

        .metric-box {
          padding: 12px 14px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: rgba(255,255,255,0.02);
        }

        .metric-box span {
          display: block;
          color: var(--muted);
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .metric-box strong {
          font-size: 1.08rem;
          letter-spacing: -0.02em;
        }

        .cta-row.result {
          justify-content: flex-start;
          margin-top: 0;
        }

        .leaderboard-shell {
          padding: 20px;
          margin-top: 16px;
        }

        .leaderboard-shell .field {
          max-width: 260px;
          margin-bottom: 18px;
        }

        .leaderboard-table {
          overflow: auto;
          border-radius: 18px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
        }

        table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        thead th {
          text-align: left;
          padding: 16px 18px;
          color: var(--muted);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 800;
          border-bottom: 1px solid var(--border);
        }

        tbody td {
          padding: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
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
          justify-content: center;
          min-width: 56px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.22);
          color: #fbbf24;
          font-weight: 800;
        }

        .footnote {
          margin-top: 16px;
          color: var(--muted);
          line-height: 1.7;
        }

        .site-footer {
          width: min(1220px, calc(100vw - 24px));
          margin: 0 auto;
          padding: 10px 0 48px;
          color: var(--muted);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
        }

        .site-footer p {
          margin: 0;
        }

        @media (max-width: 980px) {
          .hero-grid,
          .tool-layout {
            grid-template-columns: 1fr;
          }

          .feature-row,
          .stat-grid,
          .role-grid,
          .field-grid,
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(160px, 1fr));
          }
        }

        @media (max-width: 720px) {
          .topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .nav-list {
            width: 100%;
          }

          .nav-item {
            flex: 1 1 auto;
          }

          .feature-row,
          .stat-grid,
          .role-grid,
          .field-grid,
          .task-grid,
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .page-content,
          .site-footer {
            width: min(100vw - 16px, 1220px);
          }

          .hero-title {
            max-width: 100%;
          }

          .ghost-btn,
          .primary-btn,
          .nav-cta {
            width: 100%;
          }

          .cta-row {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="site-shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">M</div>
            <div className="brand-name">ModelAtlas</div>
          </div>

          <nav className="nav-list" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button type="button" className="nav-cta" onClick={() => scrollToSection('recommendation')}>Try it now</button>
          </nav>
        </header>

        <main className="page-content">
          <section id="overview" className="hero-section">
            <div className="hero-grid">
              <div className="hero-copy">
                <p className="eyebrow">AI model selection</p>
                <h1 className="hero-title">
                  Find the <span className="gradient-text">best model</span> for your workflow.
                </h1>
                <p className="hero-text">
                  Benchmark-backed guidance for builders, teams, and operators who need fast, confident model decisions without wasting budget or time.
                </p>

                <div className="cta-row">
                  <button type="button" className="primary-btn" onClick={() => scrollToSection('recommendation')}>Start recommendation</button>
                  <button type="button" className="ghost-btn" onClick={() => scrollToSection('leaderboard')}>View leaderboard</button>
                </div>

                <div className="inline-badges">
                  <span>Faster route planning</span>
                  <span>Budget-aware</span>
                  <span>Benchmark-backed</span>
                </div>
              </div>

              <div className="hero-visual" aria-label="Model performance overview">
                <div className="visual-card">
                  <div className="chart-panel">
                    <div className="mini-header">
                      <strong>Opportunity index</strong>
                      <span className="status-pill"><span className="status-dot" />Live</span>
                    </div>

                    <div className="chart-block">
                      <div className="bars" aria-hidden="true">
                        <span className="bar" style={{ height: '58%' }} />
                        <span className="bar" style={{ height: '74%' }} />
                        <span className="bar" style={{ height: '66%' }} />
                        <span className="bar" style={{ height: '88%' }} />
                      </div>
                    </div>

                    <div className="metric-stack">
                      <div className="metric-box">
                        <span>Frontier</span>
                        <strong>{metrics.frontierModel}</strong>
                      </div>
                      <div className="metric-box">
                        <span>Best value</span>
                        <strong>{metrics.bestValueModel}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-label">Models tracked</span>
                <div className="stat-value">{metrics.modelsTracked}</div>
              </div>
              <div className="stat-card">
                <span className="stat-label">Use cases</span>
                <div className="stat-value value-alt">{metrics.useCasesTracked}</div>
              </div>
              <div className="stat-card">
                <span className="stat-label">Quality focus</span>
                <div className="stat-value value-accent">High</div>
              </div>
            </div>
          </section>

          <section className="feature-band">
            <div className="section-heading center">
              <p className="eyebrow">Why teams use it</p>
              <h2>Built for practical, high-impact decisions.</h2>
            </div>

            <div className="feature-row">
              <article className="feature-card">
                <span className="feature-pill">For builders</span>
                <h3>Ship faster with better code support</h3>
                <p>Reduce debugging loops, keep more context, and choose a model that fits your actual delivery workflow.</p>
              </article>

              <article className="feature-card">
                <span className="feature-pill">For research</span>
                <h3>Turn long documents into clear insight</h3>
                <p>Surface trends, synthesize evidence, and move faster from raw docs to useful, trustworthy answers.</p>
              </article>

              <article className="feature-card">
                <span className="feature-pill">For teams</span>
                <h3>Balance quality, privacy, and spend</h3>
                <p>Pick the right tradeoff between cost, context window, speed, and trust instead of overpaying for the wrong model.</p>
              </article>
            </div>
          </section>

          <section id="recommendation" className="tool-section">
            <div className="section-heading">
              <p className="eyebrow">Smart recommendation</p>
              <h2>Choose the model profile that matches your work.</h2>
            </div>

            <div className="tool-layout">
              <div className="inspector-panel">
                <div className="panel-header">
                  <div>
                    <span className="mini-label">Workflow</span>
                    <h3>Define your needs</h3>
                  </div>
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
                      className={`task-card ${form.task === pick.value ? 'selected' : ''}`}
                      onClick={() => handleTaskSelect(pick.value)}
                    >
                      <span>{pick.label}</span>
                      <span className="speed-pill">{pick.value}</span>
                    </button>
                  ))}
                </div>

                <div className="field-grid">
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
              </div>

              <aside className="result-card">
                <div className="result-badge">★</div>
                <div className="result-head">
                  <span className="mini-label">Top recommendation</span>
                  <h3>{recommendation.primary?.name}</h3>
                </div>

                <p>{recommendation.explanation}</p>

                <div className="metrics-grid">
                  <div className="metric-box">
                    <span>Quality</span>
                    <strong>{recommendation.primary?.qualityLabel ?? 'High'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Cost</span>
                    <strong>{recommendation.budget?.name ?? 'Balanced'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Speed</span>
                    <strong>{recommendation.fast?.name ?? 'Fast'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Context</span>
                    <strong>{recommendation.primary?.contextLabel ?? 'Large'}</strong>
                  </div>
                </div>

                <div className="cta-row result">
                  <button type="button" className="primary-btn" onClick={() => scrollToSection('leaderboard')}>Compare models</button>
                  <button type="button" className="ghost-btn" onClick={() => setForm(defaultForm)}>Reset</button>
                </div>
              </aside>
            </div>
          </section>

          <section id="leaderboard" className="leaderboard-section">
            <div className="section-heading">
              <p className="eyebrow">Benchmark board</p>
              <h2>Track how the leading models stack up.</h2>
            </div>

            <div className="leaderboard-shell">
              <div className="field">
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
                This leaderboard blends benchmark results with practical tradeoffs to help teams choose what works in real operations.
              </p>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="brand">
            <div className="brand-mark">M</div>
            <div className="brand-name">ModelAtlas</div>
          </div>
          <p>Benchmark-informed AI selection for modern teams.</p>
        </footer>
      </div>
    </>
  );
}

export default App;
