export interface SourceMetadata {
  url: string;
  title: string;
  domain: string;
  favicon?: string;
}

export type ContextType = 'selection' | 'code' | 'article' | 'document';

export interface ContextMetrics {
  charCount: number;
  estimatedTokens: number;
  isTruncated: boolean;
  originalCharCount?: number;
}

export interface OmniContext {
  id: string;
  createdAt: number;
  source: SourceMetadata;
  type: ContextType;
  metadata?: {
    language?: string;
    filename?: string;
    selectorPath?: string;
  };
  content: string;
  metrics: ContextMetrics;
}
