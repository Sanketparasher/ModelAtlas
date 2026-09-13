import { benchmarkSnapshotDate, models } from './src/data/models.js';
import { getRecommendation } from './src/logic/scoring.js';

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
  if (!modelsTrackedEl || !useCasesTrackedEl || !bestValueModelEl || !frontierModelEl) return;
  modelsTrackedEl.textContent = models.length;
  useCasesTrackedEl.textContent = new Set(models.flatMap((model) => Object.keys(model.benchmarks ?? {}))).size;
  const valueModel = [...models].sort((a, b) => b.costEfficiency - a.costEfficiency)[0];
  const frontierModel = [...models].sort((a, b) => b.quality - a.quality)[0];
  bestValueModelEl.textContent = valueModel?.name ?? 'Unavailable';
  frontierModelEl.textContent = frontierModel?.name ?? 'Unavailable';
  const statusPill = document.querySelector('.status-pill');
  if (statusPill) statusPill.textContent = `Snapshot · ${formatSnapshotDate(benchmarkSnapshotDate)}`;
}

function syncTaskSpecificQuestions() {
  if (!taskSelect) return;
  const activeTask = taskSelect.value;

  taskSpecificFields.forEach((field) => {
    const isActive = field.dataset.task === activeTask;
    field.classList.toggle('hidden', !isActive);
    field.querySelectorAll('select').forEach((select) => {
      select.disabled = !isActive;
    });
  });
}

function renderTopMatches(ranked, privacyConstraintApplied, eligibleModelCount) {
  if (!topMatchesTableEl || !constraintSummaryEl) return;

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
  if (!form) return;
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

function renderScenarioComparison(scenarioComparison) {
  if (!scenarioComparisonEl) return;

  const cards = [
    { label: 'Best overall value', model: scenarioComparison.bestValue, detail: 'Strongest quality-to-cost balance' },
    { label: 'Best budget choice', model: scenarioComparison.bestBudget, detail: 'Most efficient option for lower spend' },
    { label: 'Best speed', model: scenarioComparison.bestSpeed, detail: 'Fastest low-latency option' },
    { label: 'Best long context', model: scenarioComparison.bestLongContext, detail: 'Best for large documents and codebases' },
    { label: 'Best token efficiency', model: scenarioComparison.bestTokenEfficiency, detail: 'Fewer tokens for the same output goal' }
  ];

  scenarioComparisonEl.innerHTML = cards.map((entry) => `
    <div class="scenario-card">
      <p class="label">${entry.label}</p>
      <p class="scenario-model">${entry.model.name}</p>
      <p class="scenario-detail">${entry.detail}</p>
    </div>
  `).join('');
}

function renderCostComparison(costComparison) {
  if (!costComparisonTableEl) return;
  costComparisonTableEl.innerHTML = costComparison.map((entry) => `
    <tr>
      <td><strong>${entry.name}</strong><br><span class="muted">${entry.provider}</span></td>
      <td>$${Number(entry.costPer1M).toFixed(2)}</td>
      <td>${entry.tokenEfficiency}</td>
    </tr>
  `).join('');
}

function renderUseCaseMatrix(bestByUseCase) {
  if (!useCaseMatrixEl) return;
  useCaseMatrixEl.innerHTML = bestByUseCase.map((entry) => `
    <div class="matrix-card">
      <p class="label">${entry.label}</p>
      <p class="matrix-model">${entry.model}</p>
      <p class="matrix-meta">${entry.provider} · benchmark ${entry.benchmarkScore}/100</p>
    </div>
  `).join('');
}

function renderSummaryPanel(summary) {
  if (!summaryPanelEl) return;
  const cards = [
    { label: 'Newest', value: summary.newestLabel },
    { label: 'Cheapest', value: summary.cheapestLabel },
    { label: 'Fastest', value: summary.fastestLabel }
  ];

  summaryPanelEl.innerHTML = cards.map((entry) => `
    <div class="summary-card">
      <p class="label">${entry.label}</p>
      <p class="summary-value">${entry.value}</p>
    </div>
  `).join('');
}

function renderDecisionGuide(decisionGuide) {
  if (!useThisModelTextEl || !avoidThisModelTextEl || !bestBudgetChoiceTextEl || !bestPremiumOptionTextEl) return;
  useThisModelTextEl.textContent = decisionGuide.primary.useWhen;
  avoidThisModelTextEl.textContent = decisionGuide.primary.avoidWhen;
  bestBudgetChoiceTextEl.textContent = decisionGuide.budgetChoice.useWhen;
  bestPremiumOptionTextEl.textContent = decisionGuide.premiumOption.useWhen;
}

if (!form) {
  initializeMetrics();
} else {
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
    resultSection.classList.remove('hidden');
  });

  changeAnswersButton.addEventListener('click', () => {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resultSection.classList.add('hidden');
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
}
