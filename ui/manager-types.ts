import type { DetailError } from './detail-types';

/** Display/command metadata only: no definition bodies, snapshots, candidates or host authority. */
export interface ManagerRef { id: string; version: number; semanticHash: string; }
export type ManagerScope = { kind: 'graph'; workflowId: string; instancePath: string[]; definitionRef?: ManagerRef } | { kind: 'library'; definitionRef: ManagerRef };
export interface ManagerCapture { managerKey: string; revision: string; scope: ManagerScope; }
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

export type ManagerInterfaceEdit = { kind: 'add'; label: string; direction: 'input' | 'output'; artifactKind: string; required: boolean; graphPoint?: { x: number; y: number } } | { kind: 'update'; id: string; label: string; artifactKind: string; required: boolean } | { kind: 'remove'; id: string };
