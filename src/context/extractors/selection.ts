export interface SelectionResult {
  text: string;
  isCode: boolean;
  elementTagName?: string;
  parentSelector?: string;
}

export function extractSelection(): SelectionResult {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return { text: '', isCode: false };
  }

  const text = selection.toString().trim();
  if (!text) {
    return { text: '', isCode: false };
  }

  let isCode = false;
  let elementTagName = '';
  let parentSelector = '';

  const anchorNode = selection.anchorNode;
  const parentElement = anchorNode
    ? anchorNode.nodeType === Node.ELEMENT_NODE
      ? (anchorNode as HTMLElement)
      : anchorNode.parentElement
    : null;

  if (parentElement) {
    elementTagName = parentElement.tagName.toLowerCase();
    
    // Check if within code, pre, or common code editors
    if (
      elementTagName === 'code' ||
      elementTagName === 'pre' ||
      parentElement.closest('pre, code, .highlight, .blob-code, .monaco-editor, .cm-editor')
    ) {
      isCode = true;
    }

    if (parentElement.id) {
      parentSelector = `#${parentElement.id}`;
    } else if (parentElement.className && typeof parentElement.className === 'string') {
      parentSelector = `.${parentElement.className.split(' ').filter(Boolean).slice(0, 2).join('.')}`;
    }
  }

  return {
    text,
    isCode,
    elementTagName,
    parentSelector,
  };
}
