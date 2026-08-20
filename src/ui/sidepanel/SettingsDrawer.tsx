import React, { useState, useEffect } from 'react';
import { UserPreferences, DEFAULT_PREFERENCES } from '../../shared/types/sites';
import { getUserPreferences, saveUserPreferences } from '../../shared/storage';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesUpdated: (prefs: UserPreferences) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  onPreferencesUpdated,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [activeTab, setActiveTab] = useState<'triggers' | 'prompts' | 'blacklist'>('triggers');
  const [newDomain, setNewDomain] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getUserPreferences().then((p) => setPrefs(p));
    }
  }, [isOpen]);

  const showSaved = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  const handleUpdatePref = async (updates: Partial<UserPreferences>) => {
    const updated = { ...prefs, ...updates };
    setPrefs(updated);
    await saveUserPreferences(updates);
    onPreferencesUpdated(updated);
    showSaved();
  };

  const handleUpdatePrompt = async (key: 'summaryPrompt' | 'explainPrompt' | 'translatePrompt', value: string) => {
    const updatedPrompts = { ...prefs.promptPresets, [key]: value };
    const updated = { ...prefs, promptPresets: updatedPrompts };
    setPrefs(updated);
    await saveUserPreferences({ promptPresets: updatedPrompts });
    onPreferencesUpdated(updated);
    showSaved();
  };

  const handleAddExcludedDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanDomain || prefs.excludedDomains.includes(cleanDomain)) return;

    const updatedDomains = [...prefs.excludedDomains, cleanDomain];
    setNewDomain('');
    await handleUpdatePref({ excludedDomains: updatedDomains });
  };

  const handleRemoveExcludedDomain = async (domain: string) => {
    const updatedDomains = prefs.excludedDomains.filter((d) => d !== domain);
    await handleUpdatePref({ excludedDomains: updatedDomains });
  };

  const handleClearCache = () => {
    chrome.storage.local.remove(['omniai_last_loaded_tabs', 'omniai_last_site_urls'], () => {
      showSaved();
      alert('Session cache cleared successfully.');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="omniai-settings-drawer-backdrop" onClick={onClose}>
      <div className="omniai-settings-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="omniai-settings-header">
          <div className="omniai-settings-title">
            <span>Settings</span>
            {savedToast && <span className="omniai-saved-badge">Saved</span>}
          </div>
          <button className="omniai-close-drawer-btn" onClick={onClose}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="omniai-settings-nav">
          <button
            className={`omniai-nav-btn ${activeTab === 'triggers' ? 'active' : ''}`}
            onClick={() => setActiveTab('triggers')}
          >
            Launchers & AI
          </button>
          <button
            className={`omniai-nav-btn ${activeTab === 'prompts' ? 'active' : ''}`}
            onClick={() => setActiveTab('prompts')}
          >
            Prompt Presets
          </button>
          <button
            className={`omniai-nav-btn ${activeTab === 'blacklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('blacklist')}
          >
            Excluded Domains
          </button>
        </div>

        {/* Tab Content */}
        <div className="omniai-settings-content">
          {/* TAB 1: TRIGGERS & DEFAULT AI */}
          {activeTab === 'triggers' && (
            <div className="omniai-settings-section">
              <div className="omniai-setting-item">
                <div className="omniai-setting-label-group">
                  <span className="omniai-item-title">Floating Edge Launcher [AI]</span>
                  <span className="omniai-item-desc">Show quick launcher button on the right edge of web pages</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefs.enableCornerWidget}
                  onChange={(e) => handleUpdatePref({ enableCornerWidget: e.target.checked })}
                />
              </div>

              <div className="omniai-setting-item-column">
                <span className="omniai-item-title">Default AI on Startup:</span>
                <select
                  className="omniai-select"
                  value={prefs.defaultSiteId}
                  onChange={(e) => handleUpdatePref({ defaultSiteId: e.target.value })}
                >
                  {prefs.sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="omniai-cache-box">
                <span className="omniai-item-desc">Reset active tabs and free up browser memory:</span>
                <button className="omniai-clear-btn" onClick={handleClearCache}>
                  Clear Session Cache
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROMPT CUSTOMIZER */}
          {activeTab === 'prompts' && (
            <div className="omniai-settings-section">
              <div className="omniai-prompt-field">
                <label>Summary Prompt Preset:</label>
                <textarea
                  rows={2}
                  value={prefs.promptPresets.summaryPrompt}
                  onChange={(e) => handleUpdatePrompt('summaryPrompt', e.target.value)}
                />
              </div>

              <div className="omniai-prompt-field">
                <label>Explanation Prompt Preset:</label>
                <textarea
                  rows={2}
                  value={prefs.promptPresets.explainPrompt}
                  onChange={(e) => handleUpdatePrompt('explainPrompt', e.target.value)}
                />
              </div>

              <div className="omniai-prompt-field">
                <label>Translation Prompt Preset:</label>
                <textarea
                  rows={2}
                  value={prefs.promptPresets.translatePrompt}
                  onChange={(e) => handleUpdatePrompt('translatePrompt', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: BLACKLIST DOMAINS */}
          {activeTab === 'blacklist' && (
            <div className="omniai-settings-section">
              <span className="omniai-item-desc">
                Automatically disable OmniAI widget on specific sensitive domains:
              </span>

              <form className="omniai-blacklist-form" onSubmit={handleAddExcludedDomain}>
                <input
                  type="text"
                  placeholder="Enter domain (e.g. figma.com, bank.com)"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
                <button type="submit">+ Add</button>
              </form>

              <div className="omniai-domain-chips">
                {prefs.excludedDomains.map((dom) => (
                  <span key={dom} className="omniai-domain-chip">
                    {dom}
                    <span
                      className="omniai-chip-del"
                      onClick={() => handleRemoveExcludedDomain(dom)}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
