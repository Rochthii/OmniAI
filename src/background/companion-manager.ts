export class CompanionManager {
  private companionWindowId: number | null = null;
  private companionTabId: number | null = null;
  private pendingPrompt: string | null = null;
  private idleTimeoutId: any = null;

  // Auto-sleep after 20 minutes of inactivity to reclaim RAM
  private readonly IDLE_SLEEP_MS = 20 * 60 * 1000;

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    chrome.windows.onRemoved.addListener((windowId) => {
      if (windowId === this.companionWindowId) {
        this.clearIdleTimer();
        this.companionWindowId = null;
        this.companionTabId = null;
        this.pendingPrompt = null;
      }
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (tabId === this.companionTabId && changeInfo.status === 'complete' && this.pendingPrompt) {
        this.deliverPromptToTab(tabId, this.pendingPrompt);
      }
    });
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimeoutId = setTimeout(() => {
      this.discardCompanionTab();
    }, this.IDLE_SLEEP_MS);
  }

  private clearIdleTimer(): void {
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }

  private async discardCompanionTab(): Promise<void> {
    if (this.companionTabId) {
      try {
        console.log('[OmniAI Memory Saver] Discarding inactive Mini Companion tab to free RAM...');
        if (chrome.tabs.discard) {
          await chrome.tabs.discard(this.companionTabId);
        }
      } catch (err) {
        console.warn('[OmniAI Memory Saver] Tab discard note:', err);
      }
    }
  }

  async openOrFocusCompanion(
    targetUrl: string = 'https://chatgpt.com/',
    promptToSend?: string
  ): Promise<{ windowId: number; tabId: number }> {
    this.resetIdleTimer();

    if (promptToSend) {
      this.pendingPrompt = promptToSend;
    }

    // 1. If companion window is already open, focus it and update URL
    if (this.companionWindowId !== null) {
      try {
        const win = await chrome.windows.get(this.companionWindowId);
        if (win && win.id) {
          await chrome.windows.update(win.id, { focused: true });

          if (this.companionTabId) {
            const currentTab = await chrome.tabs.get(this.companionTabId);
            if (currentTab && targetUrl && !currentTab.url?.startsWith(targetUrl.split('?')[0])) {
              await chrome.tabs.update(this.companionTabId, { url: targetUrl });
            } else if (promptToSend) {
              this.deliverPromptToTab(this.companionTabId, promptToSend);
            }
          }
          return { windowId: win.id, tabId: this.companionTabId || 0 };
        }
      } catch (err) {
        this.companionWindowId = null;
        this.companionTabId = null;
      }
    }

    // 2. Calculate coordinates dynamically relative to the user's CURRENT active browser window
    let width = 480;
    let height = 750;
    let left = 800;
    let top = 50;

    try {
      const currentWin = await chrome.windows.getLastFocused();
      if (currentWin && currentWin.width && currentWin.height) {
        // Size window appropriately
        width = Math.min(480, Math.max(380, Math.floor(currentWin.width * 0.38)));
        height = Math.max(600, currentWin.height - 40);
        top = Math.max(0, (currentWin.top ?? 0) + 20);
        // Position flush to the right of the current window
        left = Math.max(0, (currentWin.left ?? 0) + currentWin.width - width);
      }
    } catch (e) {
      console.warn('[OmniAI] Could not get current window bounds:', e);
    }

    console.log(`[OmniAI] Opening companion window at (${left}, ${top}) with size ${width}x${height}`);

    try {
      const newWindow = await chrome.windows.create({
        url: targetUrl || 'https://chatgpt.com/',
        type: 'popup',
        width,
        height,
        left,
        top,
        focused: true,
      });

      if (newWindow && newWindow.id) {
        this.companionWindowId = newWindow.id;
        if (newWindow.tabs && newWindow.tabs[0] && newWindow.tabs[0].id) {
          this.companionTabId = newWindow.tabs[0].id;
        }
        return { windowId: newWindow.id, tabId: this.companionTabId || 0 };
      }
    } catch (createErr) {
      console.warn('[OmniAI] Popup window creation failed, falling back to normal window/tab:', createErr);
      // Fallback: create normal window or open tab
      const fallbackTab = await chrome.tabs.create({ url: targetUrl || 'https://chatgpt.com/' });
      return { windowId: fallbackTab.windowId || 0, tabId: fallbackTab.id || 0 };
    }

    throw new Error('Failed to create companion window');
  }

  private async deliverPromptToTab(tabId: number, prompt: string): Promise<void> {
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'EXECUTE_DOM_INJECTION',
        payload: { prompt },
      });
      this.pendingPrompt = null;
    } catch (e) {
      console.log('[OmniAI] Pending injection until companion page DOM is ready');
    }
  }

  getPendingPrompt(): string | null {
    const p = this.pendingPrompt;
    this.pendingPrompt = null;
    return p;
  }
}

export const companionManager = new CompanionManager();
