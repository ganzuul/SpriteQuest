import { mount, unmount, flushSync } from 'svelte';
import CanvasLayer from './CanvasLayer.svelte';
import Workbench from './Workbench.svelte';
import NodeCard from './NodeCard.svelte';
/** Measure the real card in the canvas cascade before committing its position. */
export function measureNodeCard(target, card) {
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none';
    host.setAttribute('aria-hidden', 'true'); host.inert = true; target.append(host);
    let component;
    try {
        component = mount(NodeCard, { target: host, props: { card, actions: { hoverPin() {}, hostResult() {} } } });
        flushSync();
        const { width, height } = host.querySelector('.pc-node').getBoundingClientRect();
        return { width, height };
    } finally {
        if (component) unmount(component);
        host.remove();
    }
}
export function mountCanvas(target, actions) {
    const component = mount(CanvasLayer, { target, props: { actions } });
    flushSync();
    return {
        ...component.getLayers(),
        setComments: (comments, actions) => flushSync(() => component.setComments(comments, actions)),
        setNodes: nodes => flushSync(() => component.setNodes(nodes)),
        setGroups: groups => flushSync(() => component.setGroups(groups)),
        setWires: (wires, bounds, ghost) => flushSync(() => component.setWires(wires, bounds, ghost)),
        setPositions: (nodes, groups) => flushSync(() => component.setPositions(nodes, groups)),
        destroy: () => unmount(component),
    };
}
export function mountWorkbench(target, actions) {
    const component = mount(Workbench, { target, props: { actions } }); flushSync();
    return { ...component.getParts(), update: view => flushSync(() => component.update(view)), updateActions: actions => flushSync(() => component.updateActions(actions)), revealPreview: () => flushSync(() => component.revealPreview()), revealWorkflowSetup: () => flushSync(() => component.revealWorkflowSetup()), focusCommentTitle: (id, isCurrent) => component.focusCommentTitle(id, isCurrent), destroy: () => unmount(component) };
}
