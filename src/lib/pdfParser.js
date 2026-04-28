/**
 * Extract text from PDF files
 * Uses a lightweight approach to parse basic text content
 */

export async function extractPDFText(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Basic PDF text extraction - look for text streams
    // This is a simplified approach that works for many PDFs
    let text = '';
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
    
    // PDF text is often contained in text streams, try to extract readable content
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i];
      // Look for printable ASCII and common UTF-8 ranges
      if ((byte >= 32 && byte <= 126) || byte >= 160) {
        text += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13) {
        // Newline
        if (text && !text.endsWith('\n')) {
          text += '\n';
        }
      }
    }
    
    // Clean up the extracted text
    text = text
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\n+/g, '\n') // Remove multiple newlines
      .trim();
    
    // If we got very little text, try a different approach
    if (text.length < 50) {
      return extractPDFTextAdvanced(uint8Array);
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Advanced PDF text extraction using pattern matching
 */
function extractPDFTextAdvanced(uint8Array) {
  let text = '';
  const dataView = new DataView(uint8Array.buffer);
  
  // Look for common PDF text patterns
  // PDF text objects often start with 'BT' and end with 'ET'
  // and contain 'Tj', 'TJ' or 'Td' operators
  
  for (let i = 0; i < uint8Array.length - 1; i++) {
    const byte = uint8Array[i];
    const nextByte = uint8Array[i + 1];
    
    // Look for strings in parentheses or angle brackets
    if ((byte === 40 || byte === 60) && i + 1 < uint8Array.length) { // ( or <
      let j = i + 1;
      let stringContent = '';
      const endByte = byte === 40 ? 41 : 62; // ) or >
      
      while (j < uint8Array.length && uint8Array[j] !== endByte && j - i < 500) {
        const char = uint8Array[j];
        if ((char >= 32 && char <= 126) || (char >= 160 && char <= 255)) {
          stringContent += String.fromCharCode(char);
        }
        j++;
      }
      
      if (stringContent.length > 2) {
        text += stringContent + ' ';
      }
    }
  }
  
  return text.trim() || 'Unable to extract text. Please copy and paste your resume content.';
}

/**
 * Check if file is a valid PDF
 */
export function isPDFFile(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
