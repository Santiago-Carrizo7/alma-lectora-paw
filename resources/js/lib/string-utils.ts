/**
 * Converts a text string to Title Case (e.g. "romance juvenil" -> "Romance Juvenil").
 */
export function toTitleCase(str: string | null | undefined): string {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Strips HTML tags and entities.
 */
export function stripHtml(html: string | null | undefined): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>?/gm, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
}
