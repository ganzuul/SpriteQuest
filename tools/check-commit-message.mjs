#!/usr/bin/env node
/**
 * Validate a commit message against the SDD/ICS form.
 *
 *   node tools/check-commit-message.mjs .git/COMMIT_EDITMSG
 *   node tools/check-commit-message.mjs --file path/to/message.txt
 *   node tools/check-commit-message.mjs --range origin/main..HEAD
 *
 * Used by the commit-msg hook (fast, local, bypassable) and available for CI
 * (authoritative, not bypassable by the author). It checks the *shape* of the
 * message and the freshness of the cited contract. It cannot check
 * comprehension, and does not pretend to.
 *
 * Exit codes: 0 valid, 1 invalid, 2 usage error.
 */

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../', import.meta.url)));
const FORM = '.github/commit-template.md';

const TYPES = new Set([
    'feat', 'fix', 'docs', 'build', 'chore', 'test', 'render', 'revert', 'perf', 'refactor',
]);
const TIERS = new Set(['exploratory', 'normative']);
const SUBJECT_RE = /^(?<type>[a-z]+)(?:\((?<scope>[a-z0-9._-]+)\))?!?: (?<subject>\S.*)$/;
const SKIP_RE = /^(Merge |Revert "|fixup! |squash! |amend! )/;
const CONFORMANCE_RE = /^(?<support>Y|N|n\.a\.)\s+(?<items>.+)$/;
const REVISION_RE = /^Contract revision:\s*(?<value>[0-9a-f]{7,40})\s*$/i;
const PLACEHOLDERS = [
    '<type>(<scope>)',
    '<The constraint this commit responds to.>',
    '<path or "none">',
    '<git hash-object of the contract; delete when Contract is none>',
    '<new | amended | unchanged | none>',
    '<exploratory | normative>',
    '<item ids>',
    '<item id>',
    '<what is missing>',
    '<what differs>',
    '<why>',
    '<what the contract failed to say>',
    '<open | amended in this commit>',
    '<excluded capability or path>',
    '<command>: <result>',
    '<prerequisite for the next change>',
];

/** git's blob id for a file, without invoking git. */
export function gitBlobHash(content) {
    const body = Buffer.from(content, 'utf8');
    return createHash('sha1')
        .update(`blob ${body.length}\0`)
        .update(body)
        .digest('hex');
}

function stripComments(text) {
    return text
        .split('\n')
        .filter((line) => !line.startsWith('#'))
        .join('\n');
}

function section(lines, heading) {
    const start = lines.findIndex((line) => line.trim() === heading);
    if (start === -1) return null;
    const rest = lines.slice(start + 1);
    const end = rest.findIndex((line) => line.trim() !== '' && /^[A-Z][A-Za-z ]*$/.test(line.trim()) && line.trim().length < 40);
    return (end === -1 ? rest : rest.slice(0, end)).filter((line) => line.trim() !== '');
}

/**
 * @returns {{ok: boolean, errors: string[], warnings: string[], skipped?: string}}
 */
export function validateMessage(rawText, options = {}) {
    const root = options.root ?? ROOT;
    const readContract = options.readContract ?? ((path) => readFileSync(join(root, path), 'utf8'));
    const contractExists = options.contractExists ?? ((path) => existsSync(join(root, path)));

    const text = stripComments(rawText).replace(/\r\n/g, '\n');
    const lines = text.split('\n');
    const errors = [];
    const warnings = [];

    const subject = (lines.find((line) => line.trim() !== '') ?? '').trim();
    if (!subject) return { ok: false, errors: ['The message is empty.'], warnings };

    if (SKIP_RE.test(subject)) {
        return { ok: true, errors: [], warnings: [], skipped: 'generated message (merge, revert or fixup)' };
    }

    for (const placeholder of PLACEHOLDERS) {
        if (text.includes(placeholder)) {
            errors.push(
                `The form is not filled in: found ${JSON.stringify(placeholder)}. `
                + `Edit the message, or read ${FORM}.`,
            );
            break;
        }
    }

    const match = SUBJECT_RE.exec(subject);
    if (!match) {
        errors.push(
            `Subject must read "<type>(<scope>): <act> <object>", not ${JSON.stringify(subject)}. `
            + `See ${FORM}.`,
        );
    } else {
        if (!TYPES.has(match.groups.type)) {
            errors.push(`Unknown type ${JSON.stringify(match.groups.type)}; use one of ${[...TYPES].join(', ')}.`);
        }
        if (subject.length > 72) errors.push(`Subject is ${subject.length} characters; the limit is 72.`);
    }

    const tierLine = lines.find((line) => /^Tier:\s*/i.test(line));
    if (!tierLine) {
        errors.push('Missing "Tier: exploratory|normative". A commit that introduces a structure must name its tier.');
    } else {
        const value = (tierLine.replace(/^Tier:\s*/i, '').match(/^[A-Za-z]+/) ?? [''])[0].toLowerCase();
        if (!TIERS.has(value)) {
            errors.push(`Tier must be exploratory or normative, not ${JSON.stringify(value)}.`);
        }
    }

    const contractLine = lines.find((line) => /^Contract:\s*/i.test(line));
    if (!contractLine) {
        errors.push('Missing "Contract: <path>" or "Contract: none".');
    }
    const contractValue = contractLine
        ? contractLine.replace(/^Contract:\s*/i, '').trim().replace(/^["']|["']$/g, '')
        : '';
    const contractPath = contractValue && contractValue.toLowerCase() !== 'none' ? contractValue : null;

    if (contractPath) {
        if (!contractExists(contractPath)) {
            errors.push(`Contract ${JSON.stringify(contractPath)} does not exist.`);
        } else {
            const stated = lines.map((line) => REVISION_RE.exec(line)).find(Boolean);
            const actual = gitBlobHash(readContract(contractPath));
            if (!stated) {
                errors.push(
                    'Missing "Contract revision: <hash>". Record the contract you read:\n'
                    + `    git hash-object ${contractPath}\n`
                    + '  The first 12 characters are enough.',
                );
            } else if (!actual.startsWith(stated.groups.value.toLowerCase())) {
                errors.push(
                    `Contract revision ${stated.groups.value} is stale; ${contractPath} is now ${actual.slice(0, 12)}.\n`
                    + '  Re-read the contract and update the item numbers before committing.',
                );
            }
        }

        const conformance = section(lines, 'Conformance');
        if (!conformance) {
            errors.push('A cited contract needs a "Conformance" section with one Y, N or n.a. line per item group.');
        } else {
            const entries = conformance
                .map((line) => CONFORMANCE_RE.exec(line))
                .filter(Boolean);
            if (entries.length === 0) {
                errors.push('The "Conformance" section has no Y, N or n.a. lines.');
            }
            const deviations = section(lines, 'Deviations') ?? [];
            for (const entry of entries) {
                if (entry.groups.support !== 'N') continue;
                const itemPart = entry.groups.items.split(':')[0];
                const ids = itemPart.split(/[\s,]+/).filter((id) => /^[A-Z]+[0-9]+$/.test(id));
                for (const id of ids) {
                    const declared = deviations.some((line) => new RegExp(`^-\\s*${id}\\b`).test(line.trim()));
                    if (!declared) {
                        errors.push(`Item ${id} is "N" but has no deviation line ("- ${id}: what differs — why").`);
                    }
                }
            }
        }
    }

    const verification = section(lines, 'Verification');
    if (!verification) {
        errors.push('Missing "Verification" with at least one command and its result.');
    } else if (!verification.some((line) => /^-\s+\S/.test(line.trim()))) {
        errors.push('The "Verification" section needs at least one "- <command>: <result>" line.');
    }

    const body = lines.slice(1).join('\n').trim();
    if (body.length > 4000) {
        warnings.push(`Body is ${body.length} characters; consider moving detail into the contract.`);
    }

    if (errors.length > 0) {
        errors.push(`The form is ${FORM}; read it before retrying.`);
    }
    return { ok: errors.length === 0, errors, warnings };
}

function messageFromCommit(sha) {
    return execFileSync('git', ['log', '-1', '--format=%B', sha], { cwd: ROOT, encoding: 'utf8' });
}

function commitsInRange(range) {
    const output = execFileSync('git', ['rev-list', '--no-merges', range], { cwd: ROOT, encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
}

function main(argv) {
    let file = null;
    let range = null;
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === '--file') file = argv[++index];
        else if (argument === '--range') range = argv[++index];
        else if (argument === '--help' || argument === '-h') {
            console.log('usage: check-commit-message.mjs <file> | --file <file> | --range <rev-range>');
            return 0;
        } else if (argument.startsWith('-')) {
            console.error(`unknown option ${argument}`);
            return 2;
        } else {
            file = argument;
        }
    }

    if (range) {
        const commits = commitsInRange(range);
        if (commits.length === 0) {
            console.log('No commits to check.');
            return 0;
        }
        let failed = 0;
        for (const sha of commits) {
            const result = validateMessage(messageFromCommit(sha));
            if (result.skipped) {
                console.log(`SKIP ${sha.slice(0, 8)} ${result.skipped}`);
                continue;
            }
            if (!result.ok) {
                failed += 1;
                console.error(`FAIL ${sha.slice(0, 8)}\n${result.errors.map((error) => `  - ${error}`).join('\n')}`);
            } else {
                console.log(`PASS ${sha.slice(0, 8)}`);
            }
        }
        return failed > 0 ? 1 : 0;
    }

    if (!file) {
        console.error('usage: check-commit-message.mjs <file> | --file <file> | --range <rev-range>');
        return 2;
    }
    const path = isAbsolute(file) ? file : resolve(process.cwd(), file);
    const result = validateMessage(readFileSync(path, 'utf8'));
    if (result.skipped) return 0;
    for (const warning of result.warnings) console.warn(`warning: ${warning}`);
    if (!result.ok) {
        console.error('\nCommit message does not follow the form:\n');
        for (const error of result.errors) console.error(`  - ${error}`);
        console.error('');
        return 1;
    }
    return 0;
}

const invokedDirectly = process.argv[1]
    && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (invokedDirectly) {
    process.exitCode = main(process.argv.slice(2));
}

export { FORM, commitList, main };

function commitList(range) {
    return commitsInRange(range);
}