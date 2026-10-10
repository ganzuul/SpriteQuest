import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createInstalledHostBoundary } from './smoke-unified-host.mjs';

const DEFAULT_SCREENSHOT = 'docs/research/artifacts/connection-routing/sillytavern-routing-fixed.png';
const DEFAULT_EXTENSION = '/scripts/extensions/third-party/Lattice';

/** Run in the real host document, using only a detached prepared drawing graph. */
async function inspectInstalledConnections({ extensionBase, version }) {
    const moduleURL = path => `${extensionBase}/${path}?v=${version}`;
    const [{ Canvas }, { operationDefaults }, { prepareWorkspaceViews }] = await Promise.all([
        import(moduleURL('src/canvas.js')),
        import(moduleURL('src/workflow/catalog.js')),
        import(moduleURL('src/ui/workspace-preparation.js')),
    ]);
    const require = (condition, code, detail = '') => {
        if (!condition) throw Error(code + (detail ? ': ' + detail : ''));
    };
    const settle = async () => {
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    };
    await document.fonts.ready;
    await settle();
    const contextSnapshot = () => {
        const context = window.SillyTavern.getContext();
        return JSON.stringify({ settings: context.extensionSettings, chat: context.chat, metadata: context.chatMetadata });
    };
    const originalHostState = contextSnapshot();
    const overlay = document.createElement('dialog');
    overlay.id = 'lattice-connection-host-test';
    overlay.className = 'pc-root pc-open';
    overlay.style.cssText = 'z-index:2147483647;background:var(--pc-panel);display:flex;padding:20px;gap:14px;box-sizing:border-box;border:0;margin:0;max-width:none;max-height:none;';
    const heading = document.createElement('header');
    heading.style.cssText = 'flex:none;display:flex;align-items:baseline;justify-content:space-between;gap:24px;padding:0 6px;';
    const title = document.createElement('h1');
    title.textContent = 'Lattice · installed SillyTavern connection routing';
    title.style.cssText = 'margin:0;font:600 24px/1.3 var(--pc-font);color:var(--pc-text);';
    const status = document.createElement('p');
    status.textContent = 'Actual Canvas · detached graph · zero provider requests';
    status.style.cssText = 'margin:0;font:14px/1.4 var(--pc-font);color:var(--pc-muted);';
    heading.append(title, status);
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:16px;flex:1;min-height:0;';
    overlay.append(heading, grid);
    document.body.append(overlay);
    // The host can retain a loading dialog while intentionally blocked startup
    // reads settle. A separate temporary top-layer panel keeps the artifact clear.
    overlay.showModal();
    const canvases = [];
    const outcomes = [];
    const plain = point => ({ x: point.x, y: point.y });
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const tolerance = .00001;

    function parsePath(d) {
        const tokens = d.match(/[MLC]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi) ?? [];
        let index = 0, point;
        const segments = [];
        const read = () => ({ x: Number(tokens[index++]), y: Number(tokens[index++]) });
        while (index < tokens.length) {
            const command = tokens[index++];
            require(['M', 'L', 'C'].includes(command), 'UNEXPECTED_ROUTE_COMMAND');
            if (command === 'M') point = read();
            else {
                const controls = command === 'C' ? [read(), read()] : [];
                const end = read();
                require([point, ...controls, end].every(p => Number.isFinite(p?.x) && Number.isFinite(p?.y)), 'NONFINITE_ROUTE');
                segments.push({ command, start: point, controls, end });
                point = end;
            }
        }
        require(segments.length === 5, 'EXPECTED_TWO_TURNS_AND_DIRECT_MIDDLE');
        return segments;
    }

    function inspectTurn(turn, vertical, middleAngle, turnIndex) {
        require(turn.command === 'C', 'EXPECTED_CUBIC_ENDPOINT_TURN');
        const [p0, p1, p2, p3] = [turn.start, ...turn.controls, turn.end];
        const derivative = t => ({
            x: 3 * ((1 - t) ** 2 * (p1.x - p0.x) + 2 * (1 - t) * t * (p2.x - p1.x) + t ** 2 * (p3.x - p2.x)),
            y: 3 * ((1 - t) ** 2 * (p1.y - p0.y) + 2 * (1 - t) * t * (p2.y - p1.y) + t ** 2 * (p3.y - p2.y)),
        });
        const second = t => ({
            x: 6 * ((1 - t) * (p2.x - 2 * p1.x + p0.x) + t * (p3.x - 2 * p2.x + p1.x)),
            y: 6 * ((1 - t) * (p2.y - 2 * p1.y + p0.y) + t * (p3.y - 2 * p2.y + p1.y)),
        });
        const tangents = Array.from({ length: 1001 }, (_, i) => derivative(i / 1000));
        const angles = tangents.map(p => Math.atan2(p.y * vertical, p.x));
        const rotation = turnIndex === 0 ? 1 : -1;
        const curvature = tangents.map((p, i) => {
            const q = second(i / 1000);
            return (p.x * q.y - p.y * q.x) * vertical * rotation;
        });
        // Also check native arc-length sampling, so the assertions include the
        // SVG implementation that paints the installed route.
        const local = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        local.setAttribute('d', `M ${p0.x},${p0.y} C ${[p1, p2, p3].map(p => `${p.x},${p.y}`).join(' ')}`);
        const length = local.getTotalLength();
        const points = Array.from({ length: 321 }, (_, i) => plain(local.getPointAtLength(length * i / 320)));
        return {
            minDerivativeX: Math.min(...tangents.map(p => p.x)),
            minNativeStepX: Math.min(...points.slice(1).map((p, i) => p.x - points[i].x)),
            tangentOvershoot: Math.max(0, ...angles.map(angle => Math.max(-angle, angle - middleAngle))),
            tangentReversal: Math.max(0, ...angles.slice(1).map((angle, i) => (angles[i] - angle) * rotation)),
            minSignedCurvature: Math.min(...curvature),
        };
    }

    function inspect(canvas) {
        const wire = canvas.graph.wires.route;
        const path = canvas.svg.querySelector('.pc-wire[data-id="route"]');
        const hit = canvas.svg.querySelector('.pc-wire-hit[data-id="route"]');
        require(path && hit, 'INSTALLED_WIRE_NOT_RENDERED');
        const d = path.getAttribute('d'), segments = parsePath(d);
        const length = path.getTotalLength();
        const samples = Array.from({ length: 2001 }, (_, i) => plain(path.getPointAtLength(length * i / 2000)));
        const start = samples[0], end = samples.at(-1);
        const screen = point => plain(new DOMPoint(point.x, point.y).matrixTransform(path.getScreenCTM()));
        const pin = (node, direction, port) => {
            const card = canvas.nodeLayer.querySelector(`.pc-node-native[data-id="${node}"]`);
            const rect = card.querySelector(`.pc-port[data-dir="${direction}"][data-port="${port}"]`).getBoundingClientRect();
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        };
        const middle = segments[2], vertical = Math.sign(middle.end.y - middle.start.y) || 1;
        const middleAngle = Math.atan2((middle.end.y - middle.start.y) * vertical, middle.end.x - middle.start.x);
        const label = canvas.svg.querySelector('.pc-wire-label[data-id="route"]');
        const labelPoint = { x: Number(label.getAttribute('x')), y: Number(label.getAttribute('y')) };
        const leads = [segments[0], segments.at(-1)];
        const sourceTurn = segments[1], targetTurn = segments[3];
        const anchors = { start: screen(start), output: pin(wire.from, 'out', wire.fromPort), end: screen(end), input: pin(wire.to, 'in', wire.toPort) };
        return {
            d, hitD: hit.getAttribute('d'), dx: end.x - start.x, dy: end.y - start.y,
            anchors,
            pinError: Math.max(distance(anchors.start, anchors.output), distance(anchors.end, anchors.input)),
            minNativeStepX: Math.min(...samples.slice(1).map((p, i) => p.x - samples[i].x)),
            departureLead: { x: leads[0].end.x - leads[0].start.x, y: leads[0].end.y - leads[0].start.y },
            arrivalLead: { x: leads[1].end.x - leads[1].start.x, y: leads[1].end.y - leads[1].start.y },
            middleIsLine: middle.command === 'L',
            labelDistance: Math.min(...samples.map(p => distance(p, labelPoint))),
            turnRadius: Math.max(...[
                ...[...sourceTurn.controls, sourceTurn.end].map(p => distance(p, sourceTurn.start)),
                ...[targetTurn.start, ...targetTurn.controls].map(p => distance(p, targetTurn.end)),
            ]),
            verticalDeviation: Math.max(...samples.map(p => Math.abs(p.y - start.y))),
            turns: [sourceTurn, targetTurn].map((turn, i) => inspectTurn(turn, vertical, middleAngle, i)),
        };
    }

    async function mountCase(testCase, visible = false) {
        const pane = document.createElement('section');
        pane.style.cssText = visible
            ? 'display:flex;flex-direction:column;min-width:0;min-height:0;border:1px solid var(--pc-border);border-radius:8px;overflow:hidden;'
            : 'position:absolute;width:1100px;height:760px;left:20px;top:70px;display:flex;flex-direction:column;';
        const caption = document.createElement('p');
        caption.textContent = `${testCase.name} · pin gap ${testCase.dx}px / ${testCase.dy}px`;
        caption.style.cssText = 'flex:none;margin:0;padding:12px 16px;font:600 16px/1.3 var(--pc-font);background:var(--pc-panel);color:var(--pc-text);';
        const host = document.createElement('div');
        host.className = 'pc-canvas-host';
        host.style.cssText = 'position:relative;flex:1;min-height:0;min-width:0;';
        pane.append(caption, host);
        (visible ? grid : overlay).append(pane);
        const authored = { id: 'installed-routing-' + testCase.name, name: 'Detached connection fixture', schema: 3, runtime: 2, mode: 'native-unified', roles: {}, nodes: {}, wires: {}, groups: {}, portals: {}, definitions: {}, view: { x: 0, y: 0, zoom: 1 } };
        for (const [id, x, y] of [['source', 80, Math.max(80, 80 - testCase.dy)], ['target', 500, 80]]) {
            authored.nodes[id] = { ...operationDefaults('compose'), id, type: 'workflow', operation: 'compose', operationVersion: 1, enabled: true, title: id === 'source' ? 'Source' : 'Target', x, y, outputKind: 'text', sections: [{ name: 'Text', text: 'Detached routing verification.' }] };
        }
        authored.wires.route = { id: 'route', route: 'wire', from: 'source', fromPort: 'out', to: 'target', toPort: 'section.Text' };
        const originalAuthored = JSON.stringify(authored);
        const prepared = prepareWorkspaceViews(authored);
        require(prepared.ok, 'DETACHED_GRAPH_PREPARATION_FAILED');
        const draw = structuredClone(prepared.data.preparedViews[0].drawBase);
        draw.view = { ...authored.view };
        const canvas = new Canvas(host, { canEdit: () => false });
        const mounted = { canvas, pane };
        canvases.push(mounted);
        canvas.setGraph(draw);
        await document.fonts.ready;
        await settle();
        const from = canvas.endpoint('source', 'out', 'out'), to = canvas.endpoint('target', 'in', 'section.Text');
        require(from && to, 'NAMED_PIN_GEOMETRY_UNAVAILABLE');
        draw.nodes.target.x += testCase.dx - (to.x - from.x);
        draw.nodes.target.y += testCase.dy - (to.y - from.y);
        canvas.render();
        // Give initial ResizeObserver notifications time to finish before the
        // immutable route baseline is captured for subsequent camera checks.
        await new Promise(resolve => setTimeout(resolve, 250));
        await settle();
        require(JSON.stringify(authored) === originalAuthored, 'AUTHORED_FIXTURE_MUTATED');
        return mounted;
    }

    const testCases = [
        { name: 'steep forward above', dx: 100, dy: -300, steepForward: true },
        { name: 'steep forward below', dx: 100, dy: 300, steepForward: true },
        { name: 'close steep forward above 52', dx: 52, dy: -300, steepForward: true },
        { name: 'close steep forward below 52', dx: 52, dy: 300, steepForward: true },
        { name: 'close steep forward above 60', dx: 60, dy: -300, steepForward: true },
        { name: 'close steep forward below 60', dx: 60, dy: 300, steepForward: true },
        { name: 'tall steep forward above', dx: 100, dy: -600, steepForward: true },
        { name: 'tall steep forward below', dx: 100, dy: 600, steepForward: true },
        { name: 'wide steep forward above', dx: 300, dy: -900, steepForward: true },
        { name: 'wide steep forward below', dx: 300, dy: 900, steepForward: true },
        { name: 'ordinary forward above', dx: 300, dy: -60 },
        { name: 'ordinary forward below', dx: 300, dy: 60 },
        { name: 'ordinary level forward', dx: 300, dy: 0 },
        { name: 'steep backward above', dx: -300, dy: -600 },
        { name: 'steep backward below', dx: -300, dy: 600 },
        ...[300, 520, 820].map(gap => ({ name: 'level backward ' + gap, dx: -gap, dy: 0 })),
    ];
    try {
        for (const testCase of testCases) {
            const mounted = await mountCase(testCase), { canvas, pane } = mounted;
            const result = inspect(canvas);
            const check = (condition, code) => require(condition, code, testCase.name);
            check(Math.abs(result.dx - testCase.dx) < .05 && Math.abs(result.dy - testCase.dy) < .05, 'PIN_GAP_NOT_REPRODUCED');
            require(result.pinError <= 1, 'WIRE_PIN_ANCHOR_MISMATCH', JSON.stringify({ name: testCase.name, pinError: result.pinError, anchors: result.anchors, dx: result.dx, dy: result.dy, d: result.d }));
            check(result.d === result.hitD, 'WIRE_HIT_PATH_MISMATCH');
            check(result.middleIsLine, 'MIDDLE_SPAN_NOT_A_LINE');
            check(Math.abs(result.departureLead.x - 25) < tolerance && Math.abs(result.departureLead.y) < tolerance, 'OUTPUT_LEAD_NOT_25_HORIZONTAL_PIXELS');
            check(Math.abs(result.arrivalLead.x - 25) < tolerance && Math.abs(result.arrivalLead.y) < tolerance, 'INPUT_LEAD_NOT_25_HORIZONTAL_PIXELS');
            check(result.turnRadius <= 15.001, 'ENDPOINT_TURN_TOO_LARGE');
            check(result.labelDistance <= 1, 'WIRE_LABEL_OFF_PATH');
            if (testCase.steepForward) {
                check(result.minNativeStepX >= -.0001, 'FORWARD_ROUTE_REVERSES_X');
                for (const turn of result.turns) {
                    check(turn.minDerivativeX >= -tolerance && turn.minNativeStepX >= -.0001, 'FORWARD_ENDPOINT_HOOK');
                    check(turn.tangentOvershoot < .0001, 'FORWARD_TANGENT_OVERSHOOT');
                    check(turn.tangentReversal < .0001 && turn.minSignedCurvature >= -.0001, 'FORWARD_CURVATURE_INFLECTION');
                }
            }
            if (testCase.dx < 0 && testCase.dy === 0) check(result.verticalDeviation <= 12.001, 'LEVEL_BACKWARD_RETURN_TOO_DEEP');
            const path = canvas.svg.querySelector('.pc-wire[data-id="route"]');
            const node = canvas.nodeLayer.querySelector('.pc-node-native');
            for (const zoom of [.4, .73, 1.2]) {
                const rect = canvas.host.getBoundingClientRect();
                canvas.zoomBy(zoom / canvas.view.zoom, rect.left + rect.width / 2, rect.top + rect.height / 2);
                // The public camera finishes its gesture after 180ms even with
                // reduced motion. Wait for that cleanup before measuring pins.
                await new Promise(resolve => setTimeout(resolve, 200));
                await settle();
                check(!canvas.wheelRect && !canvas.host.classList.contains('pc-interacting'), 'PUBLIC_CAMERA_ZOOM_NOT_SETTLED');
                const zoomed = inspect(canvas);
                check(Math.abs(canvas.view.zoom - zoom) < .001, 'PUBLIC_CAMERA_ZOOM_NOT_APPLIED');
                check(path === canvas.svg.querySelector('.pc-wire[data-id="route"]') && node === canvas.nodeLayer.querySelector('.pc-node-native'), 'CAMERA_REBUILT_RENDERED_GEOMETRY');
                require(zoomed.d === result.d && zoomed.pinError <= 1, 'ZOOM_CHANGED_GRAPH_ROUTE_OR_PIN_ANCHOR', JSON.stringify({ name: testCase.name, zoom, pinError: zoomed.pinError, anchors: zoomed.anchors, before: result.d, after: zoomed.d }));
            }
            outcomes.push({ name: testCase.name, gap: { x: testCase.dx, y: testCase.dy }, pinError: Number(result.pinError.toFixed(4)), directMiddle: true, leads: 25, hitMatches: true, zoomInvariant: true, ...(testCase.steepForward ? { noHooks: true, noTangentOvershoot: true, noCurvatureInflection: true } : {}) });
            await canvas.destroy();
            pane.remove();
            canvases.splice(canvases.indexOf(mounted), 1);
        }
        for (const testCase of testCases.slice(0, 2)) {
            const { canvas } = await mountCase(testCase, true);
            canvas.fit({ avoidShelf: false });
            await settle();
            require(inspect(canvas).pinError <= 1, 'SCREENSHOT_PIN_ANCHOR_MISMATCH');
        }
        status.textContent = `${outcomes.length} layouts passed · native SVG + cubic geometry · zoom invariant · zero provider requests`;
        require(contextSnapshot() === originalHostState, 'HOST_SETTINGS_CHAT_OR_METADATA_CHANGED');
        window.__latticeConnectionHostCleanup = async () => {
            for (const { canvas } of canvases) await canvas.destroy();
            overlay.close();
            overlay.remove();
            delete window.__latticeConnectionHostCleanup;
        };
        return { version, installedCanvasModule: moduleURL('src/canvas.js'), fixtures: outcomes, screenshotFixtures: testCases.slice(0, 2).map(testCase => testCase.name), cameraZooms: [.4, .73, 1.2], hostStateUnchanged: true, detachedAuthoringPreserved: true };
    } catch (error) {
        for (const { canvas } of canvases) await canvas.destroy();
        overlay.close();
        overlay.remove();
        throw error;
    }
}

