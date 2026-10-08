import WorkflowSurface from './WorkflowSurface.svelte';
import { mount, unmount, flushSync } from 'svelte';
import CanvasLayer from './CanvasLayer.svelte';
import Workbench from './Workbench.svelte';
let nextId = 0;
export function mountCanvas(target, actions) {
    const component = mount(CanvasLayer, { target, props: { actions, markerId: `pc-loop-arrow-${++nextId}` } });
    flushSync();
    return {
        ...component.getLayers(),
        setNodes: nodes => flushSync(() => component.setNodes(nodes)),
        setGroups: groups => flushSync(() => component.setGroups(groups)),
        setWires: (wires, bounds, ghost) => flushSync(() => component.setWires(wires, bounds, ghost)),
        setPositions: (nodes, groups) => flushSync(() => component.setPositions(nodes, groups)),
        destroy: () => unmount(component),
    };
}
export function mountWorkbench(target, actions) {
    const component = mount(Workbench, { target, props: { actions } }); flushSync();
    return { ...component.getParts(), update: view => flushSync(() => component.update(view)), revealPreview: () => flushSync(() => component.revealPreview()), destroy: () => unmount(component) };
}


export function mountWorkflowSurface(target, actions, mode = 'setup') {
    const component = mount(WorkflowSurface, { target, props: { actions, mode } }); flushSync();
    return { update: view => flushSync(() => component.update(view)), destroy: () => unmount(component) };
}
