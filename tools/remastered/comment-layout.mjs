// CommentFrame renders 12px text at 1.45 line height, below a 36px header.
// Estimate conservatively so saved examples fit without measuring in a browser.
const HEADER_HEIGHT = 36;
const BODY_PADDING = 28;
const BORDER_HEIGHT = 2;
const LINE_HEIGHT = 12 * 1.45;
const EXTRA_HEIGHT = 18;

function characterWidth(character) {
    if (character === '\t') return 32;
    if (/\s/u.test(character)) return 4;
    if (/[ilI.,'`:;!|]/u.test(character)) return 4;
    if (/[mwMW@%&]/u.test(character)) return 12;
    if (/[A-Z]/u.test(character)) return 8.5;
    if (/[a-z]/u.test(character)) return 7.2;
    return character.codePointAt(0) < 128 ? 8 : 14;
}

function wrappedLines(paragraph, availableWidth) {
    let lines = 1, used = 0;
    for (const token of paragraph.match(/\S+|[^\S\r\n]+/gu) ?? []) {
        const characters = [...token];
        const width = characters.reduce((sum, character) => sum + characterWidth(character), 0);
        if (width <= availableWidth) {
            if (used && used + width > availableWidth) { lines++; used = 0; }
            used += width;
            continue;
        }
        // overflow-wrap:anywhere splits a long URL, identifier, or other token.
        if (used) { lines++; used = 0; }
        for (const character of characters) {
            const width = characterWidth(character);
            if (used && used + width > availableWidth) { lines++; used = 0; }
            used += width;
        }
    }
    return lines;
}

/** Saved lesson comment rectangle; preserve paragraphs and explicit blank lines.
 * Width estimates include room for differences between the supported UI fonts.
 */
export function lessonCommentSize(content, width = 900) {
    const w = Number.isFinite(width) && width > 0 ? Math.max(96, Math.ceil(width)) : 900;
    // Subtract the two borders and 12px left/right padding, then keep a font margin.
    const availableWidth = (w - 26) / 1.12;
    const lines = String(content ?? '').split(/\r\n?|\n/u)
        .reduce((sum, paragraph) => sum + wrappedLines(paragraph, availableWidth), 0);
    const h = Math.max(180, Math.ceil(HEADER_HEIGHT + BODY_PADDING + BORDER_HEIGHT + EXTRA_HEIGHT + lines * LINE_HEIGHT));
    return { w, h };
}
