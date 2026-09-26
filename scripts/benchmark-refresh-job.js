import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const updateScriptPath = path.join(rootDir, 'scripts', 'update-benchmarks.js');
const intervalMs = Number(process.env.MODELATLAS_BENCHMARK_REFRESH_MS ?? 6 * 60 * 60 * 1000);
const shouldRunOnce = process.argv.includes('--once');

function runRefresh() {
  console.log(`[benchmark-refresh] Checking for updated benchmark data...`);
  const result = spawnSync(process.execPath, [updateScriptPath], {
    cwd: rootDir,
    stdio: 'inherit'
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }
}

runRefresh();

if (shouldRunOnce) {
  console.log('[benchmark-refresh] One-time refresh completed.');
  process.exit(0);
}

console.log(`[benchmark-refresh] Monitoring benchmark sources every ${intervalMs} ms.`);
setInterval(runRefresh, intervalMs);
