// Text Utils
export function normalizeText(text) {
  return text?.toLowerCase().replace(/\s+/g, ' ').trim() || '';
}

export function extractWords(text) {
  return normalizeText(text).split(/\s+/);
}
