/**
 * Strip markdown formatting and convert to plain text
 */
export function stripMarkdown(text: string): string {
    let plain = text;

    // Remove code blocks
    plain = plain.replace(/```[\s\S]*?```/g, '');
    plain = plain.replace(/`([^`]+)`/g, '$1');

    // Remove headers (### Header -> Header)
    plain = plain.replace(/^#{1,6}\s+(.+)$/gm, '$1');

    // Remove bold and italic
    plain = plain.replace(/\*\*\*(.+?)\*\*\*/g, '$1');
    plain = plain.replace(/\*\*(.+?)\*\*/g, '$1');
    plain = plain.replace(/\*(.+?)\*/g, '$1');
    plain = plain.replace(/___(.+?)___/g, '$1');
    plain = plain.replace(/__(.+?)__/g, '$1');
    plain = plain.replace(/_(.+?)_/g, '$1');

    // Remove links [text](url) -> text (url)
    plain = plain.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

    // Remove images
    plain = plain.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');

    // Remove horizontal rules
    plain = plain.replace(/^[-*_]{3,}$/gm, '');

    // Remove blockquotes
    plain = plain.replace(/^>\s+/gm, '');

    // Clean up extra whitespace
    plain = plain.replace(/\n{3,}/g, '\n\n');
    plain = plain.trim();

    return plain;
}

/**
 * Format text for Google Docs (plain text with proper spacing)
 */
export function formatForGoogleDocs(text: string): string {
    // Strip markdown first
    let formatted = stripMarkdown(text);

    // Ensure proper paragraph spacing
    formatted = formatted.replace(/\n\n/g, '\n\n');

    // Clean up bullet points (keep simple dash format)
    formatted = formatted.replace(/^[•●○]\s+/gm, '- ');

    return formatted;
}
