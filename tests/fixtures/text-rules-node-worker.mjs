import { parentPort, workerData } from 'node:worker_threads';
import { runTextRuleSegments } from '../../src/workflow/operations/text-rules-engine.js';
function started() { parentPort.postMessage({ fixtureStarted: true }); }
if (workerData?.entryURL) {
    // Exercise the actual browser Worker entry in a real Node thread.
    globalThis.self = {
        addEventListener(type, listener) {
            if (type === 'message') parentPort.on('message', data => { started(); listener({ data }); });
        },
        postMessage(data) { parentPort.postMessage(data); },
    };
    await import(workerData.entryURL);
} else {
    parentPort.on('message', request => { started(); parentPort.postMessage(runTextRuleSegments(request)); });
}
