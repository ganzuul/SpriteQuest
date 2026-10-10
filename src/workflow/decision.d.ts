import type { JsonValue } from './operations/json-data';
import type { ReportedUsage, Result } from './types';
export type DecisionState = string | Record<string, JsonValue> | JsonValue[];
export type Instructions = DecisionState;
export type DecisionQuestion =
    | { type: 'noul'; instructions: Instructions; criteria?: { true?: Instructions; false?: Instructions } }
    | { type: 'choice'; instructions: Instructions; criteria: Record<string, Instructions | null> }
    | { type: 'score'; instructions: Instructions; criteria: Instructions[] };
export type DecisionQuestions = Record<string, DecisionQuestion>;
export type TextAnswer = ({ type: 'noul'; accepted: boolean | null } | { type: 'choice'; choice: string | null } | { type: 'score'; score: number | null }) & { confidence?: number; evidence?: string };
export interface DecisionRecord {
    schemaVersion: 1; recordType: 'decision'; source: 'model-text';
    answers: Record<string, TextAnswer>; usage: ReportedUsage | null; actualCalls: number;
    confidenceSemantics: 'self-reported';
}
export interface DecisionOptions { state: DecisionState; questions: DecisionQuestions; maxTokens?: number; }
export type TextDecisionRequest = (options: { messages: { role: 'system' | 'user'; content: string }[]; maxTokens: number; signal?: AbortSignal }) => Promise<Result<{ text: string; finish: string; usage?: ReportedUsage | null }>>;
export interface DecisionExecution { signal?: AbortSignal; request?: TextDecisionRequest; }
export function validateDecisionQuestions(value: unknown): Result<{ questions: DecisionQuestions }>;
export function prepareDecisionRequest(value: unknown): Result<{ state: DecisionState; questions: DecisionQuestions }>;
export function runDecision(value: DecisionOptions | unknown, local?: DecisionExecution): Promise<Result<DecisionRecord>>;
