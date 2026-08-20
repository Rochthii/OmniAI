import { OmniContext } from '../../context/types';

export type MessageType =
  | 'PING'
  | 'PONG'
  | 'OPEN_COMPANION_WINDOW'
  | 'TOGGLE_COMPANION_WINDOW'
  | 'TOGGLE_SIDEBAR'
  | 'SEND_PROMPT_TO_COMPANION'
  | 'EXECUTE_DOM_INJECTION'
  | 'INJECTION_RESULT'
  | 'COPY_CLIPBOARD_FALLBACK';

export interface BaseMessage<T extends MessageType, P = undefined> {
  type: T;
  payload?: P;
}

export type OpenCompanionMessage = BaseMessage<
  'OPEN_COMPANION_WINDOW',
  {
    url?: string;
  }
>;

export type SendPromptToCompanionMessage = BaseMessage<
  'SEND_PROMPT_TO_COMPANION',
  {
    formattedPrompt: string;
    context: OmniContext;
    providerId: string;
    targetUrl?: string;
  }
>;

export type ExecuteDomInjectionMessage = BaseMessage<
  'EXECUTE_DOM_INJECTION',
  {
    prompt: string;
  }
>;

export type InjectionResultMessage = BaseMessage<
  'INJECTION_RESULT',
  {
    success: boolean;
    error?: string;
  }
>;

export type ExtensionMessage =
  | BaseMessage<'PING'>
  | BaseMessage<'PONG'>
  | OpenCompanionMessage
  | BaseMessage<'TOGGLE_COMPANION_WINDOW'>
  | BaseMessage<'TOGGLE_SIDEBAR'>
  | SendPromptToCompanionMessage
  | ExecuteDomInjectionMessage
  | InjectionResultMessage
  | BaseMessage<'COPY_CLIPBOARD_FALLBACK', { text: string }>;

