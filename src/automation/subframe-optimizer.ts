// OmniAI Subframe Optimizer & Anti-Frame-Busting Engine
// Injected into subframes at document_start to allow ChatGPT, Claude, Gemini, DeepSeek, Qwen to render seamlessly

(function () {
  // 1. Anti-Frame-Busting: Inject script into the page's Main World
  // Bypasses `window.top !== window.self` detection that causes ChatGPT/Gemini/Claude to halt or blank out
  try {
    const antiFrameBustScript = document.createElement('script');
    antiFrameBustScript.textContent = `
      (function() {
        try {
          Object.defineProperty(window, 'top', { get: function() { return window.self; }, configurable: true });
          Object.defineProperty(window, 'parent', { get: function() { return window.self; }, configurable: true });
          Object.defineProperty(window, 'frameElement', { get: function() { return null; }, configurable: true });
        } catch(e) {}
      })();
    `;
    (document.head || document.documentElement).appendChild(antiFrameBustScript);
    antiFrameBustScript.remove();
  } catch (err) {}

  // 2. Qwen Responsive Layout Repairs (for narrow sidebar width)
  const isQwen = window.location.hostname.includes('qwen');
  if (isQwen) {
    const qwenCss = `
      body, #root, #app {
        min-width: 0 !important;
        max-width: 100vw !important;
        width: 100% !important;
        overflow-x: hidden !important;
      }
      [class*="sidebar"], [class*="sider"], [class*="left-nav"], [class*="menu-wrapper"] {
        width: 40px !important;
        min-width: 40px !important;
        max-width: 40px !important;
      }
      main, [class*="main"], [class*="chat-main"], [class*="content-wrapper"] {
        min-width: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 4px 6px !important;
        overflow-x: hidden !important;
      }
      textarea {
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        display: block !important;
        min-height: 40px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        white-space: pre-wrap !important;
        word-break: normal !important;
        box-sizing: border-box !important;
      }
      form, [class*="chat-input"], [class*="sender"], [class*="composer"] {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }
      h1, h2, h3, [class*="welcome"], [class*="title"] {
        font-size: 20px !important;
        text-align: center !important;
        white-space: normal !important;
        word-break: normal !important;
      }
    `;

    const injectQwenStyle = () => {
      if (document.getElementById('omniai-qwen-repair-style')) return;
      const styleEl = document.createElement('style');
      styleEl.id = 'omniai-qwen-repair-style';
      styleEl.textContent = qwenCss;
      (document.head || document.documentElement).appendChild(styleEl);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectQwenStyle);
    } else {
      injectQwenStyle();
    }
  }

  // 3. Real-time Session URL Backup
  const saveCurrentSessionUrl = () => {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
      const url = window.location.href;
      if (!url || url === 'about:blank' || url.startsWith('chrome')) return;

      const host = window.location.hostname.toLowerCase();
      let siteId: string | null = null;
      if (host.includes('chatgpt.com')) siteId = 'chatgpt';
      else if (host.includes('claude.ai')) siteId = 'claude';
      else if (host.includes('deepseek.com')) siteId = 'deepseek';
      else if (host.includes('qwen')) siteId = 'qwen';
      else if (host.includes('gemini.google.com')) siteId = 'gemini';
      else if (host.includes('translate.google.com')) siteId = 'translate';

      if (siteId) {
        chrome.storage.local.get(['omniai_last_site_urls'], (res) => {
          if (chrome.runtime.lastError) return;
          const currentUrls = res?.omniai_last_site_urls || {};
          if (currentUrls[siteId] !== url) {
            currentUrls[siteId] = url;
            chrome.storage.local.set({ omniai_last_site_urls: currentUrls });
          }
        });
      }
    } catch {}
  };

  window.addEventListener('popstate', saveCurrentSessionUrl);
  window.addEventListener('hashchange', saveCurrentSessionUrl);
  setInterval(saveCurrentSessionUrl, 3000);
})();


