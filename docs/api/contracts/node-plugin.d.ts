/**
 * Node plugin API v1 — specification-only contract.
 *
 * This file is normative for the TypeScript shape of a plugin and its
 * operations. It is not imported by the runtime, is not part of the Svelte
 * build, and is not included by `tsconfig.json`. See
 * `docs/api/node-plugin-api.md` for the behavioral rules.
 *
 * Status: proposed. No registration API exists in 0.27.3.
 */

export type NodeApiVersion = 1;

export type JsonValue =
    | null
    | boolean
    | number
    | string
    | JsonValue[]
    | { [key: string]: JsonValue };

export interface Result<T> {
    ok: true;
    data: T;
}

export interface Failure {
    ok: false;
    error: WorkflowError;
}

export type OperationResultOrFailure<T> = Result<T> | Failure;

export interface WorkflowError {
    code: string;
    message: string;
    nodeId?: string;
    address?: NodeAddress;
    details?: Record<string, JsonValue>;
}

export interface NodeAddress {
    workflowId: string;
    instancePath: string[];
    nodeId: string;
}

export type Phase = 'pre' | 'post';

export type NativeWorkflowMode = 'native-pre' | 'native-post' | 'native-unified';

/** Closed v1 taxonomy. A new family is a host change, not a plugin change. */
export type Family =
    | 'Input'
    | 'Shaping'
    | 'Surface'
    | 'Transpose'
    | 'Introspection'
    | 'Derive'
    | 'Events'
    | 'Collections'
    | 'Randomness'
    | 'Recall'
    | 'Output';

/** Closed v1 artifact set. */
export type ArtifactKind =
    | 'context'
    | 'draft'
    | 'patches'
    | 'candidate'
    | 'guidance'
    | 'text'
    | 'data';

export type ArtifactVisibility = 'public' | 'hidden' | 'actor-private';

export interface TextArtifact {
    kind: 'text';
    text: string;
}

export interface DataArtifact {
    kind: 'data';
    value: JsonValue;
}

export interface GuidanceArtifact {
    kind: 'guidance';
    text: string;
    visibility?: ArtifactVisibility;
    scope?: Record<string, JsonValue>;
    sourceRefs?: JsonValue[];
    [key: string]: unknown;
}

export interface ContextArtifact {
    kind: 'context';
    [key: string]: unknown;
}

export interface OpaqueArtifact {
    kind: 'draft' | 'patches' | 'candidate';
    [key: string]: unknown;
}

export type WorkflowArtifact =
    | TextArtifact
    | DataArtifact
    | GuidanceArtifact
    | ContextArtifact
    | OpaqueArtifact;

export type PortStatus = 'completed' | 'skipped' | 'unresolved';

export interface PortState {
    status: PortStatus;
    reason?: WorkflowError;
}

export type Report = Record<string, JsonValue>;

export type ReportedUsage = Partial<Record<
    | 'inputTokens'
    | 'outputTokens'
    | 'totalTokens'
    | 'promptTokens'
    | 'completionTokens'
    | 'input_tokens'
    | 'output_tokens'
    | 'total_tokens'
    | 'prompt_tokens'
    | 'completion_tokens'
    | 'cached_tokens'
    | 'reasoning_tokens',
    number
>>;

export type OperationResult =
    | {
          ok: true;
          artifact?: WorkflowArtifact;
          outputs?: Record<string, WorkflowArtifact>;
          outputStates?: Record<string, PortState>;
          reports?: Report[];
      }
    | {
          ok: false;
          error: WorkflowError;
      };

/* -------------------------------------------------------------------------
 * Controls
 * ---------------------------------------------------------------------- */

interface ControlBase {
    label?: string;
    help?: string;
    editor?: 'text' | 'json';
    exposable?: boolean;
    hidden?: boolean;
    validateWhenHidden?: boolean;
    visibleWhen?: { key: string; value: string | boolean | number };
}

export interface StringControl extends ControlBase {
    type: 'string';
    default: string;
    min?: number;
    max?: number;
    multiline?: boolean;
}

export interface IntegerControl extends ControlBase {
    type: 'integer';
    default: number;
    min: number;
    max: number;
}

export interface NumberControl extends ControlBase {
    type: 'number';
    default: number;
    min: number;
    max: number;
    step?: number | 'any';
}

export interface BooleanControl extends ControlBase {
    type: 'boolean';
    default: boolean;
}

export interface EnumControl extends ControlBase {
    type: 'enum';
    default: string;
    values: string[];
    valueLabels?: Record<string, string>;
}

export interface JsonValueControl extends ControlBase {
    type: 'json-value';
    default: JsonValue;
}

export interface ArrayControl extends ControlBase {
    type: 'array';
    default: JsonValue[];
    items: 'string' | 'string-or-record' | 'record' | 'context-slot' | 'json';
    min?: number;
    max?: number;
}

export interface ObjectControl extends ControlBase {
    type: 'object';
    default: { [key: string]: JsonValue };
    max?: number;
}

export type ControlDescriptor =
    | StringControl
    | IntegerControl
    | NumberControl
    | BooleanControl
    | EnumControl
    | JsonValueControl
    | ArrayControl
    | ObjectControl;

/* -------------------------------------------------------------------------
 * Ports and constraints
 * ---------------------------------------------------------------------- */

export interface PortDeclaration {
    id: string;
    label: string;
    direction: 'input' | 'output';
    kind: ArtifactKind;
    required: boolean;
    /** Inputs accept one binding; outputs may fan out. */
    cardinality: 'one';
}

