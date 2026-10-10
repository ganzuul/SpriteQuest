import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';

const clientURL = new URL('../../node_modules/svelte/src/index-client.js', import.meta.url).href;

// Compile the actual component tree so panel tests exercise child editors, too.
export async function compiled(name, directory, source, sourceURL = new URL('../../ui/' + name + '.svelte', import.meta.url), paths = new Map()) {
    const identity = sourceURL.href;
    if (paths.has(identity)) return { path: paths.get(identity) };
    source ??= await readFile(sourceURL, 'utf8');
    const output = compile(source, { filename: sourceURL.pathname, generate: 'client', css: 'injected' });
    assert.deepEqual(output.warnings.filter(warning => warning.code.startsWith('a11y')), []);
    const path = join(directory, name + '.mjs');
    paths.set(identity, path);
    let code = output.js.code;
    for (const match of [...code.matchAll(/(['"])(\.\.?\/[^'"]+\.svelte)\1/g)]) {
        const childURL = new URL(match[2], sourceURL), childName = childURL.pathname.split('/').at(-1).replace(/\.svelte$/, '');
        const child = await compiled(childName, directory, undefined, childURL, paths);
        code = code.replaceAll(match[0], JSON.stringify(pathToFileURL(child.path).href));
    }
    code = code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
    code = code.replace(/(['"])(\.\.?\/[^'"]+)\1/g, (_, quote, specifier) => JSON.stringify(new URL(specifier, sourceURL).href));
    await writeFile(path, code);
    return { path, component: (await import(pathToFileURL(path).href)).default };
}
