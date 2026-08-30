import { models } from './src/data/models.js';
import { getLeaderboard, getRecommendation } from './src/logic/scoring.js';

const form = document.getElementById('recommendation-form');
const taskSelect = document.getElementById('task');
const taskSpecificFields = document.querySelectorAll('.task-field');
const resultSection = document.getElementById('result');
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
  });
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

renderComparisonSummary('coding');
renderComparisonTable('coding');
showView('leaderboard');
