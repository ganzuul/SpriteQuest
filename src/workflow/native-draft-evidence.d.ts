import type {Result,DataArtifact} from './types';
import type {DraftArtifact} from './draft-revisions';
export interface NativeDraftEvidenceRegistry {
 retain(input:{draft:DraftArtifact;scope:DataArtifact;source:DataArtifact}):Result<{retained:true;source:DataArtifact}>;
 validate(events:unknown,finalDraft:DraftArtifact):Result<void>;
 release():void;
}
export function isNativeDraftEvidenceRegistry(value:unknown):value is NativeDraftEvidenceRegistry;
export function createNativeDraftEvidenceRegistry(config:{getOriginalDraft:()=>DraftArtifact;isCurrent:()=>boolean;signal?:AbortSignal}):Result<NativeDraftEvidenceRegistry>;
