import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const files = readdirSync(new URL('../tests/', import.meta.url)).filter(f => f.endsWith('.test.mjs')).sort();
const requested = process.argv.slice(2);
let failed = 0;
let total = 0;
for (const file of files) {
    if (requested.length && !requested.some(part => file.includes(part))) continue;
    total++;
    const result = spawnSync(process.execPath, ['--import', './tools/node-test-host.mjs', `tests/${file}`], { cwd: root, encoding: 'utf8' });
    if (result.status === 0) console.log(`PASS ${file}`);
    else {
        failed++;
        console.error(`FAIL ${file}\n${result.stdout}\n${result.stderr}\n${result.error ?? ''}`);
    }
}
console.log(`${total - failed}/${total} test files passed`);
process.exitCode = failed || !total ? 1 : 0;
