/**
 * LLM Input Sanitization
 * Prevents prompt injection attacks by sanitizing user inputs
 */

/**
 * Sanitize text input for LLM processing
 * Removes or escapes potentially dangerous patterns
 */
export function sanitizeForLLM(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim excessive whitespace
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Limit length to prevent token exhaustion attacks
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  // Remove common prompt injection patterns
  const dangerousPatterns = [
    // System prompt attempts
    /\bsystem\s*:/gi,
    /\bassistant\s*:/gi,
    /\buser\s*:/gi,

    // Instruction override attempts
    /\bignore\s+(previous|above|all)\s+(instructions|prompts?)/gi,
    /\bforget\s+(previous|above|all)\s+(instructions|prompts?)/gi,
    /\bdisregard\s+(previous|above|all)\s+(instructions|prompts?)/gi,

    // Role-playing attempts
    /\byou\s+are\s+now\b/gi,
    /\bpretend\s+you\s+are\b/gi,
    /\bact\s+as\b/gi,

    // Common jailbreak attempts
    /\bDAN\s+mode\b/gi,
    /\bjailbreak\b/gi,
  ];

  // Replace dangerous patterns with sanitized version
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, match => {
      // Replace with escaped version
      return `[REMOVED: ${match.substring(0, 20)}...]`;
    });
  });

  // Remove excessive newlines (more than 3 consecutive)
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');

  // Remove Unicode control characters except common ones (tab, newline, carriage return)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  return sanitized;
}

/**
 * Sanitize an object containing multiple text fields
 * Recursively sanitizes all string values
 */
export function sanitizePayloadForLLM(payload: any): any {
  if (!payload) {
    return payload;
  }

  if (typeof payload === 'string') {
    return sanitizeForLLM(payload);
  }

  if (Array.isArray(payload)) {
    return payload.map(item => sanitizePayloadForLLM(item));
  }

  if (typeof payload === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(payload)) {
      sanitized[key] = sanitizePayloadForLLM(value);
    }
    return sanitized;
  }

  return payload;
}

/**
 * Validate that the input doesn't contain excessive repetition
 * (a common token exhaustion attack)
 */
export function validateNoExcessiveRepetition(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return true;
  }

  // Check for repeated words (more than 10 times)
  const words = input.toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();

  for (const word of words) {
    if (word.length < 3) continue; // Skip short words
    const count = (wordCounts.get(word) || 0) + 1;
    wordCounts.set(word, count);

    if (count > 10) {
      return false; // Excessive repetition detected
    }
  }

  // Check for repeated characters (more than 50 consecutive)
  const charRepetition = /(.)\1{50,}/;
  if (charRepetition.test(input)) {
    return false;
  }

  return true;
}
