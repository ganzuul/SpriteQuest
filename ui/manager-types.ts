import type { DetailBindingField, DetailBindingMode, DetailControl, DetailError, DetailNodeAddress } from './detail-types';

/** Display/command metadata only: no definition bodies, snapshots, candidates or host authority. */
export interface ManagerRef { id: string; version: number; semanticHash: string; }
export type ManagerScope = { kind: 'graph'; workflowId: string; instancePath: string[]; definitionRef?: ManagerRef } | { kind: 'library'; definitionRef: ManagerRef };
export interface ManagerCapture { managerKey: string; revision: string; scope: ManagerScope; }
export interface LibraryManagerCapture extends ManagerCapture { libraryRevision: string; }
export type ManagerResult = { ok: true } | { ok: false; error: DetailError };
export type ManagerResponse = ManagerResult | Promise<ManagerResult>;
export interface ManagerEndpoint { nodeId: string; portId: string; }
export interface ManagerPortChoice extends ManagerEndpoint { key: string; label: string; direction: 'input' | 'output'; kind: string; occupied: boolean; }
export interface ManagerPublisher { id: string; label: string; kind: string; source: ManagerEndpoint; }
export interface ManagerConsumer { edgeId: string; label: string; to: ManagerEndpoint; }
export interface PortalManagerView extends ManagerCapture {
    scopeLabel: string; readOnly: boolean; canPresent: boolean; renameMode: 'authored' | 'presentation';
    capabilities: { create: boolean; rename: boolean; retarget: boolean; connect: boolean; restore: boolean; remove: boolean; convert: boolean };
    selectedPortalId: string | null; publishers: ManagerPublisher[]; sources: ManagerPortChoice[]; receivers: ManagerPortChoice[]; consumers: ManagerConsumer[];
    conversion: { kind: 'wire'; edgeId: string; label: string } | { kind: 'output'; endpoint: ManagerEndpoint; label: string } | null;
    issue?: string;
}
export interface PortalManagerActions {
    create?: (capture: ManagerCapture, label: string, source: ManagerEndpoint) => ManagerResponse;
    rename?: (capture: ManagerCapture, portalId: string, label: string, mode: 'authored' | 'presentation') => ManagerResponse;
    retarget?: (capture: ManagerCapture, portalId: string, source: ManagerEndpoint) => ManagerResponse;
    connect?: (capture: ManagerCapture, portalId: string, to: ManagerEndpoint, replace: boolean) => ManagerResponse;
    restoreWire?: (capture: ManagerCapture, edgeId: string) => ManagerResponse;
    deletePublisher?: (capture: ManagerCapture, portalId: string, consumers: 'restore' | 'disconnect') => ManagerResponse;
    convertWire?: (capture: ManagerCapture, edgeId: string) => ManagerResponse;
    convertOutput?: (capture: ManagerCapture, endpoint: ManagerEndpoint) => ManagerResponse;
    selectPortal?: (capture: ManagerCapture, portalId: string | null) => void;
    jumpSource?: (capture: ManagerCapture, source: ManagerEndpoint) => void;
    jumpConsumer?: (capture: ManagerCapture, edgeId: string, to: ManagerEndpoint) => void;
    close?: () => void;
}

