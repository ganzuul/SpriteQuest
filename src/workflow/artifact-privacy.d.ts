import type { WorkflowArtifact, OperationResult } from './types';
export type ArtifactVisibility={kind:'public'}|{kind:'hidden'}|{kind:'actor-private';actorId:string};
export function artifactVisibility(material:unknown):ArtifactVisibility;
export function validVisibilityMetadata(artifact:object):boolean;
export function preserveArtifactPrivacy(result:OperationResult,inputs:Record<string,WorkflowArtifact>):OperationResult;
