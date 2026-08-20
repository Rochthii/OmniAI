import { companionManager } from './companion-manager';
import { providerRegistry } from '../providers/registry';
import { ExtensionMessage } from '../shared/types/messages';

console.log('[OmniAI] Service Worker initialized');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[OmniAI] Extension installed successfully');

  // Ensure side panel is always enabled on install
  if (chrome.sidePanel && chrome.sidePanel.setOptions) {
    chrome.sidePanel.setOptions({ enabled: true, path: 'sidepanel.html' }).catch(() => {});
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROOT CAUSE FIXES (v0.8.9):
//
// BUG 1 (FIXED): Xung đột double-call
//   TRƯỚC: setPanelBehavior({ openPanelOnActionClick: true }) + chrome.action.onClicked
//   → Chrome nhận 2 lệnh mở cùng lúc → từ chối → KHÔNG MỞ ĐƯỢC
//   SAU: Dùng manifest _execute_side_panel (Chrome native handle toolbar click)
//        → Không cần action.onClicked nữa
//
// BUG 2 (FIXED): Mất User Activation Token vì async tabs.query
//   TRƯỚC: commands.onCommand → await chrome.tabs.query() → sidePanel.open()
//   → tabs.query async làm hết 50ms token → Chrome từ chối → KHÔNG MỞ ĐƯỢC
//   SAU: commands.onCommand nhận tab trực tiếp từ callback (tab param thứ 2)
//        → sidePanel.open() ngay lập tức với windowId đúng → LUÔN MỞ ĐƯỢC
//
// BUG 3 (FIXED): Nút [AI] trên YouTube
//   TRƯỚC: CornerWidget → sendMessage → service worker → tabs.query async → sidePanel.open
//   → Chuỗi relay quá dài, mất User Activation Token trên YouTube CSP
//   SAU: sender.tab.windowId dùng trực tiếp từ message sender → không relay thêm
// ─────────────────────────────────────────────────────────────────────────────

// 🌟 AUTOMATIC SESSION DEEP-LINK TRACKING (webNavigation hook)
// Tracks exact conversation URLs (e.g. /c/123456) across ChatGPT, Qwen, Claude, DeepSeek
if (chrome.webNavigation && chrome.webNavigation.onHistoryStateUpdated) {
  const saveSubframeUrl = (details: { url: string; frameId: number }) => {
    const url = details.url;
    if (!url || url === 'about:blank') return;

    let siteId: string | null = null;
    if (url.includes('chatgpt.com')) siteId = 'chatgpt';
    else if (url.includes('claude.ai')) siteId = 'claude';
    else if (url.includes('deepseek.com')) siteId = 'deepseek';
    else if (url.includes('qwen')) siteId = 'qwen';
    else if (url.includes('gemini.google.com')) siteId = 'gemini';
    else if (url.includes('translate.google.com')) siteId = 'translate';

    if (siteId) {
      chrome.storage.local.get(['omniai_last_site_urls'], (res) => {
        const currentUrls = res.omniai_last_site_urls || {};
        if (currentUrls[siteId] !== url) {
          currentUrls[siteId] = url;
          chrome.storage.local.set({ omniai_last_site_urls: currentUrls });
        }
      });
    }
  };

  chrome.webNavigation.onHistoryStateUpdated.addListener(saveSubframeUrl);
  chrome.webNavigation.onCommitted.addListener(saveSubframeUrl);
}

// Ensure side panel is always enabled globally at startup
if (chrome.sidePanel && chrome.sidePanel.setOptions) {
  chrome.sidePanel.setOptions({ enabled: true, path: 'sidepanel.html' }).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE OPEN FUNCTION
// RULE: windowId/tabId MUST come from the event callback context directly.
//       Never call chrome.tabs.query() before sidePanel.open()
//       — it consumes the 50ms User Activation Token.
// ─────────────────────────────────────────────────────────────────────────────
async function openSidePanelFor(windowId?: number, tabId?: number) {
  if (!chrome.sidePanel || typeof chrome.sidePanel.open !== 'function') {
    console.warn('[OmniAI] sidePanel API not available');
    return;
  }

  // Safety net: always re-enable before opening
  chrome.sidePanel.setOptions({ enabled: true, path: 'sidepanel.html' }).catch(() => {});

  // Prefer windowId (broader scope, more reliable)
  if (windowId) {
    try {
      await chrome.sidePanel.open({ windowId });
      console.log('[OmniAI] ✅ Side panel opened via windowId:', windowId);
      return;
    } catch (e) {
      console.warn('[OmniAI] sidePanel.open(windowId) failed, trying tabId:', e);
    }
  }

  if (tabId) {
    try {
      await chrome.sidePanel.open({ tabId });
      console.log('[OmniAI] ✅ Side panel opened via tabId:', tabId);
    } catch (e) {
      console.warn('[OmniAI] sidePanel.open(tabId) failed:', e);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// KEYBOARD SHORTCUT HANDLER
// chrome.commands.onCommand callback provides `tab` as 2nd argument — use it!
// No need for chrome.tabs.query — preserves User Activation Token.
// ─────────────────────────────────────────────────────────────────────────────
chrome.commands.onCommand.addListener(async (command, tab) => {
  console.log('[OmniAI] Command received:', command, '| tab:', tab?.id, 'win:', tab?.windowId);

  if (
    command === '_execute_side_panel' ||
    command === 'open_sidepanel' ||
    command === 'toggle_sidepanel'
  ) {
    // ✅ tab comes from Chrome callback — no async needed, token preserved
    await openSidePanelFor(tab?.windowId, tab?.id);

  } else if (command === 'toggle_hud' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'TRIGGER_HUD' }).catch(() => {
      console.log('[OmniAI] Tab not ready for HUD message');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE HANDLER (from content scripts: CornerWidget click, etc.)
// sender.tab is populated by Chrome automatically — use it directly.
// ─────────────────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ type: 'PONG' });
    return true;
  }

  if (
    message.type === 'OPEN_COMPANION_WINDOW' ||
    message.type === 'TOGGLE_SIDEBAR' ||
    message.type === 'TOGGLE_COMPANION_WINDOW'
  ) {
    // ✅ Use sender.tab directly — no relay, no async query needed
    openSidePanelFor(sender.tab?.windowId, sender.tab?.id)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: String(err) }));
    return true;
  }

  if (message.type === 'SEND_PROMPT_TO_COMPANION') {
    (async () => {
      const formattedPrompt = message.payload?.formattedPrompt;
      const targetUrl = message.payload?.targetUrl;
      const providerId = message.payload?.providerId || 'chatgpt';
      const provider = providerRegistry.get(providerId);
      const finalUrl = targetUrl || provider?.baseUrl || 'https://chatgpt.com/';

      let targetWindowId = sender.tab?.windowId;
      if (!targetWindowId) {
        const currentWin = await chrome.windows.getCurrent();
        targetWindowId = currentWin.id;
      }

      if (chrome.sidePanel && chrome.sidePanel.open && targetWindowId) {
        try {
          await chrome.sidePanel.open({ windowId: targetWindowId });
        } catch {
          await companionManager.openOrFocusCompanion(finalUrl, formattedPrompt);
        }
      } else {
        await companionManager.openOrFocusCompanion(finalUrl, formattedPrompt);
      }

      sendResponse({ success: true });
    })().catch((err) => {
      sendResponse({ success: false, error: String(err) });
    });
    return true;
  }
});
