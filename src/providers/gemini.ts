import { AIProvider } from './types';
import { OmniContext } from '../context/types';

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Gemini Web';
  baseUrl = 'https://gemini.google.com/app';
  capabilities = {
    maxContextChars: 50000,
    supportsVision: true,
    supportsAutomation: true,
  };

  formatPrompt(context: OmniContext, userPrompt: string): string {
    const lang = context.metadata?.language || '';
    const title = context.source.title || context.source.domain;
    const url = context.source.url;

    let output = '';

    if (userPrompt.trim()) {
      output += `${userPrompt.trim()}\n\n`;
    }

    output += `---
### 📌 Ngữ cảnh tham khảo:
- **Nguồn:** [${title}](${url})
- **Định dạng:** ${context.type}${lang ? ` (${lang})` : ''}

\`\`\`${lang}
${context.content}
\`\`\``;

    return output;
  }
}

export const geminiProvider = new GeminiProvider();
