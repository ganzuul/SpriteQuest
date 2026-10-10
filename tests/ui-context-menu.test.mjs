import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const renderer = await import('../src/ui/context-menu.js').catch(error => {
    if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
    return {};
});

function fixture() {
    const dom = new JSDOM('<!doctype html><body><button id="origin">Canvas</button><main></main><button id="outside">Outside</button></body>', { pretendToBeVisual: true });
    const document = dom.window.document, root = document.querySelector('main'), origin = document.querySelector('#origin'), outside = document.querySelector('#outside');
    origin.focus();
    const show = options => {
        assert.equal(typeof renderer.showContextMenu, 'function', 'The context menu renderer must be implemented');
        return renderer.showContextMenu({ root, x: 100, y: 80, ...options });
    };
    const key = (element, value) => {
        const event = new dom.window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
        return event;
    };
    const click = element => element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
    const pointer = element => element.dispatchEvent(new dom.window.MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    return { dom, document, root, origin, outside, show, key, click, pointer, item: label => root.querySelector(`[aria-label="${label}"][role^="menuitem"]`), close: () => dom.window.close() };
}

// Removing disabled filtering, focus ownership, or action dispatch breaks this contract.
test('keyboard navigation skips disabled items and dispatches the focused command once', () => {
    const f = fixture(), commands = [], workspaceKeys = [];
    f.root.addEventListener('keydown', event => workspaceKeys.push(event.key));
    try {
        f.show({ items: [
            { label: 'Unavailable', disabled: true, action: () => commands.push('unavailable') },
            { label: 'Copy', icon: 'copy', shortcut: 'Ctrl+C', action: () => commands.push('copy') },
            { separator: true },
            { label: 'Locked', disabled: true, action: () => commands.push('locked') },
            { label: 'Delete', icon: 'delete', action: () => commands.push('delete') },
        ] });
        assert.equal(f.document.activeElement, f.item('Copy'));
        assert.equal(f.key(f.item('Copy'), 'ArrowDown').defaultPrevented, true);
        assert.equal(f.document.activeElement, f.item('Delete'));
        f.key(f.item('Delete'), 'ArrowDown'); assert.equal(f.document.activeElement, f.item('Copy'));
        f.key(f.item('Copy'), 'End'); assert.equal(f.document.activeElement, f.item('Delete'));
        f.key(f.item('Delete'), 'Home'); assert.equal(f.document.activeElement, f.item('Copy'));
        f.key(f.item('Copy'), 'ArrowUp'); assert.equal(f.document.activeElement, f.item('Delete'));
        f.key(f.item('Delete'), 'Enter');
        assert.deepEqual(commands, ['delete']);
        assert.deepEqual(workspaceKeys, []);
        assert.equal(f.root.querySelector('[role="menu"]'), null);
        assert.notEqual(f.document.activeElement, f.origin, 'Choosing an action must leave focus to the action');
    } finally { f.close(); }
});

// Escape must return focus to its invoking surface; other dismissals must not steal it.
test('Escape dismisses the menu and restores captured or supplied focus', () => {
    const f = fixture();
    try {
        f.show({ items: [{ label: 'Copy' }] });
        f.key(f.item('Copy'), 'Escape');
        assert.equal(f.root.querySelector('[role="menu"]'), null);
        assert.equal(f.document.activeElement, f.origin);
        f.show({ items: [{ label: 'Copy' }], restoreFocus: () => f.outside.focus() });
        f.key(f.item('Copy'), 'Escape');
        assert.equal(f.document.activeElement, f.outside);
    } finally { f.close(); }
});

// A leaked replacement listener would remove the new menu or restore obsolete focus.
test('outside dismissal and replacement clean up the old menu lifecycle', () => {
    const f = fixture(), commands = [];
    try {
        const firstDismiss = f.show({ items: [{ label: 'Old', action: () => commands.push('old') }], restoreFocus: () => assert.fail('Outside dismissal must not restore focus') });
        const oldButton = f.item('Old');
        const secondDismiss = f.show({ label: 'New actions', items: [{ label: 'New', action: () => commands.push('new') }] });
        assert.equal(f.root.querySelectorAll('[role="menu"]').length, 1);
        assert.equal(f.root.querySelector('[role="menu"]').getAttribute('aria-label'), 'New actions');
        firstDismiss(); f.click(oldButton);
        assert.deepEqual(commands, []);
        assert.equal(f.document.activeElement, f.item('New'));
        f.pointer(f.item('New')); assert.ok(f.root.querySelector('[role="menu"]'));
        f.outside.focus(); f.pointer(f.outside);
        assert.equal(f.root.querySelector('[role="menu"]'), null);
        assert.equal(f.document.activeElement, f.outside);
        secondDismiss(); secondDismiss();
        f.show({ items: [{ label: 'Fresh' }] });
        f.key(f.item('Fresh'), 'Escape');
        assert.equal(f.document.activeElement, f.outside);
    } finally { f.close(); }
});

// Removing the dispatch-time guard would execute an action for obsolete selection state.
test('stale and disabled commands cannot dispatch through keyboard or raw clicks', () => {
    const f = fixture(), commands = [];
    let current = true;
    try {
        f.show({ isCurrent: () => current, items: [
            { label: 'Copy', action: () => commands.push('copy') },
            { label: 'Disabled', disabled: true, action: () => commands.push('disabled') },
        ] });
        f.click(f.item('Disabled')); assert.deepEqual(commands, []);
        const staleButton = f.item('Copy'); current = false;
        f.key(staleButton, 'Enter'); f.click(staleButton);
        assert.deepEqual(commands, []);
        assert.equal(f.root.querySelector('[role="menu"]'), null, 'Stale menus are dismissed when used');
    } finally { f.close(); }
});

// Preventing Tab would trap keyboard focus; failing to dismiss would leave a stale popup.
test('Tab dismisses the menu without preventing natural focus navigation', () => {
    const f = fixture();
    try {
        f.show({ items: [{ label: 'Copy' }] });
        assert.equal(f.key(f.item('Copy'), 'Tab').defaultPrevented, false);
        assert.equal(f.root.querySelector('[role="menu"]'), null);
        assert.notEqual(f.document.activeElement, f.origin);
    } finally { f.close(); }
});

// Menus should scroll internally, but canvas movement invalidates their viewport anchor.
test('resize and outside scroll dismiss menus while menu scrolling keeps them open', () => {
    const f = fixture();
    try {
        f.show({ items: [{ label: 'Copy' }] });
        f.root.querySelector('[role="menu"]').dispatchEvent(new f.dom.window.Event('scroll'));
        assert.ok(f.root.querySelector('[role="menu"]'));
        f.root.dispatchEvent(new f.dom.window.Event('scroll'));
        assert.equal(f.root.querySelector('[role="menu"]'), null);
        f.show({ items: [{ label: 'Copy' }] });
        f.dom.window.dispatchEvent(new f.dom.window.Event('resize'));
        assert.equal(f.root.querySelector('[role="menu"]'), null);
    } finally { f.close(); }
});

// Missing submenu focus ownership, a stale detached handler, or dispatching the parent breaks this flow.
test('Right opens a submenu, Left restores the parent, and Space selects an enabled child', () => {
    const f = fixture(), commands = [];
    try {
        f.show({ items: [
            { label: 'Pin output', icon: 'pin', action: () => assert.fail('A submenu parent cannot dispatch'), children: [
                { label: 'Unavailable output', disabled: true },
                { label: 'Primary output', action: () => commands.push('primary') },
                { label: 'Second output', action: () => commands.push('second') },
            ] },
            { label: 'Copy', action: () => commands.push('copy') },
        ] });
        const parent = f.item('Pin output');
        assert.equal(parent.getAttribute('aria-haspopup'), 'menu');
        assert.equal(parent.getAttribute('aria-expanded'), 'false');
        f.key(parent, 'ArrowRight');
        assert.equal(f.root.querySelectorAll('[role="menu"]').length, 2);
        assert.equal(parent.getAttribute('aria-expanded'), 'true');
        assert.equal(f.document.activeElement, f.item('Primary output'));
        const detached = f.item('Primary output');
        f.key(detached, 'ArrowLeft');
        assert.equal(f.root.querySelectorAll('[role="menu"]').length, 1);
        assert.equal(parent.getAttribute('aria-expanded'), 'false');
        assert.equal(f.document.activeElement, parent);
        f.click(detached); assert.deepEqual(commands, []);
        f.key(parent, 'ArrowRight');
        f.key(f.item('Primary output'), 'ArrowDown');
        assert.equal(f.document.activeElement, f.item('Second output'));
        f.key(f.item('Second output'), ' ');
        assert.deepEqual(commands, ['second']);
        assert.equal(f.root.querySelector('[role="menu"]'), null);
    } finally { f.close(); }
});

// Opening a branch for obsolete graph state is as unsafe as dispatching an obsolete action.
test('submenu opening checks current state and mouse browsing replaces sibling branches', () => {
    const f = fixture();
    let current = true;
    try {
        f.show({ isCurrent: () => current, items: [
            { label: 'Pin output', children: [{ label: 'Pinned child' }] },
            { label: 'Run output', children: [{ label: 'Run child' }] },
        ] });
        const hover = element => element.dispatchEvent(new f.dom.window.MouseEvent('pointerenter'));
        hover(f.item('Pin output'));
        assert.ok(f.item('Pinned child'));
        hover(f.item('Run output'));
        assert.equal(f.item('Pinned child'), null);
        assert.ok(f.item('Run child'));
        current = false;
        f.key(f.item('Pin output'), 'ArrowRight');
        assert.equal(f.root.querySelector('[role="menu"]'), null);
    } finally { f.close(); }
});

// An inside click/scroll in a sibling submenu must not look like an outside dismissal.
test('submenu pointer interaction stays open until its action is chosen and replacement removes all branches', () => {
    const f = fixture(), commands = [];
    try {
        f.show({ items: [{ label: 'Run output', children: [{ label: 'Text output', action: () => commands.push('text') }] }] });
        f.click(f.item('Run output'));
        const child = f.item('Text output');
        assert.ok(child, 'Clicking a submenu parent must open its child commands');
        f.pointer(child); child.parentElement.dispatchEvent(new f.dom.window.Event('scroll'));
        assert.equal(f.root.querySelectorAll('[role="menu"]').length, 2);
        f.click(child); assert.deepEqual(commands, ['text']);
        f.show({ items: [{ label: 'Run output', children: [{ label: 'Text output' }] }] });
        f.click(f.item('Run output'));
        f.show({ items: [{ label: 'Copy' }] });
        assert.equal(f.root.querySelectorAll('[role="menu"]').length, 1);
        assert.equal(f.item('Text output'), null);
    } finally { f.close(); }
});

// Accessible checkbox state and text-only labels prevent ambiguous names and markup injection.
test('checkbox rows expose their state and render safe labels, shortcuts, hints, and command metadata', () => {
    const f = fixture();
    try {
        f.show({ label: 'Node actions', items: [
            { label: 'Compact nodes', icon: 'compact', checked: true, shortcut: 'Ctrl+Shift+C', id: 'compact', tone: 'preview' },
            { label: 'Pin preview', icon: 'pin', checked: false },
            { separator: true },
            { label: '<img src=x onerror=alert(1)>', icon: 'delete', disabled: true, hint: 'This node is read only.', tone: 'danger' },
        ] });
        const compact = f.item('Compact nodes'), pin = f.item('Pin preview'), disabled = f.item('<img src=x onerror=alert(1)>');
        assert.equal(compact.getAttribute('role'), 'menuitemcheckbox');
        assert.equal(compact.getAttribute('aria-checked'), 'true');
        assert.equal(pin.getAttribute('role'), 'menuitemcheckbox');
        assert.equal(pin.getAttribute('aria-checked'), 'false');
        assert.equal(compact.dataset.command, 'compact'); assert.equal(compact.dataset.tone, 'preview');
        assert.equal(compact.querySelector('.pc-context-check').getAttribute('aria-hidden'), 'true');
        assert.equal(compact.querySelector('.pc-context-shortcut').textContent, 'Ctrl+Shift+C');
        assert.equal(compact.querySelector('.pc-context-shortcut').getAttribute('aria-hidden'), 'true');
        assert.equal(disabled.getAttribute('aria-disabled'), 'true'); assert.equal(disabled.title, 'This node is read only.');
        assert.equal(disabled.dataset.tone, 'danger');
        assert.equal(disabled.querySelector('.pc-context-label').textContent, '<img src=x onerror=alert(1)>');
        assert.equal(f.root.querySelector('img'), null);
        assert.equal(f.root.querySelectorAll('[role="separator"]').length, 1);
        assert.equal(f.root.querySelector('[role="menu"]').getAttribute('aria-label'), 'Node actions');
        const icon = compact.querySelector('svg.pc-context-icon');
        assert.ok(icon); assert.equal(icon.getAttribute('viewBox'), '0 0 24 24');
        assert.equal(icon.getAttribute('aria-hidden'), 'true'); assert.equal(icon.getAttribute('stroke'), 'currentColor');
        assert.ok(icon.querySelector('path[d]'));
    } finally { f.close(); }
});

// A missing semantic icon must not silently render an empty command gutter.
test('all supported context commands render their semantic SVG icon', () => {
    const f = fixture(), icons = ['details', 'rename', 'duplicate', 'copy', 'cut', 'paste', 'comment', 'subgraph', 'open', 'save', 'edit', 'library', 'export', 'unpack', 'group', 'ungroup', 'disconnect', 'portals', 'add', 'fit', 'compact', 'run', 'pin', 'delete'];
    try {
        f.show({ items: icons.map(icon => ({ label: icon, icon })) });
        for (const label of icons) {
            const icon = f.item(label).querySelector('svg.pc-context-icon');
            assert.ok(icon, `The ${label} command needs its icon`);
            assert.equal(icon.getAttribute('viewBox'), '0 0 24 24');
            assert.ok(icon.querySelector('path[d]'), `The ${label} icon needs drawable paths`);
        }
    } finally { f.close(); }
});

// A popup extending below/right of the viewport would make its commands unreachable.
test('main menus clamp to the viewport and submenus flip left at the right edge', () => {
    const f = fixture(), prototype = f.dom.window.HTMLElement.prototype, originalRect = prototype.getBoundingClientRect;
    Object.defineProperty(f.dom.window, 'innerWidth', { value: 400 });
    Object.defineProperty(f.dom.window, 'innerHeight', { value: 300 });
    prototype.getBoundingClientRect = function () {
        if (this.matches('.pc-context-menu')) return { left: Number.parseFloat(this.style.left) || 0, top: Number.parseFloat(this.style.top) || 0, width: 160, height: 120, right: 400, bottom: 300 };
        if (this.matches('.pc-context-item')) return { left: 240, right: 390, top: 260, bottom: 285, width: 150, height: 25 };
        return originalRect.call(this);
    };
    try {
        f.show({ x: 395, y: 295, items: [{ label: 'Pin output', children: [{ label: 'Text output' }] }] });
        const main = f.root.querySelector('[role="menu"]');
        assert.equal(main.style.left, '232px'); assert.equal(main.style.top, '172px');
        f.key(f.item('Pin output'), 'ArrowRight');
        const submenu = f.item('Text output').parentElement;
        assert.equal(submenu.style.left, '80px'); assert.equal(submenu.style.top, '172px');
    } finally { prototype.getBoundingClientRect = originalRect; f.close(); }
});
