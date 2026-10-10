const activeMenus = new WeakMap();
let nextMenuId = 0;

const iconPaths = {
    details: 'M10 5H3 M12 19H3 M14 3v4 M16 17v4 M21 12h-9 M21 19h-5 M21 5h-7 M8 10v4 M8 12H3',
    rename: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z M15 5l4 4',
    duplicate: 'M13 13.74a2 2 0 0 1-2 0L2.5 8.87a1 1 0 0 1 0-1.74L11 2.26a2 2 0 0 1 2 0l8.5 4.87a1 1 0 0 1 0 1.74z M20 14.285l1.5.845a1 1 0 0 1 0 1.74L13 21.74a2 2 0 0 1-2 0l-8.5-4.87a1 1 0 0 1 0-1.74l1.5-.845',
    copy: 'M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2',
    cut: 'M9 6a3 3 0 1 1-6 0a3 3 0 1 1 6 0z M8.12 8.12 12 12 M20 4 8.12 15.88 M9 18a3 3 0 1 1-6 0a3 3 0 1 1 6 0z M14.8 14.8 20 20',
    paste: 'M9 4H5v17h14V4h-4 M9 2h6v5H9z M8 12h8 M8 16h5',
    comment: 'M22 6H2 M22 18H2 M6 2v20 M18 2v20',
    subgraph: 'M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z M7 16.5l-4.74-2.85 M7 16.5l5-3 M7 16.5v5.17 M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z M17 16.5l-5-3 M17 16.5l4.74-2.85 M17 16.5v5.17 M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z M12 8 7.26 5.15 M12 8l4.74-2.85 M12 13.5V8',
    open: 'M3 7h7l2 3h9l-3 10H3V7z M3 7V4h7l2 3h7v3',
    save: 'M4 3h13l3 3v15H4V3z M8 3v6h8V3 M8 21v-8h8v8',
    edit: 'M4 17v3h3L20 7l-3-3L4 17z M14 7l3 3',
    library: 'M3 4h4v16H3z M10 4h4v16h-4z M16 5l4-1 3 15-4 1-3-15z',
    export: 'M12 15V3 M8 7l4-4 4 4 M4 12v8h16v-8',
    unpack: 'M12 3l9 5-9 5-9-5 9-5z M3 8v9l9 5 9-5V8 M12 13v9 M8 3L4 1 M16 3l4-2',
    group: 'M3 3h18v18H3z M7 7h4v4H7z M13 13h4v4h-4z',
    ungroup: 'M3 8V3h5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5 M7 7h4v4H7z M13 13h4v4h-4z',
    disconnect: 'M9 15l6-6 M7 7L3 3 M17 17l4 4 M8 4h6a5 5 0 0 1 5 5v3 M16 20h-6a5 5 0 0 1-5-5v-3',
    portals: 'M8 3a5 9 0 1 0 0 18 5 9 0 0 0 0-18z M16 3a5 9 0 1 0 0 18 5 9 0 0 0 0-18z M8 12h8 M13 9l3 3-3 3',
    add: 'M12 4v16 M4 12h16',
    fit: 'M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0z M3 7V5a2 2 0 0 1 2-2h2 M17 3h2a2 2 0 0 1 2 2v2 M21 17v2a2 2 0 0 1-2 2h-2 M7 21H5a2 2 0 0 1-2-2v-2',
    compact: 'M14 10l7-7 M20 10h-6V4 M3 21l7-7 M4 14h6v6',
    run: 'M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z',
    pin: 'M12 17v5 M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z',
    delete: 'M10 11v6 M14 11v6 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M3 6h18 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
};

function svgIcon(document, path, className) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('d', path);
    svg.append(shape);
    return svg;
}

