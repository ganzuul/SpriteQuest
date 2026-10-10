import type { ComposeSection } from './operations/compose.js';
import type { WorkflowArtifact, PortState } from './types';
export interface ComposeSourceSection extends ComposeSection {
    kind?: 'text' | 'guidance';
    required?: boolean;
    onSkipped?: 'fallback' | 'omit';
}
export interface ComposeContributionReport {
    portId: string; name: string; kind: 'text' | 'guidance';
    status: 'completed' | 'fallback' | 'omitted'; length: number;
}
export type ComposeContributionsResult = { ok: true; data: { sections: ComposeSection[]; contributions: ComposeContributionReport[]; originals: WorkflowArtifact[] } } | { ok: false; error: { code: string; message: string } };
/** Result admission reads own data only and retains original input identities privately. */
export function resolveComposeContributions(settings: unknown, inputs?: unknown, inputStates?: Readonly<Record<string, PortState>>): ComposeContributionsResult;
