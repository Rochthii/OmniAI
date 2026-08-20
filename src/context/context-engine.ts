import { OmniContext, ContextType } from './types';
import { extractSourceMetadata } from './extractors/metadata';
import { extractSelection } from './extractors/selection';
import { detectLanguage } from './extractors/language-detector';

export const DEFAULT_MAX_BUDGET_CHARS = 25000;

export function captureCurrentContext(maxChars: number = DEFAULT_MAX_BUDGET_CHARS): OmniContext {
  const metadata = extractSourceMetadata();
  const selection = extractSelection();
  
  let rawContent = selection.text;
  let contextType: ContextType = selection.isCode ? 'code' : 'selection';

  // If no selection, capture page excerpt
  if (!rawContent) {
    const mainEl = (document.querySelector('article, main, #content, .content, .post') || document.body) as HTMLElement | null;
    rawContent = mainEl && mainEl.innerText ? mainEl.innerText.slice(0, maxChars) : '';
    contextType = 'article';
  }

  const originalCharCount = rawContent.length;
  const isTruncated = originalCharCount > maxChars;
  const finalContent = isTruncated ? rawContent.slice(0, maxChars) : rawContent;
  const charCount = finalContent.length;
  const estimatedTokens = Math.ceil(charCount / 3.5);

  const detectedLang = detectLanguage(finalContent, selection.isCode);

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: Date.now(),
    source: metadata,
    type: contextType,
    metadata: {
      language: detectedLang,
      selectorPath: selection.parentSelector,
    },
    content: finalContent,
    metrics: {
      charCount,
      estimatedTokens,
      isTruncated,
      originalCharCount: isTruncated ? originalCharCount : undefined,
    },
  };
}
