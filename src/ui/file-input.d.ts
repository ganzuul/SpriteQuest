import type { Result } from '../workflow/types.js';
export interface FileInputSnapshot { fileName: string; content: string; loaded: true; }
export function readTextFile(file: File): Promise<Result<FileInputSnapshot>>;
