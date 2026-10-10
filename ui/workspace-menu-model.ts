import type { WorkbenchView } from './types';
export interface WorkspaceMenuPanels { previewOpen: boolean; shelfOpen: boolean }
export interface WorkspaceMenuItem { label: string; command: string; icon?: string; shortcut?: string; disabled?: boolean; kind?: 'check' | 'radio'; checked?: boolean; children?: WorkspaceMenuItem[]; tone?: 'danger' }
export interface WorkspaceMenu { name: string; groups: WorkspaceMenuItem[][] }
const row = (label: string, command: string, icon = '', disabled = false, shortcut = ''): WorkspaceMenuItem => ({ label, command, icon, disabled, shortcut });
const check = (label: string, command: string, checked: boolean, disabled = false, kind: 'check' | 'radio' = 'check'): WorkspaceMenuItem => ({ label, command, checked, disabled, kind });
export function workspaceMenus(view: WorkbenchView, panels: WorkspaceMenuPanels = {previewOpen:true,shelfOpen:true}): WorkspaceMenu[] {
 const c: Partial<NonNullable<WorkbenchView["menuCapabilities"]>> = view.menuCapabilities ?? {}; const root = view.rootWorkflow ?? view.workflow, preview = view.outputPreview;
 const readOnly = !!view.readOnly, busy = !!root?.ownedBusy;
 const assignment = !!root && ['unified','pre','post'].includes(root.phase);
 const assignmentLabel = root?.phase === 'unified' ? 'Assign workflow' : `Assign legacy ${root?.phase ?? ''} phase`;
 return [
 {name:'File',groups:[
  [row('New workflow','new','add'),row('Open workflow…','open-workflow','open'),row('Examples…','examples','library')],
  [row('Save to workspace','save','save',!root),row('Duplicate workflow','duplicate','duplicate',!root),row('Rename workflow…','rename','rename',!root)],
  [row('Import into current graph…','import-into-graph','open',readOnly),row('Export portable workflow…','export','export',!root)],
  [{...row('Delete workflow…','delete','delete',!root),tone:'danger'},row('Close workspace','close','close')]
 ]},
 {name:'Edit',groups:[
  [row('Undo','undo','undo',!view.history.undo,'Ctrl Z'),row('Redo','redo','redo',!view.history.redo,'Ctrl Shift Z')],
  [row('Cut','cut','cut',!view.selectionActions?.cut,'Ctrl X'),row('Copy','copy','copy',!view.selectionActions?.copy,'Ctrl C'),row('Paste','paste','paste',readOnly,'Ctrl V'),row('Duplicate selection','duplicate-selection','duplicate',!c.duplicate,'Ctrl D'),{...row('Delete selection','delete-selection','delete',!view.selectionActions?.delete,'Del'),tone:'danger'}],
  [row('Select all','select-all','select',false,'Ctrl A'),row('Clear selection','clear-selection','clear',!c.hasSelection)]
 ]},
 {name:'View',groups:[
  [check('Show Details','inspector',!!view.inspectorOpen),check('Show preview','toggle-preview',panels.previewOpen),check('Show node shelf','toggle-shelf',panels.shelfOpen)],
  [check('Follow selection','follow-preview',preview?.followSelection ?? true,!preview,'radio'),check('Pin current output','pin-preview',!!preview?.pinned,!preview?.selectedKey || preview?.status === 'removed','radio')],
  [row('Fit graph','fit','fit'),row('Fit selection','fit-selection','fit',!c.fitSelection,'.'),row('Center selection','center-selection','fit',!c.hasSelection,'F'),row('Zoom in','zoom-in','add'),row('Zoom out','zoom-out','minus')],
  [row('Reset panel layout','reset-layout','reset'),row('Theme and colours…','theme','theme')]
 ]},
 {name:'Graph',groups:[
  [row('Add node…','add-node','add',readOnly),row('Details for selection','details-selection','details',!c.inspect),row('Rename selection…','rename-selection','rename',!c.rename,'F2')],
  [row('Group selection','group-selection','group',!c.group,'Ctrl G'),row('Ungroup selection','ungroup-selection','ungroup',!c.ungroup,'Ctrl Shift G'),row('Create subgraph','create-subgraph','subgraph',!c.createSubgraph),row('Save subgraph…','save-subgraph','save',!c.saveSubgraph)],
  [row('Comment selection','comment-selection','comment',!c.comment,'C'),row('Add comment','add-comment','comment',readOnly),row('Manage portals…','manage-portals','portals')],
  [check('Select tool','select-tool',view.camera?.mode !== 'pan',false,'radio'),check('Pan tool','pan-tool',view.camera?.mode === 'pan',false,'radio'),check('Compact cards','compact-selection',!!c.compactChecked,!c.compact)]
 ]},
 {name:'Workflow',groups:[
  [row(assignmentLabel,'assign-workflow-phase','assign',!assignment || !!root?.assigned || busy),row('Clear assignment','clear-workflow-assignment','clear',!assignment || !root?.assigned || busy),check('Arm workflow','arm-workflow',!!view.armed,!root)],
  [row('Validate workflow','validate-workflow','check',!root),row('Review host result','review-host-result','details',!root?.nodes?.some(node=>node.terminal)),row('Stop workflow','stop-workflow','stop',!c.stop)],
  [row('Run to current output','run-preview','run',!preview?.runHere?.enabled || !!preview?.busy || busy),row('Run details…','run-details','details',!view.runDetails)],
  [{label:'Configure',command:'configure',icon:'details',children:[row('Workflow Data…','story-documents','library'),row('Fast connections…','fast-connections','connect'),row('Recall arms…','recall-arms','arm')]}]
 ]},
 {name:'Help',groups:[[row('Workspace guide','help','help'),row('Node reference','node-reference','library'),row('Keyboard shortcuts','shortcuts','keyboard')],[row('About Lattice','about','info')]]}
 ];
}
export const localMenuCommands = new Set(['toggle-preview','toggle-shelf','reset-layout','follow-preview','pin-preview','run-preview','run-details','validate-workflow','help','node-reference','shortcuts','about','examples','add-node','fast-connections','story-documents','recall-arms']);
