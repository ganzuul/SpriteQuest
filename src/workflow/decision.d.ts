import type { JsonValue } from './operations/json-data';
import type { ReportedUsage, Result } from './types';
export type DecisionState = string | { [key: string]: JsonValue } | JsonValue[];
export type Instructions = DecisionState;
export type DecisionQuestion =
    | { type: 'noul'; instructions: Instructions; criteria?: { true?: Instructions; false?: Instructions } }
    | { type: 'choice'; instructions: Instructions; criteria: Record<string, Instructions | null> }
    | { type: 'score'; instructions: Instructions; criteria: Instructions[] };
export type DecisionQuestions = Record<string, DecisionQuestion>;
export type FastAnswer =
    | { type: 'noul'; noul: number }
    | { type: 'choice'; choice: string; probabilities: Record<string, number>; confidence: number }
    | { type: 'score'; score: number; legend: Record<string, string>; probabilities: Record<string, number>; confidence: number };
export interface FastResponse { model: string; answers: Record<string, FastAnswer>; usage: { input_tokens: number; output_tokens: number }; routing?: JsonValue; action?: JsonValue; }
export interface CheckedFastResponse { model: string; answers: Record<string, FastAnswer>; usage: { input_tokens: number; output_tokens: number }; diagnostics?: { routing?: JsonValue; action?: JsonValue }; }
export type TextAnswer = ({ type: 'noul'; accepted: boolean | null } | { type: 'choice'; choice: string | null } | { type: 'score'; score: number | null }) & { confidence?: number; evidence?: string };
export interface DecisionRecord {
    schemaVersion: 1; recordType: 'decision'; source: 'model-text' | 'typed-provider';
    answers: Record<string, TextAnswer | FastAnswer>; usage: ReportedUsage | null; actualCalls: number;
    model?: string; confidenceSemantics?: 'self-reported'; diagnostics?: { routing?: JsonValue; action?: JsonValue };
    provenance?: Record<string, string | number>; fallback?: { from: 'typed-provider'; reason: string };
}
export interface DecisionOptions { state: DecisionState; questions: DecisionQuestions; maxTokens?: number; fallback?: { enabled: boolean; allowedCodes: string[] }; }
export type TextDecisionRequest = (options: { messages: { role: 'system' | 'user'; content: string }[]; maxTokens: number; signal?: AbortSignal }) => Promise<Result<{ text: string; finish: string; usage?: ReportedUsage | null }>>;
export type TypedDecisionRequest = (options: { state: DecisionState; questions: DecisionQuestions; signal?: AbortSignal }) => Promise<Result<FastResponse | { response: FastResponse; usage?: ReportedUsage; provenance?: Record<string, JsonValue> }>>;
/** Text request is separately authenticated; it must never reuse a typed binding. */
export interface DecisionExecution { signal?: AbortSignal; request?: TextDecisionRequest; typedRequest?: TypedDecisionRequest; }
export function validateDecisionQuestions(value: unknown): Result<{ questions: DecisionQuestions }>;
export function prepareFastDecisionRequest(value: unknown): Result<{ state: DecisionState; questions: DecisionQuestions }>;
export function validateFastDecisionResponse(raw: unknown, questionsValue: unknown): Result<CheckedFastResponse>;
export function runDecision(value: DecisionOptions | unknown, local?: DecisionExecution): Promise<Result<DecisionRecord>>;
export function runFastDecision(value: DecisionOptions | unknown, local?: DecisionExecution): Promise<Result<DecisionRecord>>;
