import { captureCurrentContext } from '../context/context-engine';
import {
  mountSpotlightHUD,
  mountCompanionTopBar,
  mountPersistentDock,
  unmountOmniUI,
} from '../ui/shadow-root';
import { injectIntoChatGPT } from '../automation/providers/chatgpt-injector';
import { checkPrivacyGuard } from '../privacy/guard';
import { getUserPreferences } from '../shared/storage';
import { copyToClipboard } from '../automation/clipboard';
import { sendToBackground } from '../shared/messaging/bus';

console.log('[OmniAI] Content Script loaded on', window.location.href);

let isHUDOpen = false;

function triggerHUD() {
  const target = document.activeElement as HTMLElement | null;
  const privacy = checkPrivacyGuard(target);
  if (!privacy.allowed) {
    console.warn('[OmniAI] Privacy Guard blocked activation:', privacy.reason);
    return;
  }

  isHUDOpen = true;
  const context = captureCurrentContext();
  mountSpotlightHUD(context);
}

function getCleanPageContent(): { title: string; url: string; content: string } {
  const title = document.title || 'Trang web';
  const url = window.location.href;

  const mainEl = (document.querySelector('article, [role="main"], main, #content, .content, .post, .article') ||
    document.body) as HTMLElement;

  const clone = mainEl.cloneNode(true) as HTMLElement;
  const unwanted = clone.querySelectorAll('script, style, nav, footer, header, noscript, svg, [role="navigation"]');
  unwanted.forEach((el) => el.remove());

  const content = (clone.innerText || clone.textContent || '').trim().replace(/\n{3,}/g, '\n\n').slice(0, 30000);

  return { title, url, content };
}

// Initialize Persistent Launcher Dock
async function initializeContentScript() {
  // Never run widget inside iframes or subframes
  if (window.self !== window.top) {
    return;
  }

  const prefs = await getUserPreferences();
  const currentHostname = window.location.hostname.toLowerCase();

  const isBlacklisted = prefs.excludedDomains && prefs.excludedDomains.some((d) => currentHostname.includes(d.toLowerCase()));
  if (isBlacklisted) {
    console.log('[OmniAI] Current site is blacklisted in user settings. Skipping dock.');
    return;
  }

  const isAIOrTranslateSite =
    currentHostname.includes('chatgpt.com') ||
    currentHostname.includes('claude.ai') ||
    currentHostname.includes('deepseek.com') ||
    currentHostname.includes('gemini.google.com') ||
    currentHostname.includes('translate.google.com') ||
    currentHostname.includes('qwenlm.ai') ||
    currentHostname.includes('qwen.ai') ||
    currentHostname.includes('perplexity.ai');

  // 🌟 Smart Exclude: If user is already on ChatGPT, Claude, Gemini etc., skip widget to keep native AI UI 100% clean!
  if (isAIOrTranslateSite) {
    return;
  }

  const enableCorner = prefs.enableCornerWidget !== false;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountPersistentDock(enableCorner));
  } else {
    mountPersistentDock(enableCorner);
  }
}

initializeContentScript();

// Global Hotkey Interceptor: Alt+Z / Alt+S (Toggle Native Side Panel) & Alt+Q (Spotlight HUD)
function handleGlobalKeydown(event: KeyboardEvent) {
  const key = event.key?.toLowerCase() || '';
  const code = event.code || '';

  const isZ = key === 'z' || code === 'KeyZ' || event.keyCode === 90;
  const isS = key === 's' || code === 'KeyS' || event.keyCode === 83;
  const isQ = key === 'q' || code === 'KeyQ' || event.keyCode === 81;

  // Alt + Z hoặc Alt + S -> Bật/Tắt (Toggle) Native Side Panel
  if (event.altKey && (isZ || isS)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    sendToBackground({ type: 'OPEN_COMPANION_WINDOW' });
    return;
  }

  // Alt + Q -> Mở Spotlight HUD
  if (event.altKey && isQ) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    triggerHUD();
    return;
  }
}

window.addEventListener('keydown', handleGlobalKeydown, { capture: true, passive: false });

// Message Listener
chrome.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
  if (message.type === 'TRIGGER_HUD') {
    triggerHUD();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'TOGGLE_SIDEBAR' || message.type === 'OPEN_COMPANION_WINDOW') {
    sendToBackground({ type: 'OPEN_COMPANION_WINDOW' });
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'GET_TAB_INFO') {
    sendResponse({
      title: document.title || 'Trang web',
      url: window.location.href,
    });
    return true;
  }

  if (message.type === 'GET_PAGE_CONTEXT') {
    getUserPreferences().then((prefs) => {
      const { title, url, content } = getCleanPageContent();
      const actionType = message.action || 'summary';

      let promptHeader = prefs.promptPresets?.summaryPrompt || 'Please summarize the key points of the following webpage:';
      if (actionType === 'explain') {
        promptHeader = prefs.promptPresets?.explainPrompt || 'Please explain the core concepts of the following webpage:';
      } else if (actionType === 'translate') {
        promptHeader = prefs.promptPresets?.translatePrompt || 'Please translate the following content accurately:';
      }

      const formattedPrompt = `[WEBPAGE CONTEXT]:
- Title: ${title}
- URL: ${url}

[PAGE CONTENT]:
${content}

---
Request: ${promptHeader}`;

      copyToClipboard(formattedPrompt).then(() => {
        sendResponse({
          success: true,
          title,
          url,
          formattedPrompt,
          charCount: content.length,
        });
      });
    });

    return true;
  }

  if (message.type === 'EXECUTE_DOM_INJECTION') {
    const prompt = message.payload?.prompt;
    if (prompt) {
      console.log('[OmniAI] Received DOM injection command for ChatGPT');
      injectIntoChatGPT(prompt)
        .then((success) => sendResponse({ success }))
        .catch((err) => sendResponse({ success: false, error: String(err) }));
    } else {
      sendResponse({ success: false, error: 'No prompt to inject' });
    }
    return true;
  }
});

// Fast Dismiss Spotlight HUD on click outside
document.addEventListener('mousedown', (event: MouseEvent) => {
  if (!isHUDOpen) return;

  const target = event.target as HTMLElement | null;
  if (
    target &&
    target.closest('#omniai-root-host, #omniai-companion-topbar-host, #omniai-corner-dock-host')
  ) {
    return;
  }

  unmountOmniUI();
  isHUDOpen = false;
}, { passive: true });


