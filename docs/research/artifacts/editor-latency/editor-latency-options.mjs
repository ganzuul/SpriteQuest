// Pure probe configuration/summary helpers: no browser, provider, or host side effects.
export const supportedModes = ['local-json', 'local-expand', 'detail-enum', 'detail-toggle', 'detail-save', 'selection', 'shelf-create', 'search-create', 'connect-hover', 'connect-release'];

export function parseAuditOptions(args) {
    const value = (name, fallback) => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
    const bounded = (name, fallback, min, max) => {
        const raw = value(name, String(fallback)), number = Number(raw);
        if (!raw.trim() || !Number.isSafeInteger(number) || number < min || number > max) throw Error(`Use bounded ${name}: ${min}..${max}.`);
        return number;
    };
    const flag = name => {
        if (args.some(arg => arg.startsWith(`--${name}=`))) throw Error(`Unsupported flag value; use --${name}.`);
        return args.includes(`--${name}`);
    };
    const sizes = value('sizes', '25,100,250').split(',').map(Number);
    const rates = value('rates', '1,4').split(',').map(Number);
    const modes = value('modes', supportedModes.join(',')).split(',');
    const motionModes = value('motion-modes', 'drag,pan,zoom,wire-preview').split(',');
    if (!motionModes.length || new Set(motionModes).size !== motionModes.length || !motionModes.every(mode => ['drag','pan','zoom','wire-preview'].includes(mode))) throw Error('Unsupported motion modes.');
    if (!sizes.length || !sizes.every(n => Number.isSafeInteger(n) && n >= 2 && n <= 500) || !rates.length || !rates.every(n => Number.isFinite(n) && n >= 1 && n <= 8)) throw Error('Use bounded sizes and CPU rates.');
    if (!modes.length || !modes.every(mode => supportedModes.includes(mode))) throw Error('Unsupported action mode.');
    return {sizes, rates, modes, motionModes, repeats: bounded('repeats', 7, 2, 30), motionPlain: flag('motion-plain'), motionRepeats: bounded('motion-repeats', 5, 1, 20), motionFrames: bounded('motion-frames', 45, 2, 120), motionEvents: bounded('motion-events', 6, 1, 12), motionInstrumentedRepeats: 2, skipMotion: flag('skip-motion')};
}

export const percentile = (values, p) => values.length ? values.toSorted((a, b) => a - b)[Math.ceil(values.length * p) - 1] : null;
const worst = values => values.length ? Math.max(...values) : null;
export function summarizeMotionSample({intervals, handlers}) {
    return {frameMedianMs: percentile(intervals, .5), frameP95Ms: percentile(intervals, .95), frameWorstMs: worst(intervals), framesOver20Ms: intervals.filter(ms => ms > 20).length, framesOver25Ms: intervals.filter(ms => ms > 25).length, handlerP95Ms: percentile(handlers, .95), handlerWorstMs: worst(handlers)};
}

export function summarizeMotionSamples(rows) {
    const groups = new Map();
    for (const row of rows) {
        if (!row.intervals || row.warmup) continue;
        const sampling = row.detailed ? 'instrumented' : 'plain';
        const key = JSON.stringify([row.size, row.rate, row.mode, sampling]);
        const group = groups.get(key) ?? {size: row.size, rate: row.rate, mode: row.mode, sampling, samples: []};
        group.samples.push(row); groups.set(key, group);
    }
    return [...groups.values()].map(({samples, ...group}) => {
        const summary = {...group, repeats: samples.length, ...summarizeMotionSample({intervals: samples.flatMap(row => row.intervals), handlers: samples.flatMap(row => row.handlers)})};
        for (const key of ['down', 'thresholdSync', 'thresholdSettled', 'releaseSync', 'releaseSettled', 'zoomCommitDelay', 'zoomCommitSync', 'zoomSaveBoundary']) {
            const values = samples.map(row => row[`${key}Ms`]).filter(Number.isFinite);
            summary[`${key}P95Ms`] = percentile(values, .95); summary[`${key}WorstMs`] = worst(values);
        }
        return summary;
    });
}
