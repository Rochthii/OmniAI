import { AIProvider } from './types';
import { OmniContext } from '../context/types';

export class ChatGPTProvider implements AIProvider {
  id = 'chatgpt';
  name = 'ChatGPT Web';
  baseUrl = 'https://chatgpt.com/';
  capabilities = {
    maxContextChars: 30000,
    supportsVision: true,
    supportsAutomation: true,
  };

  formatPrompt(context: OmniContext, userPrompt: string): string {
    const lang = context.metadata?.language || '';
    const title = context.source.title || context.source.domain;
    const url = context.source.url;

    let output = '';

    // If user provided custom prompt, put it first
    if (userPrompt.trim()) {
      output += `${userPrompt.trim()}\n\n`;
    }

    output += `---
### 📌 Ngữ cảnh tham khảo:
- **Nguồn:** [${title}](${url})
- **Loại:** ${context.type}${lang ? ` (${lang})` : ''}

\`\`\`${lang}
${context.content}
\`\`\``;

    return output;
  }
}

export const chatgptProvider = new ChatGPTProvider();
