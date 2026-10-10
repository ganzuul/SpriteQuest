const workflowKeys = { 'native-unified': 'workflowGraphId', 'native-pre': 'preGraphId', 'native-post': 'postGraphId' };
export const workflowBindingKey = mode => Object.hasOwn(workflowKeys, mode) ? workflowKeys[mode] : null;
export const workflowCreationPhase = (phase = 'unified') => ['unified', 'pre', 'post'].includes(phase) ? phase : null;
