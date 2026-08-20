import { AIProvider } from './types';
import { OmniContext } from '../context/types';

export class ClaudeProvider implements AIProvider {
  id = 'claude';
  name = 'Claude Web';
  baseUrl = 'https://claude.ai/new';
  capabilities = {
    maxContextChars: 45000,
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
### 📌 Context Reference:
- **Source:** [${title}](${url})
- **Type:** ${context.type}${lang ? ` (${lang})` : ''}

\`\`\`${lang}
${context.content}
\`\`\``;

    return output;
  }
}

export const claudeProvider = new ClaudeProvider();
