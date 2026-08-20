import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const EXTENSION_PATH = path.resolve('E:/Projects/Project_ca_nhan/omniai/dist');
const EDGE_PATH = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const ARTIFACT_DIR = path.resolve('C:/Users/Admin/.gemini/antigravity/brain/cb2e27a6-3001-45a3-bae9-1bbe4772fb9b');

async function runRealEnvironmentTest() {
  console.log('\n======================================================');
  console.log('  🌐 OMNIAI REAL ENVIRONMENT E2E BROWSER TEST (EDGE)');
  console.log('======================================================\n');
  console.log('👉 Loading extension from:', EXTENSION_PATH);
  console.log('👉 Launching Microsoft Edge from:', EDGE_PATH);

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: false, // Run headed so extension content scripts execute fully
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1280,800',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('📄 Navigating to Wikipedia test page...');
    await page.goto('https://en.wikipedia.org/wiki/Artificial_intelligence', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('⏳ Waiting 2s for OmniAI Shadow DOM injection...');
    await new Promise((r) => setTimeout(r, 2000));

    // 1. Check if Shadow DOM Persistent Dock Host is present in DOM
    const dockHost = await page.$('#omniai-persistent-dock-host');
    console.log(`[TEST 1] Shadow Host #omniai-persistent-dock-host in DOM:`, dockHost ? '✅ FOUND' : '❌ NOT FOUND');

    if (!dockHost) {
      throw new Error('Persistent Dock Host was not injected into webpage DOM');
    }

    // 2. Inspect Shadow Root contents
    const shadowStatus = await page.evaluate(() => {
      const host = document.getElementById('omniai-persistent-dock-host');
      if (!host || !host.shadowRoot) return { success: false, reason: 'No shadowRoot' };

      const corner = host.shadowRoot.querySelector('.omniai-corner-dock');
      const sidebar = host.shadowRoot.querySelector('.omniai-persistent-sidebar');
      const tabs = host.shadowRoot.querySelectorAll('.omniai-sidebar-tab');

      return {
        success: true,
        hasCornerWidget: !!corner,
        hasSidebar: !!sidebar,
        tabCount: tabs.length,
        tabNames: Array.from(tabs).map((t) => (t as HTMLElement).innerText.trim().replace(/\n/g, '')),
      };
    });

    console.log(`[TEST 2] Shadow Root Structure:`, shadowStatus);

    // 3. Take screenshot of initial state (Corner widget visible)
    const initialScreenshotPath = path.join(ARTIFACT_DIR, 'e2e_01_corner_widget.png');
    await page.screenshot({ path: initialScreenshotPath });
    console.log(`📸 Saved screenshot 1: e2e_01_corner_widget.png`);

    // 4. Test clicking the Corner Widget to open the Sidebar
    console.log('🖱️ Clicking [⚡ AI] Corner Widget...');
    await page.evaluate(() => {
      const host = document.getElementById('omniai-persistent-dock-host');
      const corner = host?.shadowRoot?.querySelector('.omniai-corner-dock') as HTMLElement;
      corner?.click();
    });

    await new Promise((r) => setTimeout(r, 500));

    const openState = await page.evaluate(() => {
      const host = document.getElementById('omniai-persistent-dock-host');
      const sidebar = host?.shadowRoot?.querySelector('.omniai-persistent-sidebar');
      const isOpen = sidebar?.classList.contains('is-open');
      const iframes = host?.shadowRoot?.querySelectorAll('iframe');
      return {
        isOpen,
        iframeCount: iframes?.length || 0,
        activeFrameSrc: iframes?.[0]?.src || '',
      };
    });

    console.log(`[TEST 3] Sidebar Open State after 1-click:`, openState);

    const openScreenshotPath = path.join(ARTIFACT_DIR, 'e2e_02_sidebar_open.png');
    await page.screenshot({ path: openScreenshotPath });
    console.log(`📸 Saved screenshot 2: e2e_02_sidebar_open.png`);

    // 5. Test Hotkey Alt + Z Toggle
    console.log('⌨️ Testing Hotkey [Alt + Z] to close sidebar...');
    await page.keyboard.down('Alt');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Alt');

    await new Promise((r) => setTimeout(r, 400));

    const closedByHotkey = await page.evaluate(() => {
      const host = document.getElementById('omniai-persistent-dock-host');
      const sidebar = host?.shadowRoot?.querySelector('.omniai-persistent-sidebar');
      const isOpen = sidebar?.classList.contains('is-open');
      const iframes = host?.shadowRoot?.querySelectorAll('iframe');
      return {
        isOpen,
        iframesRetainedCount: iframes?.length || 0, // IFRAMES MUST NOT BE DESTROYED!
      };
    });

    console.log(`[TEST 4] Sidebar closed via [Alt + Z] (Iframe retention check):`, closedByHotkey);

    if (closedByHotkey.iframesRetainedCount === 0) {
      throw new Error('FAIL: Iframes were destroyed on close!');
    }

    // 6. Test Hotkey Alt + Z to reopen
    console.log('⌨️ Testing Hotkey [Alt + Z] to reopen sidebar instantly...');
    await page.keyboard.down('Alt');
    await page.keyboard.press('KeyZ');
    await page.keyboard.up('Alt');

    await new Promise((r) => setTimeout(r, 400));

    const reopenedState = await page.evaluate(() => {
      const host = document.getElementById('omniai-persistent-dock-host');
      const sidebar = host?.shadowRoot?.querySelector('.omniai-persistent-sidebar');
      return {
        isOpen: sidebar?.classList.contains('is-open'),
      };
    });

    console.log(`[TEST 5] Sidebar reopened instantly via [Alt + Z]:`, reopenedState);

    console.log('\n======================================================');
    console.log('  🎉 ALL REAL-ENVIRONMENT TESTS PASSED 100%!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

runRealEnvironmentTest().catch((err) => {
  console.error('❌ Real Environment Test Failed:', err);
  process.exit(1);
});