/** Render a context menu and return its idempotent dismissal function. */
export function showContextMenu({ root, x, y, label = 'Context actions', items = [], isCurrent = () => true, restoreFocus }) {
    activeMenus.get(root)?.();
    const document = root.ownerDocument, view = document.defaultView, previousFocus = document.activeElement;
    const menus = [];
    let dismissed = false;
    const listen = (state, target, type, handler, options) => {
        target.addEventListener(type, handler, options);
        state.cleanup.push(() => target.removeEventListener(type, handler, options));
    };
    const closeAfter = index => {
        while (menus.length > index + 1) {
            const state = menus.pop();
            for (const cleanup of state.cleanup) cleanup();
            state.element.remove();
            state.parent?.button.setAttribute('aria-expanded', 'false');
            state.parent?.button.removeAttribute('aria-controls');
        }
    };
    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        closeAfter(-1);
        document.removeEventListener('pointerdown', outsidePointer, true);
        view.removeEventListener('resize', dismiss);
        view.removeEventListener('scroll', outsideScroll, true);
        if (activeMenus.get(root) === dismiss) activeMenus.delete(root);
    };
    const inside = target => target?.nodeType && menus.some(state => state.element.contains(target));
    const outsidePointer = event => { if (!inside(event.target)) dismiss(); };
    const outsideScroll = event => { if (!inside(event.target)) dismiss(); };
    const live = entry => !dismissed && entry && menus.includes(entry.menu) && !entry.item.disabled;
    const current = () => { if (isCurrent()) return true; dismiss(); return false; };
    const focusFirst = state => (state.entries.find(entry => !entry.item.disabled)?.button ?? state.element).focus();
    const position = (state, left, top, anchor) => {
        const width = view.innerWidth || document.documentElement.clientWidth;
        const height = view.innerHeight || document.documentElement.clientHeight;
        const rect = state.element.getBoundingClientRect();
        if (anchor && left + rect.width > width - 8) left = anchor.left - rect.width;
        state.element.style.left = Math.max(8, Math.min(left, width - rect.width - 8)) + 'px';
        state.element.style.top = Math.max(8, Math.min(top, height - rect.height - 8)) + 'px';
    };
    const openChildren = (entry, focus) => {
        if (!live(entry) || !entry.item.children?.length || !current()) return;
        const index = menus.indexOf(entry.menu), existing = menus[index + 1];
        if (existing?.parent === entry) { if (focus) focusFirst(existing); return; }
        closeAfter(index);
        const state = render(entry.item.children, entry.item.label + ' options', entry);
        entry.button.setAttribute('aria-expanded', 'true');
        entry.button.setAttribute('aria-controls', state.element.id);
        const anchor = entry.button.getBoundingClientRect();
        position(state, anchor.right, anchor.top, anchor);
        if (focus) focusFirst(state);
    };
    const choose = entry => {
        if (!live(entry) || !current()) return;
        if (entry.item.children?.length) { openChildren(entry, true); return; }
        dismiss();
        entry.item.action?.();
    };
    const keydown = (state, event) => {
        event.stopPropagation();
        if (event.key === 'Tab') { dismiss(); return; }
        if (event.key === 'Escape') {
            event.preventDefault();
            dismiss();
            if (restoreFocus) restoreFocus();
            else if (previousFocus?.isConnected) previousFocus.focus?.();
            return;
        }
        const enabled = state.entries.filter(entry => !entry.item.disabled);
        const selected = state.entries.find(entry => entry.button === document.activeElement);
        const index = enabled.indexOf(selected);
        let next;
        if (event.key === 'ArrowDown') next = enabled[(index + 1) % enabled.length];
        else if (event.key === 'ArrowUp') next = enabled[(index - 1 + enabled.length) % enabled.length];
        else if (event.key === 'Home') next = enabled[0];
        else if (event.key === 'End') next = enabled.at(-1);
        else if (event.key === 'ArrowRight') openChildren(selected, true);
        else if (event.key === 'ArrowLeft') {
            if (state.parent) { closeAfter(menus.indexOf(state) - 1); state.parent.button.focus(); }
        } else if (event.key === 'Enter' || event.key === ' ') choose(selected);
        else return;
        event.preventDefault();
        if (next) { closeAfter(menus.indexOf(state)); next.button.focus(); }
    };
    const render = (descriptors, menuLabel, parent) => {
        const element = document.createElement('div');
        element.className = 'pc-context-menu' + (parent ? ' pc-context-submenu' : '');
        element.id = 'pc-context-menu-' + ++nextMenuId;
        element.setAttribute('role', 'menu');
        element.setAttribute('aria-label', menuLabel);
        element.tabIndex = -1;
        const state = { element, parent, entries: [], cleanup: [] };
        menus.push(state);
        for (const item of descriptors) {
            if (item.separator) {
                const divider = document.createElement('div');
                divider.className = 'pc-context-separator';
                divider.setAttribute('role', 'separator');
                element.append(divider);
                continue;
            }
            const button = document.createElement('button'), checked = typeof item.checked === 'boolean';
            button.type = 'button';
            button.className = 'pc-context-item';
            button.setAttribute('role', checked ? 'menuitemcheckbox' : 'menuitem');
            button.setAttribute('aria-label', item.label);
            button.setAttribute('aria-disabled', String(!!item.disabled));
            button.tabIndex = -1;
            button.disabled = !!item.disabled;
            if (checked) button.setAttribute('aria-checked', String(item.checked));
            if (item.id) button.dataset.command = item.id;
            if (item.tone) button.dataset.tone = item.tone;
            if (item.hint) button.title = item.hint;
            if (iconPaths[item.icon]) button.append(svgIcon(document, iconPaths[item.icon], 'pc-context-icon'));
            else {
                const gutter = document.createElement('span');
                gutter.className = 'pc-context-icon';
                gutter.setAttribute('aria-hidden', 'true');
                button.append(gutter);
            }
            const text = document.createElement('span');
            text.className = 'pc-context-label';
            text.textContent = item.label;
            button.append(text);
            const trailing = document.createElement('span');
            trailing.className = 'pc-context-trailing';
            if (item.shortcut) {
                const shortcut = document.createElement('kbd');
                shortcut.className = 'pc-context-shortcut';
                shortcut.setAttribute('aria-hidden', 'true');
                shortcut.textContent = item.shortcut;
                trailing.append(shortcut);
            }
            if (checked) {
                const check = document.createElement('span');
                check.className = 'pc-context-check';
                check.setAttribute('aria-hidden', 'true');
                check.textContent = item.checked ? '✓' : '';
                trailing.append(check);
            }
            if (item.children?.length) {
                button.setAttribute('aria-haspopup', 'menu');
                button.setAttribute('aria-expanded', 'false');
                trailing.append(svgIcon(document, 'M9 5l7 7-7 7', 'pc-context-chevron'));
            }
            if (trailing.children.length) button.append(trailing);
            const entry = { button, item, menu: state };
            state.entries.push(entry);
            listen(state, button, 'click', event => { event.stopPropagation(); choose(entry); });
            listen(state, button, 'pointerenter', () => {
                if (!live(entry)) return;
                if (entry.item.children?.length) openChildren(entry, false);
                else closeAfter(menus.indexOf(state));
            });
            element.append(button);
        }
        listen(state, element, 'keydown', event => keydown(state, event));
        listen(state, element, 'keyup', event => event.stopPropagation());
        listen(state, element, 'pointerdown', event => event.stopPropagation());
        root.append(element);
        return state;
    };
    const main = render(items, label);
    position(main, x, y);
    document.addEventListener('pointerdown', outsidePointer, true);
    view.addEventListener('resize', dismiss);
    view.addEventListener('scroll', outsideScroll, true);
    activeMenus.set(root, dismiss);
    focusFirst(main);
    return dismiss;
}
