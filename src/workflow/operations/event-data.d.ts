import type { JsonValue, Result } from './json-data';
import type { ProgressionEvent } from '../progression';
import type { DraftArtifact } from '../draft-revisions';
export type EventWatch = 'player-message' | 'draft' | 'scene-context' | 'accepted-event';
export type EventSemantics = 'actual' | 'mention' | 'planned' | 'threatened' | 'recalled' | 'proposed' | 'uncertain';
export type EventType = 'item-used' | 'item-mentioned' | 'item-transferred' | 'actor-entered' | 'actor-exited' | 'scene-action';
export interface EventPosition { start: number; end: number; }
export interface EventSource {
    sourceId: string; revision: string; sceneId: string; watch: EventWatch;
    text: string; visibility: 'public' | 'actor-private'; actorId?: string;
}
export type EventSourceRef = Omit<EventSource, 'text'>;
export interface CanonicalEntities { actorIds: string[]; itemIds: string[]; }
export interface OccurrenceCandidate {
    eventType: EventType; actorId: string; itemId?: string; objectId?: string;
    position: EventPosition; semantics: EventSemantics;
}
export interface OccurrenceEvidence {
    origin: EventWatch; sourceId: string; revision: string; position: EventPosition; text: string;
}
export interface Occurrence extends OccurrenceCandidate {
    schemaVersion: 1; recordType: 'occurrence'; eventId: string; sceneId: string; source: EventSourceRef;
    evidence: OccurrenceEvidence; status: 'candidate' | 'confirmed'; acceptance: 'pending';
    holderId?: string; confirmation?: { accepted: true };
}
export type OccurrenceConfirmation = { eventId: string; accepted: boolean; status?: 'resolved' } | { eventId: string; status: 'unresolved'; accepted?: never };
export interface LiteralTriggerSettings {
    aliases: string[]; itemId: string; actorId: string; watch: EventWatch;
    activation: 'per-occurrence' | 'once-per-source' | 'edge-once'; caseSensitive?: boolean;
}
export interface LiteralTriggerState { matched: boolean; consumedActivationIds: string[]; }
export interface OccurrenceProjection { events: Occurrence[]; }
export function validateOccurrences(raw: unknown, options?: { status?: 'candidate' | 'confirmed' }): Result<OccurrenceProjection>;
export function normalizeOccurrences(source: unknown, candidates: unknown, entities: unknown): Result<OccurrenceProjection>;
export function confirmOccurrences(candidates: unknown, decisions: unknown): Result<OccurrenceProjection & { rejectedIds: string[]; actualCalls: 0 }>;
export function resolveItemHolders(holders: unknown, events: unknown): Result<OccurrenceProjection & { holders: Record<string,string | null>; actualCalls: 0 }>;
export function matchLiteralTrigger(source: unknown, settings: LiteralTriggerSettings, entities: unknown, state?: LiteralTriggerState): Result<OccurrenceProjection & { activationIds: string[]; triggerState: LiteralTriggerState; actualCalls: 0 }>;
/** identity.occurrenceId is bounded SHA-256; evidence.occurrenceId retains the exact original tuple. */
export function toProgressionEvents(events: unknown, settings?: { eventType?: string; absoluteMinute?: number }): Promise<Result<{ events: ProgressionEvent[]; actualCalls: 0 }>>;
export function sourceFromDraft(draft: DraftArtifact | unknown, scope: Omit<EventSource, 'text' | 'watch'>): Result<{ source: EventSource; provenance: { type: 'draft-story-body'; revisionId: string | null; assembledRevisionId: string | null; rootRevisionId: string | null } }>;