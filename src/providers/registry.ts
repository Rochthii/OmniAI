import { AIProvider } from './types';
import { chatgptProvider } from './chatgpt';
import { claudeProvider } from './claude';
import { geminiProvider } from './gemini';

export class ProviderRegistry {
  private providers = new Map<string, AIProvider>();

  constructor() {
    this.register(chatgptProvider);
    this.register(claudeProvider);
    this.register(geminiProvider);
  }

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  get(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  getDefault(): AIProvider {
    return this.providers.get('chatgpt') || chatgptProvider;
  }

  getAll(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}

export const providerRegistry = new ProviderRegistry();
