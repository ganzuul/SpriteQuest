/** Read a selected file into the saved node's portable text snapshot. */
export async function readTextFile(file) {
    if (file.size > 400000) return { ok: false, error: { code: 'FILE_TOO_LARGE', message: 'Choose a file no larger than 400,000 bytes.' } };
    let bytes;
    try { bytes = await file.arrayBuffer(); }
    catch { return { ok: false, error: { code: 'FILE_READ_FAILED', message: 'The selected file could not be read. Choose it again and retry.' } }; }
    let content;
    try { content = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { return { ok: false, error: { code: 'FILE_INVALID_UTF8', message: 'This file is not valid UTF-8 text. Choose a UTF-8 text file.' } }; }
    if (content.length > 100000) return { ok: false, error: { code: 'FILE_CONTENT_TOO_LARGE', message: 'Choose a file containing at most 100,000 UTF-16 code units of text.' } };
    const fileName = file.name.split(/[\\/]/).at(-1).normalize('NFC');
    if (!fileName || fileName.length > 255) return { ok: false, error: { code: 'FILE_NAME_INVALID', message: 'Choose a file with a filename between 1 and 255 characters.' } };
    return { ok: true, data: { fileName, content, loaded: true } };
}