export interface ManagerParameterTarget { instancePath: string[]; nodeId: string; controlId: string; }
export interface ManagerInterface { id: string; label: string; direction: 'input' | 'output'; kind: string; required: boolean; cardinality: 'one'; boundaryNodeId: string; }
export interface ManagerParameter { id: string; label: string; target: ManagerParameterTarget; control: DetailControl; }
export interface ManagerEligibleTarget { key: string; label: string; target: ManagerParameterTarget; }
export interface ManagerDefinitionDetail { ref: ManagerRef; name: string; description: string; interface: ManagerInterface[]; parameters: ManagerParameter[]; eligibleTargets: ManagerEligibleTarget[]; kinds: string[]; exposureNote?: string; }
export interface ManagerShelfEntry { key: string; ref: ManagerRef; name: string; phase: string; nodeCount: number; wireCount: number; }
export type ManagerBindingTarget = { kind: 'role'; role: string } | { kind: 'node'; instancePath: string[]; nodeId: string };
export interface ManagerBindingRow { key: string; label: string; target: ManagerBindingTarget; editable: boolean; profile: DetailBindingField; model: DetailBindingField; effective: string; source: string; issue?: string; }
export interface ManagerInstanceDetail { address: DetailNodeAddress; ref: ManagerRef; owned: boolean; parameters: { id: string; label: string; control: DetailControl; overridden: boolean }[]; bindings: ManagerBindingRow[]; }
export interface ManagerMappingRow { from: string; label: string; to: string | null; options: { id: string; label: string }[]; canDrop: boolean; }
export interface ManagerUpdateMaps { portMap: Record<string, string | null>; parameterMap: Record<string, string | null>; roleMap: Record<string, string | null>; nodeBindingMap: Record<string, string | null>; }
export interface ManagerUpdateDetail { choices: { key: string; ref: ManagerRef; label: string }[]; selectedKey: string | null; portMap: ManagerMappingRow[]; parameterMap: ManagerMappingRow[]; roleMap: ManagerMappingRow[]; nodeBindingMap: ManagerMappingRow[]; preparedKey: string | null; summary: string[]; }
export interface SubgraphManagerView extends LibraryManagerCapture {
    scopeLabel: string; selectedRef: ManagerRef | null; entries: ManagerShelfEntry[];
    permissions: { libraryWrite: boolean; insert: boolean; instanceEdit: boolean; bodyEdit: boolean };
    capabilities: { importJSON: boolean; exportJSON: boolean; duplicate: boolean; renameRevision: boolean; removeRevision: boolean; insert: boolean; makeLocalCopy: boolean; saveToShelf: boolean; editInterface: boolean; editParameter: boolean; editParameterOverride: boolean; editBindingOverride: boolean; prepareUpdate: boolean; acceptUpdate: boolean; convertSelection: boolean; unpack: boolean };
    definition: ManagerDefinitionDetail | null; instance: ManagerInstanceDetail | null;
    destinations: { key: string; label: string }[]; selectedDestinationKey: string | null;
    update: ManagerUpdateDetail | null; selection: { nodeIds: string[]; label: string } | null; issue?: string;
}
export type ManagerInterfaceEdit = { kind: 'add'; label: string; direction: 'input' | 'output'; artifactKind: string; required: boolean; graphPoint?: { x: number; y: number } } | { kind: 'update'; id: string; label: string; artifactKind: string; required: boolean } | { kind: 'remove'; id: string };
export type ManagerParameterEdit = { kind: 'add'; label: string; target: ManagerParameterTarget } | { kind: 'update'; id: string; label: string } | { kind: 'remove'; id: string };
export interface SubgraphManagerActions {
    selectRef?: (capture: LibraryManagerCapture, ref: ManagerRef | null) => void;
    openLibrary?: (capture: LibraryManagerCapture, ref: ManagerRef) => void;
    selectDestination?: (capture: LibraryManagerCapture, key: string | null) => void;
    insert?: (capture: LibraryManagerCapture, ref: ManagerRef, destinationKey: string) => ManagerResponse;
    importJSON?: (capture: LibraryManagerCapture) => ManagerResponse;
    exportJSON?: (capture: LibraryManagerCapture, ref: ManagerRef) => ManagerResponse;
    duplicate?: (capture: LibraryManagerCapture, ref: ManagerRef, name: string) => ManagerResponse;
    renameRevision?: (capture: LibraryManagerCapture, ref: ManagerRef, name: string) => ManagerResponse;
    removeRevision?: (capture: LibraryManagerCapture, ref: ManagerRef) => ManagerResponse;
    openInstance?: (capture: LibraryManagerCapture, address: DetailNodeAddress) => void;
    makeLocalCopy?: (capture: LibraryManagerCapture, address: DetailNodeAddress, ref: ManagerRef) => ManagerResponse;
    saveToShelf?: (capture: LibraryManagerCapture, mode: 'new' | 'revision', targetRef: ManagerRef | null, name: string) => ManagerResponse;
    editInterface?: (capture: LibraryManagerCapture, edit: ManagerInterfaceEdit) => ManagerResponse;
    editParameter?: (capture: LibraryManagerCapture, edit: ManagerParameterEdit) => ManagerResponse;
    editParameterOverride?: (capture: LibraryManagerCapture, parameterId: string, mode: 'set' | 'reset', value?: unknown) => ManagerResponse;
    editBindingOverride?: (capture: LibraryManagerCapture, target: ManagerBindingTarget, field: 'profileId' | 'model', mode: DetailBindingMode, value: string | null) => ManagerResponse;
    selectUpdateRef?: (capture: LibraryManagerCapture, ref: ManagerRef | null) => void;
    prepareUpdate?: (capture: LibraryManagerCapture, fromRef: ManagerRef, targetRef: ManagerRef, maps: ManagerUpdateMaps) => ManagerResponse;
    acceptUpdate?: (capture: LibraryManagerCapture, preparedKey: string, fromRef: ManagerRef, targetRef: ManagerRef) => ManagerResponse;
    convertSelection?: (capture: LibraryManagerCapture, nodeIds: string[], name: string) => ManagerResponse;
    unpack?: (capture: LibraryManagerCapture, address: DetailNodeAddress, ref: ManagerRef) => ManagerResponse;
    close?: () => void;
}
