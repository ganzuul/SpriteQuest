// Native adapter: the compiled view imports no state, compiler or run modules.
import { mountWorkbench } from '../../dist/silly-canvas-ui.js?v=0.18.0';
export function createWorkbench(actions) {
    const view = mountWorkbench(document.body, actions);
    view.root._parts = view.parts;
    return view;
}
