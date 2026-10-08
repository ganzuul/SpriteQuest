/** Plain boundary DTOs: never carry host adapters, authenticated bindings or authority. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: WorkflowError };
export interface WorkflowError { code: string; message: string; nodeId?: string; }
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
export interface SubgraphInstance {
    id: string; type: 'subgraph'; definition: DefinitionRef; enabled?: boolean;
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
    /** Pinned snapshot validation and concrete snapshot DTOs arrive with composition. */
    definitions?: Record<string, unknown>;
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
