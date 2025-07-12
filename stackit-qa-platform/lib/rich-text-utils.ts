/**
 * Utility functions for rich text content processing
 */

/**
 * Strip HTML tags and get plain text content
 * @param html - HTML string
 * @returns Plain text string
 */
export function stripHTML(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return html.replace(/<[^>]*>/g, '').trim()
  }
  
  const tmp = document.createElement("div")
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ""
}

/**
 * Check if HTML content has meaningful text (not just empty tags)
 * @param html - HTML string
 * @returns Boolean indicating if content is valid
 */
export function hasValidContent(html: string): boolean {
  return stripHTML(html).trim().length > 0
}

/**
 * Basic HTML sanitization (for production, use a proper sanitization library like DOMPurify)
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  // This is a basic implementation. For production, use DOMPurify
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Get preview text from HTML content
 * @param html - HTML string
 * @param maxLength - Maximum length of preview
 * @returns Preview text
 */
export function getPreviewText(html: string, maxLength: number = 150): string {
  const plainText = stripHTML(html)
  if (plainText.length <= maxLength) {
    return plainText
  }
  return plainText.substring(0, maxLength).trim() + '...'
}

/**
 * Data structure for storing rich text content in database
 */
export interface RichTextContent {
  html: string        // Full HTML content for display
  plainText: string   // Plain text for search and preview
  preview: string     // Short preview text
}

/**
 * Prepare rich text content for database storage
 * @param html - HTML content from editor
 * @returns Formatted content object
 */
export function prepareContentForStorage(html: string): RichTextContent {
  const sanitizedHTML = sanitizeHTML(html)
  const plainText = stripHTML(sanitizedHTML)
  const preview = getPreviewText(plainText)
  
  return {
    html: sanitizedHTML,
    plainText,
    preview
  }
}
