import React, { useState, useEffect, useRef } from 'react';
import { OmniContext } from '../../context/types';
import { WebSiteConfig } from '../../shared/types/sites';
import { getUserPreferences, saveUserPreferences } from '../../shared/storage';
import { sendToBackground } from '../../shared/messaging/bus';
import { copyToClipboard } from '../../automation/clipboard';

interface SpotlightModalProps {
  context: OmniContext;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { id: 'explain', label: 'Explain', prompt: 'Please explain the following content or code clearly:' },
  { id: 'translate', label: 'Translate', prompt: 'Please translate the following content accurately:' },
];

export const SpotlightModal: React.FC<SpotlightModalProps> = ({ context, onClose }) => {
  const [sites, setSites] = useState<WebSiteConfig[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('chatgpt');
  const [prompt, setPrompt] = useState('');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Quick Add Site Modal state
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      setSites(prefs.sites);
      setSelectedSiteId(prefs.defaultSiteId || 'chatgpt');
    });

    textareaRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddingSite) {
          setIsAddingSite(false);
        } else {
          onClose();
        }
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSend();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prompt, activeActionId, selectedSiteId, isAddingSite]);

  const currentSite = sites.find((s) => s.id === selectedSiteId) || sites[0] || {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    isAiChat: true,
  };

  const handleActionClick = (action: typeof QUICK_ACTIONS[0]) => {
    if (activeActionId === action.id) {
      setActiveActionId(null);
      setPrompt('');
    } else {
      setActiveActionId(action.id);
      setPrompt(action.prompt);
    }
  };

  const handleAddNewSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteUrl.trim()) return;

    const newSite: WebSiteConfig = {
      id: `custom_${Date.now()}`,
      name: newSiteName.trim(),
      url: newSiteUrl.trim().startsWith('http') ? newSiteUrl.trim() : `https://${newSiteUrl.trim()}`,
      isAiChat: newSiteUrl.includes('chat') || newSiteUrl.includes('ai'),
      isCustom: true,
    };

    const updatedSites = [...sites, newSite];
    setSites(updatedSites);
    setSelectedSiteId(newSite.id);
    await saveUserPreferences({ sites: updatedSites });

    setNewSiteName('');
    setNewSiteUrl('');
    setIsAddingSite(false);
  };

  const handleSend = async () => {
    if (isSending) return;
    setIsSending(true);

    const lang = context.metadata?.language || '';
    const title = context.source.title || context.source.domain;
    const url = context.source.url;

    // 1. Build prompt / query
    let formattedPrompt = '';
    if (prompt.trim()) {
      formattedPrompt += `${prompt.trim()}\n\n`;
    }
    formattedPrompt += `---
### Reference Context:
- Source: [${title}](${url})
- Format: ${context.type}${lang ? ` (${lang})` : ''}

\`\`\`${lang}
${context.content}
\`\`\``;

    // 2. Prepare Target URL (with {query} replacement if applicable)
    let finalTargetUrl = currentSite.url;
    const queryPayload = prompt.trim() ? `${prompt.trim()} ${context.content}` : context.content;

    if (finalTargetUrl.includes('{query}')) {
      finalTargetUrl = finalTargetUrl.replace('{query}', encodeURIComponent(queryPayload.slice(0, 1000)));
    }

    // 3. Always copy prompt to clipboard for safety
    await copyToClipboard(formattedPrompt);
    setToastMessage(`Copied prompt to clipboard and opened ${currentSite.name}`);
    setShowToast(true);

    // 4. Open / Focus Mini Companion Window
    await sendToBackground({
      type: 'SEND_PROMPT_TO_COMPANION',
      payload: {
        formattedPrompt,
        context,
        providerId: currentSite.id,
        targetUrl: finalTargetUrl,
      },
    });

    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 450);
  };

  return (
    <div className="omniai-backdrop" onClick={onClose}>
      <div className="omniai-spotlight" onClick={(e) => e.stopPropagation()}>
        {showToast && <div className="omniai-toast">{toastMessage}</div>}

        {/* Header */}
        <div className="omniai-header">
          <div className="omniai-brand">
            <span className="omniai-logo-badge">OmniAI</span>
            <span>Spotlight</span>
          </div>

          {/* Dynamic Site Tabs */}
          <div className="omniai-provider-tabs">
            {sites.map((site) => (
              <button
                key={site.id}
                className={`omniai-tab-btn ${selectedSiteId === site.id ? 'active' : ''}`}
                onClick={() => setSelectedSiteId(site.id)}
              >
                {site.name}
              </button>
            ))}
            <button
              className="omniai-tab-btn add-btn"
              onClick={() => setIsAddingSite(!isAddingSite)}
              title="Add custom website"
            >
              + Add
            </button>
          </div>

          <button className="omniai-close-btn" onClick={onClose}>
            Esc
          </button>
        </div>

        {/* Quick Add Custom Site Inline Form */}
        {isAddingSite && (
          <form className="omniai-add-site-form" onSubmit={handleAddNewSite}>
            <input
              type="text"
              placeholder="Site name (e.g. Google Translate, DevDocs...)"
              value={newSiteName}
              onChange={(e) => setNewSiteName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="URL (e.g. https://translate.google.com/?text={query})"
              value={newSiteUrl}
              onChange={(e) => setNewSiteUrl(e.target.value)}
              required
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsAddingSite(false)}>Cancel</button>
          </form>
        )}

        {/* Input */}
        <div className="omniai-input-container">
          <textarea
            ref={textareaRef}
            className="omniai-textarea"
            placeholder={`Ask ${currentSite.name} (Ctrl+Enter to send)...`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        {/* Quick Actions */}
        <div className="omniai-quick-actions">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              className={`omniai-action-chip ${activeActionId === action.id ? 'active' : ''}`}
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="omniai-footer">
          <div className="omniai-meta-preview">
            <span className="omniai-badge">{context.source.domain}</span>
            <span>{context.metrics.charCount.toLocaleString()} chars</span>
            <span>~{context.metrics.estimatedTokens} tokens</span>
            {context.metadata?.language && (
              <span className="omniai-badge">{context.metadata.language}</span>
            )}
            {context.metrics.isTruncated && (
              <span className="omniai-badge warning">
                Truncated ({context.metrics.originalCharCount} original)
              </span>
            )}
          </div>

          <button className="omniai-send-btn" onClick={handleSend} disabled={isSending}>
            {isSending ? 'Opening...' : `Open ${currentSite.name}`}
          </button>
        </div>
      </div>
    </div>
  );
};
