import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
// npm run capture exercises the actual fresh launch, native cards, drawers,
// child views, zero-request running/failure and fractional/high-DPR joins.
const child = spawn(process.execPath, ['tools/capture-lattice-workspace.mjs', '--execute', '--output=benchmark-results/visuals'], {
    cwd: root, stdio: 'inherit', windowsHide: true,
});
const result = await new Promise((resolve, reject) => { child.once('error', reject); child.once('close', (code, signal) => resolve({code, signal})); });
if (result.code !== 0) throw Error('Current workspace capture failed: ' + JSON.stringify(result));
