import { models } from '../src/data/models.js';
import { BENCHMARK_SCHEMA_VERSION, validateModelCatalog } from '../src/data/benchmark-schema.js';

validateModelCatalog(models);

const benchmarkCount = models.reduce((count, model) => count + model.benchmarkRecords.length, 0);
console.log(`Validated ${models.length} models and ${benchmarkCount} benchmark records (schema ${BENCHMARK_SCHEMA_VERSION}).`);