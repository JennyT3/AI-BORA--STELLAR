/**
 * Security Utilities
 * 
 * Provides security helper functions for the application.
 */

import DOMPurify from 'dompurify';

// Configure DOMPurify to allow only safe SVG elements
const ALLOWED_TAGS = ['svg', 'path', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'rect', 'g', 'text', 'tspan'];
const ALLOWED_ATTR = ['xmlns', 'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'style', 'class', 'id'];

/**
 * Sanitize HTML/SVG content to prevent XSS attacks.
 * Use this wrapper instead of directly using dangerouslySetInnerHTML.
 * 
 * @param html - The HTML/SVG string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize user-provided icon SVG content.
 * This is specifically for icon rendering where only SVG elements are expected.
 * 
 * @param svgContent - The SVG content to sanitize
 * @returns Sanitized SVG string
 */
export function sanitizeSvg(svgContent: string): string {
  // First, remove any script-like content
  const withoutScripts = svgContent
    . replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, 'data-blocked=');
  
  return DOMPurify.sanitize(withoutScripts, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORCE_BODY: false,
    WHOLE_DOCUMENT: false,
  });
}

/**
 * Check if a string is likely a safe SVG icon.
 * This is a heuristic check, not a guarantee.
 * 
 * @param content - The content to check
 * @returns true if content appears to be a safe SVG icon
 */
export function isSafeIcon(content: string): boolean {
  // Check if content starts with <svg and contains no script tags
  const trimmed = content.trim();
  return (
    trimmed.startsWith('<svg') &&
    trimmed.endsWith('</svg>') &&
    !trimmed.toLowerCase().includes('<script') &&
    !trimmed.toLowerCase().includes('javascript:') &&
    !trimmed.toLowerCase().includes('onload=') &&
    !trimmed.toLowerCase().includes('onerror=')
  );
}