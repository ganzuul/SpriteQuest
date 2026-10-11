import type { NativeGraph3 } from './types';
export interface NodeGuideExample {
    id: string;
    title: string;
    description: string;
    graph: NativeGraph3;
    focus?: { instancePath: string[]; nodeIds: string[]; definitionKey?: string };
    requirements: string[];
    steps: string[];
    expected: string;
    fixtures?: { name: string; content: string }[];
}
export function getNodeGuideExample(key: string): NodeGuideExample | null;
