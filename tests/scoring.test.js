import test from 'node:test';
import assert from 'node:assert/strict';

import { models } from '../src/data/models.js';
import { getRecommendation } from '../src/logic/scoring.js';

test('models include benchmark metadata and source references', () => {
  assert.ok(Array.isArray(models), 'models should be an array');
  assert.ok(models.length > 0, 'at least one model should exist');

  for (const model of models) {
    assert.ok(model.benchmarks, `missing benchmarks for ${model.name}`);
    assert.ok(Array.isArray(model.sources), `missing sources for ${model.name}`);
    assert.ok(model.sources.length > 0, `sources array is empty for ${model.name}`);
    assert.ok(model.benchmarkVersion, `missing benchmark version for ${model.name}`);
    assert.ok(model.sourceConfidence, `missing source confidence for ${model.name}`);
  }
});

test('recommendation uses benchmark-driven scoring', () => {
  const recommendation = getRecommendation({
    task: 'coding',
    priority: 'quality',
    speed: 'high',
    context: 'long',
    privacy: 'not-important'
  });

  assert.ok(recommendation.primary, 'primary recommendation is defined');
  assert.ok(recommendation.primary.name, 'primary model has a name');
  assert.ok(Array.isArray(recommendation.ranked), 'ranked results are returned');
  assert.ok(recommendation.ranked.length === models.length, 'ranked list should include all models');
  assert.ok(recommendation.explanation.includes('benchmark') || recommendation.explanation.includes('source'), 'explanation should mention benchmark logic');
  assert.ok(recommendation.scenarioComparison, 'scenario comparison is included');
  assert.ok(recommendation.scenarioComparison.bestValue, 'best value comparison is defined');
  assert.ok(recommendation.scenarioComparison.bestBudget, 'best budget comparison is defined');
  assert.ok(recommendation.scenarioComparison.bestSpeed, 'best speed comparison is defined');
  assert.ok(recommendation.scenarioComparison.bestLongContext, 'best long-context comparison is defined');
  assert.ok(recommendation.costComparison, 'cost comparison table is included');
  assert.ok(recommendation.bestByUseCase, 'best-by-use-case matrix is included');
  assert.ok(recommendation.newestVsCheapestVsFastest, 'summary panel data is included');
});

test('task-specific follow-up answers influence ranking', () => {
  const codingDeepWork = getRecommendation({
    task: 'coding',
    priority: 'quality',
    speed: 'high',
    context: 'long',
    privacy: 'not-important',
    codebase_size: 'large',
    tool_use: 'deep',
    validation: 'strict'
  });

  const codingFastWork = getRecommendation({
    task: 'coding',
    priority: 'quality',
    speed: 'high',
    context: 'long',
    privacy: 'not-important',
    codebase_size: 'small',
    tool_use: 'basic',
    validation: 'light'
  });

  assert.notEqual(
    codingDeepWork.primary.name,
    codingFastWork.primary.name,
    'task-specific coding profile should change the recommendation'
  );

  assert.ok(
    ['Claude Sonnet 4', 'O3', 'GPT-4.1', 'Claude Opus 4', 'Gemini 2.5 Pro'].includes(codingDeepWork.primary.name),
    'large codebase + deep tool use + strict validation should favor stronger reasoning models over O4 Mini'
  );
  assert.notEqual(codingDeepWork.primary.name, 'O4 Mini', 'large, deep, strict engineering work should not recommend O4 Mini as the primary model');
});

test('leaderboard data is CSV-backed and includes date/version metadata', () => {
  const csvModel = models.find((model) => model.id === 'claude-sonnet-4');
  assert.ok(csvModel, 'Claude Sonnet 4 model should exist');
  assert.ok(csvModel.benchmarkDate, 'benchmark date is missing');
  assert.ok(csvModel.benchmarkVersion, 'benchmark version is missing');
  assert.ok(['high', 'medium', 'low'].includes(csvModel.sourceConfidence), 'confidence must be one of high/medium/low');
  assert.ok(csvModel.benchmarks.coding.score > 0, 'coding benchmark score should be positive');
});
