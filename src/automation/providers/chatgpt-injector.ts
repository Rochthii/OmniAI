export async function injectIntoChatGPT(promptText: string, timeoutMs: number = 4000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    // Selectors for ChatGPT input
    const textarea = document.querySelector<HTMLElement>(
      '#prompt-textarea, textarea[data-id="root"], div[contenteditable="true"]'
    );

    if (textarea) {
      textarea.focus();

      if (textarea.tagName.toLowerCase() === 'textarea') {
        const nativeTextArea = textarea as HTMLTextAreaElement;
        nativeTextArea.value = promptText;
        nativeTextArea.dispatchEvent(new Event('input', { bubbles: true }));
        nativeTextArea.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } else {
        // ProseMirror / Lexical contenteditable div
        // Use document.execCommand('insertText') to trigger React/ProseMirror state change
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(textarea);
        selection?.removeAllRanges();
        selection?.addRange(range);

        const inserted = document.execCommand('insertText', false, promptText);
        if (inserted) {
          textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
          return true;
        }

        // Fallback DOM assignment
        textarea.innerText = promptText;
        textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
        return true;
      }
    }

    // Wait 200ms before next poll
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return false;
}
