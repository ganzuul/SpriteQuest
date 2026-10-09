/** Plain presentation data. Comment authority and node membership stay in the canvas domain. */
export interface CommentFrameData {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    title: string;
    content: string;
    color: string;
    moveContents: boolean;
    selected: boolean;
    readOnly: boolean;
}

export type CommentPatch = Partial<Pick<CommentFrameData, 'x' | 'y' | 'w' | 'h' | 'title' | 'content' | 'color' | 'moveContents'>>;
export type CommentCommand = 'fit' | 'delete';
export interface CommentFrameActions {
    select: (id: string) => void;
    update: (id: string, patch: CommentPatch) => void;
    command: (id: string, command: CommentCommand) => void;
}
