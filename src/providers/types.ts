import { OmniContext } from '../context/types';

export interface ProviderCapabilities {
  maxContextChars: number;
  supportsVision: boolean;
  supportsAutomation: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  capabilities: ProviderCapabilities;
  formatPrompt(context: OmniContext, userPrompt: string): string;
}
