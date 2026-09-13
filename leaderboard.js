import { models } from './src/data/models.js';
import { getLeaderboard } from './src/logic/scoring.js';

const taskSelect = document.getElementById('leaderboard-task');
const summaryEl = document.getElementById('leaderboard-summary');
const tableBody = document.querySelector('#leaderboard-table tbody');

function renderSummary(task) {
  const label = task === 'general' ? 'general assistant work' : 'coding';
  summaryEl.innerHTML = `
    <p>
      Benchmark view for <strong>${label}</strong>.
      Scores are ranked by benchmark performance and adjusted for quality, cost, speed, context, reliability, and privacy.
    </p>
  `;
}

function renderLeaderboard(task) {
  const leaderboard = getLeaderboard(task);
  renderSummary(task);

  tableBody.innerHTML = leaderboard.map((model) => {
    const match = models.find((entry) => entry.id === model.id);
    const sourceLinks = match?.sources
      .map((source) => `<a href="${source.url}" target="_blank" rel="noreferrer">${source.name}</a>`)
      .join(' · ') ?? 'Source list unavailable';

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
  }).join('');
}

taskSelect.addEventListener('change', (event) => {
  renderLeaderboard(event.target.value);
});

renderLeaderboard(taskSelect.value);
