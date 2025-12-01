import { Issue } from '@prisma/client';

/**
 * Generate a standardized filename for a document.
 * Format: {Task ID}-{Task Title}-{Type}-{LLM}-{Seq}.md
 * Example: Task-123-Login_Page-design-claude-1.md
 */
export function generateDocumentFilename(
    issue: Issue,
    type: string,
    llm: string,
    sequence: number,
): string {
    // Sanitize title: remove special chars, replace spaces with underscores
    const sanitizedTitle = issue.title
        .replace(/[^a-zA-Z0-9가-힣\s-_]/g, '') // Remove invalid chars
        .trim()
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 30); // Limit length

    // Sanitize other inputs
    const sanitizedType = type.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const sanitizedLlm = llm.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // Format: {ID}-{Title}-{Type}-{LLM}-{Seq}.md
    // Using issue.id directly might be long (UUID), so we might want to use a shorter identifier if available.
    // But for now, let's use a shortened version of the UUID or just "Task" if we don't have a short ID.
    // If issue has a readable ID (like JIRA-123), use that. Since we use UUIDs, let's use the first 8 chars.
    const shortId = issue.id.substring(0, 8);

    return `${shortId}-${sanitizedTitle}-${sanitizedType}-${sanitizedLlm}-${sequence}.md`;
}
