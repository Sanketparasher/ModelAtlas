import { benchmarkSnapshotDate, models } from './src/data/models.js';
import { getLeaderboard, getRecommendation } from './src/logic/scoring.js';

const form = document.getElementById('recommendation-form');
const taskSelect = document.getElementById('task');
const taskSpecificFields = document.querySelectorAll('.task-field');
const resultSection = document.getElementById('recommendation-view');
const primaryModelEl = document.getElementById('primary-model');
const budgetModelEl = document.getElementById('budget-model');
const fastModelEl = document.getElementById('fast-model');
const fallbackModelEl = document.getElementById('fallback-model');
const explanationTextEl = document.getElementById('explanation-text');
const scenarioComparisonEl = document.getElementById('scenario-comparison');
const useThisModelTextEl = document.getElementById('use-this-model-text');
const avoidThisModelTextEl = document.getElementById('avoid-this-model-text');
const bestBudgetChoiceTextEl = document.getElementById('best-budget-choice-text');
const bestPremiumOptionTextEl = document.getElementById('best-premium-option-text');
const costComparisonTableEl = document.getElementById('cost-comparison-table');
const useCaseMatrixEl = document.getElementById('best-by-usecase-matrix');
const summaryPanelEl = document.getElementById('summary-panel');
const comparisonSummaryEl = document.getElementById('comparison-summary');
const comparisonTableEl = document.getElementById('model-comparison-table');
const recommendationView = document.getElementById('recommendation-view');
const leaderboardView = document.getElementById('leaderboard-view');
const viewButtons = document.querySelectorAll('[data-view]');
const topMatchesTableEl = document.getElementById('top-matches-table');
const constraintSummaryEl = document.getElementById('constraint-summary');
const changeAnswersButton = document.getElementById('change-answers');
const copyRecommendationButton = document.getElementById('copy-recommendation');
const exportRecommendationButton = document.getElementById('export-recommendation');
const modelsTrackedEl = document.getElementById('models-tracked');
const useCasesTrackedEl = document.getElementById('use-cases-tracked');
const bestValueModelEl = document.getElementById('best-value-model');
const frontierModelEl = document.getElementById('frontier-model');

let latestRecommendation = null;

function formatSnapshotDate(date) {
  if (!date) return 'unknown date';
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(`${date}T00:00:00`));
}

function initializeMetrics() {
  modelsTrackedEl.textContent = models.length;
  useCasesTrackedEl.textContent = new Set(models.flatMap((model) => Object.keys(model.benchmarks ?? {}))).size;
  const valueModel = [...models].sort((a, b) => b.costEfficiency - a.costEfficiency)[0];
  const frontierModel = [...models].sort((a, b) => b.quality - a.quality)[0];
  bestValueModelEl.textContent = valueModel?.name ?? 'Unavailable';
  frontierModelEl.textContent = frontierModel?.name ?? 'Unavailable';
  document.querySelector('.status-pill').textContent = `Snapshot · ${formatSnapshotDate(benchmarkSnapshotDate)}`;
}

function syncTaskSpecificQuestions() {
  const activeTask = taskSelect.value;

  taskSpecificFields.forEach((field) => {
    const isActive = field.dataset.task === activeTask;
    field.classList.toggle('hidden', !isActive);
    field.querySelectorAll('select').forEach((select) => {
      select.disabled = !isActive;
    });
  });
}

