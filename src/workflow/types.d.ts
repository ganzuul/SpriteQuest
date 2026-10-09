/** Plain boundary DTOs: never carry host adapters, authenticated bindings or authority. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: WorkflowError };
export interface WorkflowError { code: string; message: string; nodeId?: string; address?: NodeAddress; }
export type ArtifactKind = 'context' | 'draft' | 'patches' | 'candidate' | 'guidance';
export type WorkflowPhase = 'pre' | 'post';
export interface Endpoint { nodeId: string; portId: string; }
export interface NodeAddress { workflowId: string; instancePath: string[]; nodeId: string; }
export interface ArtifactAddress extends NodeAddress { portId: string; }
export interface PortDescriptor {
    id: string;
    label: string;
    kind: ArtifactKind;
    direction: 'input' | 'output';
    required: boolean;
    /** Inputs accept one binding; outputs may fan out to many consumers. */
    cardinality: 'one';
}
export type ControlDescriptor =
    | { type: 'integer'; min: number; max: number; default: number }
    | { type: 'enum'; values: string[]; default: string }
    | { type: 'string'; default: string }
    | { type: 'boolean'; default: boolean }
    | { type: 'array'; items: 'string' | 'string-or-record'; default: unknown[] };
export interface Binding { profileId?: string | null; model?: string | null; }
export interface NativeNode extends Binding {
    id: string;
    type: 'workflow' | 'note';
    operation?: string;
    operationVersion?: 1;
    enabled?: boolean;
    modelRole?: string | null;
    artifactKind?: ArtifactKind;
    phase?: WorkflowPhase;
    [key: string]: unknown;
}
export interface LegacyNativeWire {
    id: string; from: string; to: string; order: number;
    kind?: 'append' | 'prepend' | 'merge';
}
export interface DirectWire {
    id: string; route: 'wire'; from: string; fromPort: string; to: string; toPort: string;
    order?: number;
    /** Preserved schema-2 metadata; route and named endpoints define native flow. */
    kind?: 'append' | 'prepend' | 'merge';
}
export interface PortalWire { id: string; route: 'portal'; portalId: string; to: string; toPort: string; }
export interface Portal { id: string; label: string; source: Endpoint; kind: ArtifactKind; }
export interface DefinitionRef { id: string; version: number; semanticHash: string; }
export interface InterfacePort extends PortDescriptor { boundaryNodeId: string; }
export interface BoundaryNode { id: string; type: 'subgraph-input' | 'subgraph-output'; interfacePortId: string; enabled?: boolean; inGroup?: string; }
export interface ParameterTarget { instancePath: string[]; nodeId: string; controlId: string; }
export interface ExposedParameter { id: string; label: string; target: ParameterTarget; }
export interface DefinitionBody {
    schema: 3; runtime: 2; mode: 'native-pre' | 'native-post';
    nodes: Record<string, NativeNode | SubgraphInstance | BoundaryNode>;
    wires: Record<string, DirectWire | PortalWire>;
    groups?: Record<string, Record<string, unknown>>;
    roles?: Record<string, Binding>; portals?: Record<string, Portal>;
}
export interface DefinitionSnapshot extends DefinitionRef {
    name: string; description?: string;
    interface: InterfacePort[]; parameters: ExposedParameter[]; body: DefinitionBody;
}
export type SnapshotTable = Record<string, DefinitionSnapshot>;
export interface DefinitionLibrary { definitions: SnapshotTable; }
export interface LibraryEdit { library: DefinitionLibrary; ref?: DefinitionRef; changed: boolean; addedDefinitionKeys?: string[]; }
export interface DefinitionDiagnostics { ref: DefinitionRef; definition: DefinitionSnapshot; interface: InterfacePort[]; parameters: ExposedParameter[]; parameterDescriptors: Record<string, ControlDescriptor>; nodeCount: number; wireCount: number; }
export interface SubgraphInstance {
    id: string; type: 'subgraph'; definition: DefinitionRef; enabled?: boolean;
    /** Validated exclusive root owner; authoring-only, never exported or executable authority. */
    localCopy?: { definitionId: string };
    parameterOverrides: Record<string, unknown>;
    roleOverrides: Record<string, Binding>;
    nodeBindingOverrides: Record<string, Binding>;
}
interface NativeDocument {
    id?: string;
    name?: string;
    mode: 'native-pre' | 'native-post';
    nodes: Record<string, NativeNode | SubgraphInstance>;
    groups?: Record<string, Record<string, unknown>>;
    roles?: Record<string, Binding>;
    [key: string]: unknown;
}
export interface NativeGraph2 extends NativeDocument { schema: 2; runtime: 1; wires: Record<string, LegacyNativeWire>; }
export interface NativeGraph3 extends NativeDocument {
    schema: 3; runtime: 2; wires: Record<string, DirectWire | PortalWire>;
    portals?: Record<string, Portal>;
    definitions?: SnapshotTable;
    /** Full wrapper paths; immutable definition bodies never contain this permission registry. */
    localDefinitionOwners?: { instancePath: string[]; definitionId: string }[];
}
/** Terminal host results have no routable artifact port. */
export interface TerminalTarget { kind: 'terminal'; address: NodeAddress; }
export type WorkflowTarget = ArtifactAddress | TerminalTarget;
export interface ResolvedEdge { from: ArtifactAddress; to: ArtifactAddress; disabled?: boolean; provenance?: { wireId: string; portalId?: string; instancePath: string[] }; }
export interface RunUnit {
    address: NodeAddress; operation: string; label?: string; included: boolean;
    dependencies: NodeAddress[]; requestBound: number; inputPorts: string[]; outputPorts: string[];
}
export interface RunHierarchyEntry { address: NodeAddress; kind: 'instance' | 'primitive'; parent?: NodeAddress; included: boolean; }
export interface RunPlan {
    workflowId: string; phase: WorkflowPhase; mode: 'root' | 'target';
    target?: WorkflowTarget; resolvedTarget?: WorkflowTarget;
    units: RunUnit[]; hierarchy: RunHierarchyEntry[]; terminals: TerminalTarget[]; callBound: number;
}
export interface ResolvedPrimitive {
    address: NodeAddress; node: NativeNode; enabled: boolean; terminal: boolean; included: boolean;
    inputPorts: PortDescriptor[]; outputPorts: PortDescriptor[]; requestBound: number; dependencies: NodeAddress[];
}
export interface BoundaryMapping {
    instance: NodeAddress; portId: string; direction: 'input' | 'output'; boundary: ArtifactAddress;
    source: ArtifactAddress | null; required: boolean; disabled?: boolean;
}
export interface ResolvedPlan extends RunPlan {
    primitives: ResolvedPrimitive[]; edges: ResolvedEdge[]; boundaryMappings: BoundaryMapping[];
    dependencies: { address: NodeAddress; dependencies: NodeAddress[] }[];
    perNodeBounds: { address: NodeAddress; requestBound: number; included: boolean }[]; requiredRoles: string[];
}
export interface StructureDiagnostics { nodeCount: number; wireCount: number; }
export interface PreparedGraphEdit {
    candidate: NativeGraph2 | NativeGraph3;
    changed: boolean;
    addedEdgeIds: string[];
    removedEdgeIds: string[];
    baseDocumentSignature: string;
    baseSignature: string;
}
export interface ConnectionCommand { from: Endpoint; to: Endpoint; replace?: boolean; }
export interface LocalDefinitionOwner { instancePath: string[]; definitionId: string; }
export interface QualifiedInstanceCommand { instancePath?: string[]; instanceId?: string; }
export interface LocalCopyCommand extends QualifiedInstanceCommand { id: string; name?: string; }
export interface LocalDefinitionEditCommand extends QualifiedInstanceCommand { expectedRef: DefinitionRef; draft: DefinitionSnapshot; }
export interface ChangedDefinitionRef { instancePath: string[]; before: DefinitionRef; after: DefinitionRef; }
export interface LocalDefinitionEdit extends PreparedGraphEdit { instancePath: string[]; changedRefs: ChangedDefinitionRef[]; copying: boolean; }
export interface CreateFromSelectionCommand { viewPath?: string[]; nodeIds: string[]; definitionId: string; name: string; instanceId?: string; }
export interface SelectionCompositionEdit extends PreparedGraphEdit {
    instanceId: string; definitionRef: DefinitionRef;
    proposal: { inputs: InterfacePort[]; outputs: InterfacePort[]; selectedNodeIds: string[] };
}
export interface UnpackCompositionEdit extends PreparedGraphEdit {
    instancePath: string[];
    identityMap: { nodes: Record<string, string>; wires: Record<string, string>; groups: Record<string, string>; portals: Record<string, string> };
    generatedReroutes: { nodeId: string; interfacePortId: string; direction: 'input' | 'output'; kind: ArtifactKind }[];
    generatedRoles: { role: string; sourceRole: string; nodeId: string; binding: Binding }[];
    changedRefs: ChangedDefinitionRef[];
}
export interface CompositionView {
    instancePath: string[]; definitionRef?: DefinitionRef; editable: boolean;
    savedGraph: DefinitionBody;
    effectiveNodes: DefinitionBody['nodes']; interface: InterfacePort[];
    ports: { address: ArtifactAddress; direction: 'input' | 'output'; kind: ArtifactKind }[];
}
export interface CompositionViews { workflowId: string; views: CompositionView[]; }
