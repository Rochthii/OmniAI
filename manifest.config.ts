import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'OmniAI - Side Companion',
  version: '1.0.0',
  description: 'Lightweight Split-Screen Side Panel Companion for ChatGPT, Claude, Gemini & DeepSeek',
  action: {
    default_title: 'Toggle OmniAI Side Panel',
    default_icon: {
      '16': 'icons/icon-16.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png',
    },
  },
  icons: {
    '16': 'icons/icon-16.png',
    '48': 'icons/icon-48.png',
    '128': 'icons/icon-128.png',
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  side_panel: {
    default_path: 'sidepanel.html',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/content-script.ts'],
      run_at: 'document_end',
    },
    {
      matches: [
        'https://chatgpt.com/*',
        'https://*.chatgpt.com/*',
        'https://claude.ai/*',
        'https://*.claude.ai/*',
        'https://chat.deepseek.com/*',
        'https://*.deepseek.com/*',
        'https://chat.qwenlm.ai/*',
        'https://*.qwenlm.ai/*',
        'https://chat.qwen.ai/*',
        'https://*.qwen.ai/*',
        'https://gemini.google.com/*',
        'https://translate.google.com/*',
      ],
      js: ['src/automation/subframe-optimizer.ts'],
      run_at: 'document_start',
      all_frames: true,
    },
  ],
  commands: {
    _execute_side_panel: {
      suggested_key: {
        default: 'Alt+Shift+S',
        windows: 'Alt+Shift+S',
        mac: 'Alt+Shift+S',
      },
      description: 'Toggle OmniAI Side Panel',
    },
    toggle_sidepanel: {
      suggested_key: {
        default: 'Alt+S',
        windows: 'Alt+S',
        mac: 'Alt+S',
      },
      description: 'Quick Toggle Side Panel (Alt+S)',
    },
    toggle_hud: {
      suggested_key: {
        default: 'Alt+Q',
        windows: 'Alt+Q',
        mac: 'Alt+Q',
      },
      description: 'Open OmniAI Spotlight',
    },
  },
  declarative_net_request: {
    rule_resources: [
      {
        id: 'ruleset_1',
        enabled: true,
        path: 'rules/strip_headers.json',
      },
    ],
  },
  permissions: [
    'sidePanel',
    'storage',
    'activeTab',
    'windows',
    'tabs',
    'webNavigation',
    'clipboardWrite',
    'declarativeNetRequest',
  ],
  host_permissions: [
    '<all_urls>',
  ],
});
