export interface WebSiteConfig {
  id: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  isCustom?: boolean;
  isAiChat?: boolean;
}

export interface PromptPresets {
  summaryPrompt: string;
  explainPrompt: string;
  translatePrompt: string;
}

export interface UserPreferences {
  defaultSiteId: string;
  enableFloatingButton: boolean;
  enableCornerWidget: boolean;
  excludedDomains: string[];
  promptPresets: PromptPresets;
  sites: WebSiteConfig[];
}

export const DEFAULT_PROMPT_PRESETS: PromptPresets = {
  summaryPrompt: 'Please provide a clear and concise summary of the core concepts from the following content:',
  explainPrompt: 'Please explain the following content or code in detail with intuitive examples:',
  translatePrompt: 'Please translate the following content accurately and naturally:',
};

export const DEFAULT_SITES: WebSiteConfig[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    description: 'OpenAI ChatGPT',
    isAiChat: true,
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/new',
    description: 'Anthropic Claude',
    isAiChat: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://chat.deepseek.com/',
    description: 'DeepSeek Chat',
    isAiChat: true,
  },
  {
    id: 'qwen',
    name: 'Qwen',
    url: 'https://chat.qwenlm.ai/',
    description: 'Qwen Chat (Alibaba)',
    isAiChat: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/app',
    description: 'Google Gemini',
    isAiChat: true,
  },
  {
    id: 'translate',
    name: 'Google Translate',
    url: 'https://translate.google.com/?sl=auto&tl=en&text={query}&op=translate',
    description: 'Google Translate',
    isAiChat: false,
  },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultSiteId: 'chatgpt',
  enableFloatingButton: false,
  enableCornerWidget: true,
  excludedDomains: ['bank.com', 'passwords.google.com'],
  promptPresets: DEFAULT_PROMPT_PRESETS,
  sites: DEFAULT_SITES,
};
