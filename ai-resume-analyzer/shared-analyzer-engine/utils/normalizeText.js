/**
 * Text Normalization Utility
 * Cleans and prepares text for analysis.
 */

/**
 * Converts text to lowercase, removes punctuation, and normalizes whitespace.
 * @param {string} text The input string.
 * @returns {string} The normalized string.
 */
export function normalizeText(text = '') {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}