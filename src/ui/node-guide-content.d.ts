export interface NodeGuide {
    readonly key: string;
    readonly title: string;
    readonly summary: string;
    readonly howTo: readonly string[];
}
export function getNodeGuide(key: string | null | undefined): NodeGuide | null;
export function nodeGuideKey(node: { type?: string; operation?: string; commentFrame?: boolean } | null | undefined): string | null;
export function describeGuideControl(key: string | null | undefined, controlKey: string): string | null;