/** All host writes except explicit local login and all provider traffic are blocked. */
export async function runInstalledConnectionHostCheck({ host = 'http://127.0.0.1:8000', extensionBase = DEFAULT_EXTENSION, screenshot = DEFAULT_SCREENSHOT } = {}) {
    if (!/^\/scripts\/extensions\/third-party\/[A-Za-z0-9_-]+$/.test(extensionBase)) throw Error('Use an installed third-party extension path.');
    const boundary = createInstalledHostBoundary(host);
    const { chromium } = await import('@playwright/test');
    let browser, context, page, stage = 'browser', providerAttempts = 0;
    try {
        browser = await chromium.launch({ headless: true });
        context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
        await context.route('**/*', async route => {
            const request = route.request(), url = new URL(request.url());
            if (/^\/api\/(?:backends\/[^/]+\/)?(?:generate|completions|chat\/completions)\b/i.test(url.pathname)
                || /^\/api\/(?:openai|novelai|kobold|textgenerationwebui)\b/i.test(url.pathname)) providerAttempts++;
            if (boundary.allow(request.url(), request.method())) await route.continue();
            else await route.abort();
        });
        await context.routeWebSocket('**/*', async socket => { boundary.allow(socket.url(), 'WEBSOCKET'); await socket.close(); });
        stage = 'login';
        const csrfResponse = await context.request.get(new URL('/csrf-token', host).href);
        if (!csrfResponse.ok()) throw Error('LOCAL_CSRF_UNAVAILABLE');
        const csrf = await csrfResponse.json();
        const login = await context.request.post(new URL('/api/users/login', host).href, { headers: { 'x-csrf-token': csrf.token }, data: { handle: 'default-user', password: '' } });
        if (!login.ok()) throw Error('LOCAL_DEFAULT_USER_LOGIN_UNAVAILABLE');
        page = await context.newPage();
        stage = 'host readiness';
        await page.goto(host, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof window.SillyTavern?.getContext === 'function', {}, { timeout: 60000 });
        await page.waitForFunction(async () => (await import('/scripts/user.js')).getCurrentUserHandle?.() === 'default-user', {}, { timeout: 30000 });
        // Host getContext is available before extension boot finishes. Lattice
        // publishes this API after applying its installed theme; only observe it.
        await page.waitForFunction(() => typeof window.lattice?.open === 'function', {}, { timeout: 30000 });
        stage = 'installed manifest';
        const version = await page.evaluate(async base => {
            const response = await fetch(base + '/manifest.json');
            if (!response.ok) throw Error('INSTALLED_MANIFEST_UNAVAILABLE');
            const manifest = await response.json();
            if (typeof manifest.version !== 'string' || !/^\d+(?:\.\d+){1,3}$/.test(manifest.version)) throw Error('INSTALLED_VERSION_UNAVAILABLE');
            return manifest.version;
        }, extensionBase);
        await page.addStyleTag({ url: `${extensionBase}/style.css?v=${version}` });
        stage = 'connection fixtures';
        const result = await page.evaluate(inspectInstalledConnections, { extensionBase, version });
        if (providerAttempts !== 0) throw Error('PROVIDER_REQUEST_ATTEMPTED');
        stage = 'screenshot';
        const screenshotPath = resolve(screenshot);
        await mkdir(dirname(screenshotPath), { recursive: true });
        await page.locator('#lattice-connection-host-test').screenshot({ path: screenshotPath });
        await page.evaluate(async () => window.__latticeConnectionHostCleanup?.());
        if (providerAttempts !== 0) throw Error('PROVIDER_REQUEST_ATTEMPTED');
        return { ok: true, host, ...result, actualProviderRequests: 0, providerAttempts, hostPersistenceWrites: 0, authenticatedLoginWrites: 1, screenshot: screenshotPath, boundary: boundary.counts() };
    } catch (error) {
        throw Error(`Installed connection check failed at ${stage}: ${error.message}`, { cause: error });
    } finally {
        try { await page?.evaluate(async () => window.__latticeConnectionHostCleanup?.()).catch(() => {}); }
        finally { try { await context?.close(); } finally { await browser?.close(); } }
    }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--host' && args[i + 1]) options.host = args[++i];
        else if (args[i] === '--extension-base' && args[i + 1]) options.extensionBase = args[++i];
        else if (args[i] === '--screenshot' && args[i + 1]) options.screenshot = args[++i];
        else throw Error('Use --host LOOPBACK, --extension-base /scripts/extensions/third-party/NAME, and --screenshot PATH.');
    }
    try { console.log(JSON.stringify(await runInstalledConnectionHostCheck(options), null, 2)); }
    catch (error) { console.error(JSON.stringify({ ok: false, error: error.message })); process.exitCode = 1; }
}
