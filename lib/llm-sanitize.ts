/**
 * LLM Input Sanitization
 * Prevents prompt injection attacks by sanitizing user inputs
 * Implements advanced detection for jailbreak attempts and prompt injection
 */

export interface SanitizationMetrics {
  suspicious: boolean;
  patternsDetected: string[];
  characterRemovals: number;
  contentTruncated: boolean;
}

/**
 * Comprehensive set of dangerous patterns for prompt injection detection
 */
const DANGEROUS_PATTERNS = {
  // System prompt hijacking
  systemPrompt: [
    /\bsystem\s*:\s*/gi,
    /\bassistant\s*:\s*/gi,
    /\buser\s*:\s*/gi,
    /\binstruction\s*:\s*/gi,
    /\badmin\s*:\s*/gi,
  ],

  // Instruction override
  instructionOverride: [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /forget\s+(previous|above|all|prior)\s+(instructions|prompts?|constraints|rules)/gi,
    /disregard\s+(previous|above|all|prior)\s+(instructions|prompts?|constraints|rules)/gi,
    /(override|bypass|disable)\s+(the\s+)?(constraints|rules|guidelines|instructions)/gi,
  ],

  // Role manipulation
  roleManipulation: [
    /\byou\s+are\s+now\b/gi,
    /\bpretend\s+(you\s+are|to be)\b/gi,
    /\bact\s+as\s+(if\s+)?(you\s+are|a)\b/gi,
    /\bfrom\s+now\s+on/gi,
    /\brole\s*:/gi,
  ],

  // Jailbreak attempts
  jailbreak: [
    /\bDAN\s+(mode|prompt)\b/gi,
    /\bjailbreak/gi,
    /\bunrestricted/gi,
    /\bcensorship.*bypass/gi,
    /\b(remove|disable).*safety/gi,
  ],

  // Code injection attempts
  codeInjection: [
    /\beval\s*\(/gi,
    /\bexec\s*\(/gi,
    /\bexecute\s+code/gi,
    /\brun\s+code/gi,
    /```[\s\S]*?```/g, // Code blocks
  ],

  // Meta-prompt attempts
  metaPrompt: [
    /\b(what\s+is\s+your\s+)?(system\s+)?prompt\b/gi,
    /\bshow\s+me\s+the\s+prompt/gi,
    /\breveal\s+(your\s+)?instructions/gi,
    /\btelluler\s+your\s+original\s+prompt/gi,
  ],

  // Data extraction attempts
  dataExtraction: [
    /\b(extract|dump|show|list|export).*(database|data|credentials|secrets)/gi,
    /\b(get|retrieve).*[a-z]*_key\b/gi,
  ],
};

/**
 * Sanitize text input for LLM processing
 * Removes or escapes potentially dangerous patterns
 */
export function sanitizeForLLM(input: string, metrics?: SanitizationMetrics): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();
  let characterRemovals = 0;
  const patternsDetected: string[] = [];

  // Remove null bytes
  const nullByteCount = (sanitized.match(/\0/g) || []).length;
  characterRemovals += nullByteCount;
  sanitized = sanitized.replace(/\0/g, '');

  // Limit length to prevent token exhaustion attacks
  const MAX_LENGTH = 10000;
  const contentTruncated = sanitized.length > MAX_LENGTH;
  if (contentTruncated) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  // Check for dangerous patterns
  for (const [category, patterns] of Object.entries(DANGEROUS_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        patternsDetected.push(category);
        sanitized = sanitized.replace(pattern, `[REMOVED:${category}]`);
      }
    }
  }

  // Remove excessive newlines (more than 3 consecutive)
  const newlineCount = (sanitized.match(/\n{4,}/g) || []).length;
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');
  characterRemovals += newlineCount * 2;

  // Remove Unicode control characters except common ones
  const controlCharCount = (sanitized.match(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g) || []).length;
  characterRemovals += controlCharCount;
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  if (metrics) {
    metrics.suspicious = patternsDetected.length > 0;
    metrics.patternsDetected = [...new Set(patternsDetected)];
    metrics.characterRemovals = characterRemovals;
    metrics.contentTruncated = contentTruncated;
  }

  return sanitized;
}

/**
 * Sanitize an object containing multiple text fields
 * Recursively sanitizes all string values with metrics
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
  const contentLength = input.length;

  for (const word of words) {
    if (word.length < 3) continue; // Skip short words
    const count = (wordCounts.get(word) || 0) + 1;
    wordCounts.set(word, count);

    // Excessive word repetition (word appears >10% of total words)
    if (count > Math.max(10, words.length * 0.1)) {
      return false;
    }
  }

  // Check for repeated characters (more than 50 consecutive)
  const charRepetition = /(.)\1{50,}/;
  if (charRepetition.test(input)) {
    return false;
  }

  // Check for extremely high character repetition ratio
  // If more than 30% of content is repeated characters
  const repeatedCharRatio = (input.match(/(.)\1{3,}/g) || []).reduce((sum, match) => sum + match.length, 0) / contentLength;
  if (repeatedCharRatio > 0.3) {
    return false;
  }

  // Check for suspiciously low entropy (highly repetitive patterns)
  const uniqueChars = new Set(input.toLowerCase()).size;
  const entropyRatio = uniqueChars / Math.min(input.length, 100);
  if (entropyRatio < 0.1) {
    // Very low entropy, likely repetitive spam
    return false;
  }

  return true;
}

/**
 * Analyze payload for security issues
 * Returns detailed metrics about the payload
 */
export function analyzePayloadSecurity(payload: any): {
  isValid: boolean;
  issues: string[];
  metrics: SanitizationMetrics;
} {
  const issues: string[] = [];
  const metrics: SanitizationMetrics = {
    suspicious: false,
    patternsDetected: [],
    characterRemovals: 0,
    contentTruncated: false,
  };

  // Convert payload to string for analysis
  const payloadString = JSON.stringify(payload);

  // Check for dangerous patterns
  if (payloadString.length > 50000) {
    issues.push('Payload exceeds maximum size');
  }

  // Validate no excessive repetition
  if (!validateNoExcessiveRepetition(payloadString)) {
    issues.push('Excessive repetition detected - possible token exhaustion attack');
  }

  // Test sanitization
  sanitizeForLLM(payloadString, metrics);

  if (metrics.suspicious) {
    issues.push(`Dangerous patterns detected: ${metrics.patternsDetected.join(', ')}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    metrics,
  };
}
