import { mount, unmount, flushSync } from 'svelte';
import CanvasLayer from './CanvasLayer.svelte';
import Workbench from './Workbench.svelte';
export function mountCanvas(target, actions) {
    const component = mount(CanvasLayer, { target, props: { actions } });
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
    return { ...component.getParts(), update: view => flushSync(() => component.update(view)), updateActions: actions => flushSync(() => component.updateActions(actions)), revealPreview: () => flushSync(() => component.revealPreview()), revealWorkflowSetup: () => flushSync(() => component.revealWorkflowSetup()), destroy: () => unmount(component) };
}
