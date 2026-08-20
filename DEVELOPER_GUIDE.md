# 🛠️ OMNIAI — DEVELOPER QUICKSTART & CUSTOMIZATION GUIDE

Welcome to **OmniAI**! This guide walks you through setting up, customizing, and publishing your own AI Side Panel Chrome Extension in under 10 minutes.

---

## ⚡ 1. QUICKSTART (2 Minutes)

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x (or pnpm / yarn)
- Google Chrome, Microsoft Edge, Brave, or Arc Browser

### Installation & Build
```bash
# 1. Install dependencies
npm install

# 2. Build production package
npm run build

# Or run live development mode with Hot Module Replacement (HMR)
npm run dev
```

### Load Extension into Browser
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the `dist/` folder inside this project directory.
5. Press `Alt + S` on your keyboard to instantly toggle the Side Panel!

---

## 🎨 2. HOW TO REBRAND YOUR EXTENSION

### A. Change Extension Name & Description
Open `manifest.config.ts` and update the metadata:
```ts
export default defineManifest({
  name: 'YourCustomAI - Side Companion',
  description: 'Your own custom description here',
  version: '1.0.0',
  ...
});
```

### B. Replace Icons
Replace the icon files in `public/icons/`:
- `public/icons/icon-16.png` (16x16 px)
- `public/icons/icon-48.png` (48x48 px)
- `public/icons/icon-128.png` (128x128 px)
- `public/logo.png` (Used in Spotlight HUD & Settings)

---

## 🌐 3. HOW TO ADD OR MODIFY DEFAULT WEBSITES / AI TABS

Open `src/shared/types/sites.ts` to customize the default tabs:

```ts
export const DEFAULT_SITES: WebSiteConfig[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    isCustom: false,
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/new',
    isCustom: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    isCustom: false,
  },
  {
    id: 'custom_service',
    name: 'My Custom App',
    url: 'https://myapp.example.com/',
    isCustom: true,
  },
];
```

> **Note on Headers/CSP**: If your target site blocks iframe embedding via `X-Frame-Options` or `Content-Security-Policy: frame-ancestors`, add its domain rule in `public/rules/strip_headers.json`.

---

## ⌨️ 4. CUSTOMIZING KEYBOARD SHORTCUTS

Default shortcuts:
- `Alt + S` or `Alt + Z`: Toggle Side Panel (0ms User Activation)
- `Alt + Q`: Open Spotlight Context HUD

To change default shortcuts, edit `manifest.config.ts` under the `commands` section:
```ts
commands: {
  toggle_sidepanel: {
    suggested_key: {
      default: 'Alt+S',
      windows: 'Alt+S',
      mac: 'Alt+S',
    },
    description: 'Toggle Side Panel',
  },
  toggle_hud: {
    suggested_key: {
      default: 'Alt+Q',
      windows: 'Alt+Q',
      mac: 'Alt+Q',
    },
    description: 'Open Spotlight HUD',
  },
}
```

---

## 🚀 5. PUBLISHING TO CHROME WEB STORE

1. Run `npm run build` to generate the latest production bundle in `dist/`.
2. Compress the contents of the `dist/` directory into a `.zip` file:
   *(Make sure to zip the contents inside `dist`, not the `dist` folder itself!)*
3. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
4. Click **New Item** and upload your `.zip` archive.
5. Fill in descriptions, upload promotional screenshots (1280x800 px), and submit for review. (Reviews typically take 24–48 hours).

---

## 💡 SUPPORT & QUESTIONS
If you encounter any issues or need architectural advice, feel free to reach out via your Gumroad purchase receipt!
