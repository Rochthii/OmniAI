import { ExtensionMessage } from '../types/messages';

export async function sendToBackground<T = unknown>(message: ExtensionMessage): Promise<T | null> {
  try {
    const response = await chrome.runtime.sendMessage(message);
    return response as T;
  } catch (error) {
    console.warn('[OmniAI] Message sending to background failed:', error);
    return null;
  }
}

export async function sendToTab<T = unknown>(tabId: number, message: ExtensionMessage): Promise<T | null> {
  try {
    const response = await chrome.tabs.sendMessage(tabId, message);
    return response as T;
  } catch (error) {
    console.warn(`[OmniAI] Message sending to tab ${tabId} failed:`, error);
    return null;
  }
}
