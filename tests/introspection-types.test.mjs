import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const checked=spawnSync(process.execPath,['node_modules/typescript/bin/tsc','--ignoreConfig','--noEmit','--strict','--allowJs','--target','ES2022','--module','ESNext','--moduleResolution','bundler','tests/fixtures/introspection-consumer.ts'],{cwd:root,encoding:'utf8'});
assert.equal(checked.status,0,checked.stdout+checked.stderr);