export interface OperationConstraints {
    minimumSchema: 3;
    minimumRuntime: 2;
    rootOnly?: boolean;
    terminal?: boolean;
    dynamicPorts?: boolean;
    requiresStateInDefinition?: boolean;
    acceptsSkippedInputs?: boolean;
    previewSafe?: boolean;
    modes?: NativeWorkflowMode[];
}

export interface OperationCapabilities {
    request?: boolean;
    tokenizer?: boolean;
    clock?: boolean;
    random?: boolean;
    /** Deferred; verified tier only, with an origin allowlist. */
    network?: { origins: string[] };
    /** Core tier only. A third-party plugin request is denied at activation. */
    host?: boolean;
}

/* -------------------------------------------------------------------------
 * Presentation
 * ---------------------------------------------------------------------- */

export interface GuideSection {
    title: string;
    body: string;
}

export interface GuideSetting {
    control: string;
    body: string;
}

export interface OperationGuide {
    summary: string;
    sections: GuideSection[];
    settings?: GuideSetting[];
}

export interface OperationExample {
    title: string;
    description?: string;
    node: PlainNode;
    explanation?: string;
}

export interface OperationPresentation {
    purpose?: string;
    shortcode?: string;
    searchAliases?: string[];
    guide?: OperationGuide;
    examples?: OperationExample[];
}

export interface Deprecation {
    since: string;
    replacement?: string;
    removeIn?: string;
}

/* -------------------------------------------------------------------------
 * Execution context and services
 * ---------------------------------------------------------------------- */

export type PlainNode = Readonly<Record<string, JsonValue>>;

export interface DescribeContext {
    phase: Phase;
    mode: NativeWorkflowMode;
    node: PlainNode;
}

export interface TextRequestOptions {
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
    maxTokens: number;
    modelRole?: string | null;
    signal?: AbortSignal;
}

export interface TextRequestService {
    (options: TextRequestOptions): Promise<
        Result<{ text: string; finish?: string; usage?: ReportedUsage }>
    >;
}

export interface TokenCounter {
    (text: string): Promise<{ tokens: number; method: string }>;
}

export interface Clock {
    now(): number;
    monotonic(): number;
}

export interface RandomSource {
    (): number;
}

export interface Logger {
    debug(message: string, fields?: Record<string, JsonValue>): void;
    info(message: string, fields?: Record<string, JsonValue>): void;
    warn(message: string, fields?: Record<string, JsonValue>): void;
    error(message: string, fields?: Record<string, JsonValue>): void;
}

export interface NodeServices {
    request?: TextRequestService;
    countTokens?: TokenCounter;
    clock?: Clock;
    random?: RandomSource;
}

export interface NodeExecutionContext {
    node: PlainNode;
    inputs: Readonly<Record<string, WorkflowArtifact>>;
    inputStates: Readonly<Record<string, PortState>>;
    phase: Phase;
    mode: NativeWorkflowMode;
    address: NodeAddress;
    preview: boolean;
    dryRun: boolean;
    signal?: AbortSignal;
    services: NodeServices;
    log: Logger;
}

/* -------------------------------------------------------------------------
 * Operation definition
 * ---------------------------------------------------------------------- */

export interface OperationDescriptorBase {
    id: string;
    version: number;
    title: string;
    family: Family;
    phase: Phase | 'both' | null;
    input: ArtifactKind | null;
    output: ArtifactKind | null;
    controls: Record<string, ControlDescriptor>;
    defaults?: Record<string, JsonValue>;
    ports?: PortDeclaration[];
    /** Static upper bound on text-completion requests per run. Zero means none. */
    requestBound?: number;
    /** Model role the host resolves to a connection, or null for a pure operation. */
    modelRole?: string | null;
    constraints: OperationConstraints;
    capabilities: OperationCapabilities;
    presentation?: OperationPresentation;
    deprecated?: Deprecation;
}

export interface OperationDescription {
    descriptor: OperationDescriptorBase;
    ports: PortDeclaration[];
}

export interface OperationDefinition extends OperationDescriptorBase {
    /** Pure: the same context and node must produce an equal description. */
    describe?(context: DescribeContext): Result<OperationDescription>;

    /** Pure and bounded; runs after control-shape validation. */
    validate?(node: PlainNode, context: DescribeContext): Result<void>;

    /** The operation's behavior. Receives only declared capabilities. */
    execute(context: NodeExecutionContext): Promise<OperationResult> | OperationResult;

    /** Required when a version changes the meaning of saved controls. */
    migrate?(node: PlainNode, fromVersion: number): Result<PlainNode>;
}

/* -------------------------------------------------------------------------
 * Plugin package and host
 * ---------------------------------------------------------------------- */

export interface PluginManifest {
    apiVersion: NodeApiVersion;
    id: string;
    name: string;
    version: string;
    entry: string;
    operations: string[];
    license: string;
    integrity?: string;
    minHostVersion?: string;
}

export interface PluginHost {
    readonly apiVersion: NodeApiVersion;
    register(operation: OperationDefinition): void;
    readonly log: Logger;
}

export interface LatticePlugin {
    apiVersion: NodeApiVersion;
    id: string;
    name: string;
    version: string;
    operations: OperationDefinition[];
    /** Optional resource setup. Return a disposer; it runs once on unload/disable. */
    activate?(host: PluginHost): void | (() => void);
}

export type PluginTier = 'core' | 'verified' | 'community';

export interface PluginRegistration {
    plugin: LatticePlugin;
    tier: PluginTier;
    manifest: PluginManifest;
    root: string;
}