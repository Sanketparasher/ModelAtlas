import test from 'node:test';
import assert from 'node:assert/strict';

import { models } from '../src/data/models.js';
import { validateBenchmarkRecord, validateModelCatalog } from '../src/data/benchmark-schema.js';
import { BENCHMARK_WEIGHT, getBenchmarkScore, getRecommendation, PRIVACY_REQUIRED_THRESHOLD } from '../src/logic/scoring.js';

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
  assert.equal(BENCHMARK_WEIGHT, 45, 'benchmark should be the largest score component');
  assert.equal(recommendation.primary.scoreBreakdown.benchmark, recommendation.primary.scoreBreakdown.taskFit, 'legacy task-fit field should mirror benchmark contribution');
  assert.equal(getBenchmarkScore(models.find((model) => model.id === recommendation.primary.id), 'coding'), recommendation.primary.benchmark.score, 'recommendation should use normalized benchmark records');
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

  assert.notEqual(codingDeepWork.primary.score, codingFastWork.primary.score, 'task-specific coding profile should adjust benchmark weighting');
  assert.ok(codingDeepWork.primary.benchmark.score > 0, 'coding recommendation should have a sourced benchmark');
});

test('leaderboard data is live-source-backed and includes date/version metadata', () => {
  const liveModel = models.find((model) => model.benchmarkRecords.some((record) => record.task === 'coding'));
  assert.ok(liveModel, 'a live coding benchmark model should exist');
  assert.ok(liveModel.benchmarkDate, 'benchmark date is missing');
  assert.match(liveModel.benchmarkVersion, /^live-\d{4}-\d{2}-\d{2}$/);
  assert.ok(liveModel.benchmarks.coding.value > 0, 'coding benchmark score should be positive');
});

test('privacy required applies an eligibility constraint', () => {
  const recommendation = getRecommendation({
    task: 'coding',
    priority: 'balanced',
    speed: 'medium',
    context: 'medium',
    privacy: 'required'
  });

  assert.equal(recommendation.privacyConstraintApplied, false, 'privacy filtering should be disabled when trusted sources do not publish privacy scores');
  assert.equal(recommendation.eligibleModelCount, models.length);
});

test('workflow constraints contribute to the recommendation score', () => {
  const baseline = getRecommendation({ task: 'general', priority: 'balanced', speed: 'medium', context: 'medium', privacy: 'preferred' });
  const structured = getRecommendation({
    task: 'general',
    priority: 'balanced',
    speed: 'medium',
    context: 'medium',
    privacy: 'preferred',
    input_type: 'multimodal',
    output_format: 'structured',
    deployment: 'controlled'
  });

  assert.notEqual(structured.ranked[0].scoreBreakdown.benchmark, baseline.ranked[0].scoreBreakdown.benchmark);
});

test('normalized benchmark records preserve provenance', () => {
  const record = models[0].benchmarkRecords[0];

  assert.equal(validateBenchmarkRecord(record), null);
  assert.equal(record.modelId, models[0].id);
  assert.ok(record.release);
  assert.ok(record.source.url);
  assert.equal(validateModelCatalog(models), true);
});

test('benchmark validation rejects invalid values and duplicate models', () => {
  const validRecord = models[0].benchmarkRecords[0];
  assert.equal(validateBenchmarkRecord({ ...validRecord, value: 101 }), 'value must be between 0 and 100');
  assert.throws(() => validateModelCatalog([models[0], models[0]]), /Duplicate or missing model id/);
});