function showView(viewName) {
  const isRecommendation = viewName === 'recommendation';
  recommendationView.classList.toggle('hidden', !isRecommendation);
  leaderboardView.classList.toggle('hidden', isRecommendation);

  viewButtons.forEach((button) => {
    const active = button.dataset.view === viewName;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
}

function renderTopMatches(ranked, privacyConstraintApplied, eligibleModelCount) {
  topMatchesTableEl.innerHTML = ranked.slice(0, 3).map((model) => `
    <tr>
      <td><strong>${model.name}</strong><br><span class="muted">${model.provider}</span></td>
      <td><strong>${model.score}</strong></td>
      <td>${model.scoreBreakdown.benchmark}</td>
      <td>${model.scoreBreakdown.quality}</td>
      <td>${model.scoreBreakdown.cost}</td>
      <td>${model.scoreBreakdown.speed}</td>
      <td>${model.scoreBreakdown.context}</td>
      <td>${model.scoreBreakdown.reliability}</td>
      <td>${model.scoreBreakdown.privacy}</td>
    </tr>
  `).join('');

  constraintSummaryEl.textContent = privacyConstraintApplied
    ? `Privacy requirement applied: ${eligibleModelCount} of ${models.length} models met the current privacy threshold.`
    : 'Scores are led by the task benchmark, then adjusted for quality, cost, speed, context, reliability, and privacy preferences.';
}

function getRecommendationText() {
  if (!latestRecommendation) return '';
  return [
    `ModelAtlas recommendation: ${latestRecommendation.primary.name}`,
    `Budget alternative: ${latestRecommendation.budget.name}`,
    `Fast alternative: ${latestRecommendation.fast.name}`,
    `Why: ${latestRecommendation.explanation}`
  ].join('\n');
}

function saveFormValues(values) {
  localStorage.setItem('modelatlas-form', JSON.stringify(values));
}

function restoreFormValues() {
  const stored = localStorage.getItem('modelatlas-form');
  if (!stored) return;

  try {
    const values = JSON.parse(stored);
    Object.entries(values).forEach(([name, value]) => {
      const input = form.elements.namedItem(name);
      if (input && input.value !== undefined) input.value = value;
    });
  } catch {
    localStorage.removeItem('modelatlas-form');
  }
}

function renderComparisonSummary(task) {
  const taskLabel = {
    writing: 'writing',
    coding: 'coding',
    research: 'research',
    summarization: 'summarization',
    general: 'general assistant work',
    extraction: 'document extraction'
  };

  comparisonSummaryEl.innerHTML = `
    <p>
      Benchmark view for <strong>${taskLabel[task] || 'this task'}</strong>.
      Scores below are sourced from public model launch materials and documentation, with confidence and version metadata included.
    </p>
  `;
}

function renderScenarioComparison(scenarioComparison) {
  const cards = [
    {
      label: 'Best overall value',
      model: scenarioComparison.bestValue,
      detail: 'Strongest quality-to-cost balance'
    },
    {
      label: 'Best budget choice',
      model: scenarioComparison.bestBudget,
      detail: 'Most efficient option for lower spend'
    },
    {
      label: 'Best speed',
      model: scenarioComparison.bestSpeed,
      detail: 'Fastest low-latency option'
    },
    {
      label: 'Best long context',
      model: scenarioComparison.bestLongContext,
      detail: 'Best for large documents and codebases'
    },
    {
      label: 'Best token efficiency',
      model: scenarioComparison.bestTokenEfficiency,
      detail: 'Fewer tokens for the same output goal'
    }
  ];

  scenarioComparisonEl.innerHTML = cards
    .map((entry) => `
      <div class="scenario-card">
        <p class="label">${entry.label}</p>
        <p class="scenario-model">${entry.model.name}</p>
        <p class="scenario-detail">${entry.detail}</p>
      </div>
    `)
    .join('');
}

function renderCostComparison(costComparison) {
  costComparisonTableEl.innerHTML = costComparison
    .map((entry) => `
      <tr>
        <td><strong>${entry.name}</strong><br><span class="muted">${entry.provider}</span></td>
        <td>$${Number(entry.costPer1M).toFixed(2)}</td>
        <td>${entry.tokenEfficiency}</td>
      </tr>
    `)
    .join('');
}

function renderUseCaseMatrix(bestByUseCase) {
  useCaseMatrixEl.innerHTML = bestByUseCase
    .map((entry) => `
      <div class="matrix-card">
        <p class="label">${entry.label}</p>
        <p class="matrix-model">${entry.model}</p>
        <p class="matrix-meta">${entry.provider} · benchmark ${entry.benchmarkScore}/100</p>
      </div>
    `)
    .join('');
}

function renderSummaryPanel(summary) {
  const cards = [
    { label: 'Newest', value: summary.newestLabel },
    { label: 'Cheapest', value: summary.cheapestLabel },
    { label: 'Fastest', value: summary.fastestLabel }
  ];

  summaryPanelEl.innerHTML = cards
    .map((entry) => `
      <div class="summary-card">
        <p class="label">${entry.label}</p>
        <p class="summary-value">${entry.value}</p>
      </div>
    `)
    .join('');
}

function renderDecisionGuide(decisionGuide) {
  useThisModelTextEl.textContent = decisionGuide.primary.useWhen;
  avoidThisModelTextEl.textContent = decisionGuide.primary.avoidWhen;
  bestBudgetChoiceTextEl.textContent = decisionGuide.budgetChoice.useWhen;
  bestPremiumOptionTextEl.textContent = decisionGuide.premiumOption.useWhen;
}

function renderComparisonTable(task) {
  const leaderboard = getLeaderboard(task);

  comparisonTableEl.innerHTML = leaderboard
    .map((model) => {
      const sourceLinks = models
        .find((entry) => entry.id === model.id)
        ?.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a>`)
        .join(' · ') ?? 'Source list unavailable';

      const match = models.find((entry) => entry.id === model.id);

      return `
        <tr>
          <td>
            <div class="model-name-group">
              <strong>${model.name}</strong>
              <span>${model.provider}</span>
            </div>
            <small>${model.benchmark.label}</small>
          </td>
          <td>${match?.quality ?? 0}</td>
          <td>${match?.costEfficiency ?? 0}</td>
          <td>${match?.speed ?? 0}</td>
          <td>${match?.context ?? 0}</td>
          <td>${match?.reliability ?? 0}</td>
          <td>${match?.privacy ?? 0}</td>
          <td class="source-cell">
            <div><strong>Confidence:</strong> ${match?.sourceConfidence ?? 'unknown'}</div>
            <div><strong>Version:</strong> ${match?.benchmarkVersion ?? 'unknown'}</div>
            <div><strong>Benchmark date:</strong> ${match?.benchmarkDate ?? 'unknown'}</div>
            <div>${sourceLinks}</div>
          </td>
        </tr>
      `;
    })
    .join('');
}

taskSelect.addEventListener('change', syncTaskSpecificQuestions);
syncTaskSpecificQuestions();

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());

  const recommendation = getRecommendation(values);
  latestRecommendation = recommendation;
  saveFormValues(values);

  primaryModelEl.textContent = recommendation.primary.name;
  budgetModelEl.textContent = recommendation.budget.name;
  fastModelEl.textContent = recommendation.fast.name;
  fallbackModelEl.textContent = recommendation.fallback.name;
  explanationTextEl.textContent = recommendation.explanation;
  renderScenarioComparison(recommendation.scenarioComparison);
  renderDecisionGuide(recommendation.decisionGuide);
  renderCostComparison(recommendation.costComparison);
  renderUseCaseMatrix(recommendation.bestByUseCase);
  renderSummaryPanel(recommendation.newestVsCheapestVsFastest.summary);
  renderTopMatches(recommendation.ranked, recommendation.privacyConstraintApplied, recommendation.eligibleModelCount);

  renderComparisonSummary(values.task);
  renderComparisonTable(values.task);
  showView('recommendation');
  resultSection.classList.remove('hidden');
});

viewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showView(button.dataset.view);
  });
});

changeAnswersButton.addEventListener('click', () => {
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showView('leaderboard');
});

copyRecommendationButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(getRecommendationText());
  copyRecommendationButton.textContent = 'Copied';
  window.setTimeout(() => { copyRecommendationButton.textContent = 'Copy recommendation'; }, 1600);
});

exportRecommendationButton.addEventListener('click', () => {
  if (!latestRecommendation) return;
  const blob = new Blob([JSON.stringify(latestRecommendation, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'modelatlas-recommendation.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

initializeMetrics();
restoreFormValues();
syncTaskSpecificQuestions();
renderComparisonSummary('coding');
renderComparisonTable('coding');
showView('leaderboard');
