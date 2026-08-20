import React, { useState, useEffect } from 'react';
import { WebSiteConfig } from '../../shared/types/sites';
import { getUserPreferences, saveUserPreferences } from '../../shared/storage';
import { sendToBackground } from '../../shared/messaging/bus';

export const Popup: React.FC = () => {
  const [sites, setSites] = useState<WebSiteConfig[]>([]);
  const [defaultSiteId, setDefaultSiteId] = useState('chatgpt');
  const [enableCornerWidget, setEnableCornerWidget] = useState(true);
  const [saved, setSaved] = useState(false);

  // New site form
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      setSites(prefs.sites);
      setDefaultSiteId(prefs.defaultSiteId);
      setEnableCornerWidget(prefs.enableCornerWidget);
    });
  }, []);

  const handleDefaultChange = async (siteId: string) => {
    setDefaultSiteId(siteId);
    await saveUserPreferences({ defaultSiteId: siteId });
    showSavedToast();
  };

  const handleToggleCorner = async () => {
    const updated = !enableCornerWidget;
    setEnableCornerWidget(updated);
    await saveUserPreferences({ enableCornerWidget: updated });
    showSavedToast();
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    const newSite: WebSiteConfig = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      url: newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`,
      isCustom: true,
    };

    const updated = [...sites, newSite];
    setSites(updated);
    await saveUserPreferences({ sites: updated });

    setNewName('');
    setNewUrl('');
    setIsAdding(false);
    showSavedToast();
  };

  const handleDeleteSite = async (siteId: string) => {
    const updated = sites.filter((s) => s.id !== siteId);
    setSites(updated);
    if (defaultSiteId === siteId) {
      setDefaultSiteId('chatgpt');
      await saveUserPreferences({ sites: updated, defaultSiteId: 'chatgpt' });
    } else {
      await saveUserPreferences({ sites: updated });
    }
    showSavedToast();
  };

  const showSavedToast = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const handleOpenCompanion = async () => {
    const site = sites.find((s) => s.id === defaultSiteId) || sites[0];
    const targetUrl = site && site.url ? site.url.replace('{query}', '') : 'https://chatgpt.com/';

    try {
      await sendToBackground({
        type: 'OPEN_COMPANION_WINDOW',
        payload: { url: targetUrl },
      });
    } catch (e) {
      console.warn('[OmniAI] Fallback opening tab from popup:', e);
      chrome.tabs.create({ url: targetUrl });
    }
  };

  return (
    <div className="omniai-popup-container">
      <div className="omniai-popup-header">
        <div className="omniai-popup-brand">
          <span className="omniai-popup-logo">OmniAI</span>
          <span className="omniai-popup-version">v0.8.0</span>
        </div>
        {saved && <span className="omniai-saved-indicator">Saved</span>}
      </div>

      <div className="omniai-popup-body">
        {/* Shortcut Box */}
        <div className="omniai-shortcut-box">
          <span className="omniai-shortcut-label">Toggle Side Panel:</span>
          <kbd className="omniai-kbd">Alt + S</kbd>
        </div>

        {/* Corner Widget Toggle */}
        <div className="omniai-toggle-box">
          <span className="omniai-toggle-label">Floating edge launcher [AI]:</span>
          <input
            type="checkbox"
            checked={enableCornerWidget}
            onChange={handleToggleCorner}
          />
        </div>

        {/* Default AI & Web Sites List */}
        <div className="omniai-setting-group">
          <div className="omniai-section-header">
            <label className="omniai-setting-label">Configured Websites / AI:</label>
            <button className="omniai-add-link-btn" onClick={() => setIsAdding(!isAdding)}>
              {isAdding ? 'Close' : '+ Add Site'}
            </button>
          </div>

          {/* Add form */}
          {isAdding && (
            <form className="omniai-popup-add-form" onSubmit={handleAddSite}>
              <input
                type="text"
                placeholder="Site name (e.g. Wikipedia)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="URL (e.g. https://en.wikipedia.org/wiki/{query})"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
              />
              <button type="submit">Save</button>
            </form>
          )}

          {/* Sites Grid */}
          <div className="omniai-sites-list">
            {sites.map((site) => (
              <div
                key={site.id}
                className={`omniai-site-row ${defaultSiteId === site.id ? 'active' : ''}`}
              >
                <span
                  className="omniai-site-name"
                  onClick={() => handleDefaultChange(site.id)}
                  title="Click to set as default"
                >
                  {defaultSiteId === site.id && <span className="omniai-check">Default: </span>}
                  {site.name}
                </span>

                {site.isCustom && (
                  <button
                    className="omniai-del-btn"
                    onClick={() => handleDeleteSite(site.id)}
                    title="Remove this site"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button className="omniai-open-companion-btn" onClick={handleOpenCompanion}>
          Toggle Side Panel
        </button>
      </div>

      <div className="omniai-popup-footer">
        <span>100% Local Privacy • Zero Telemetry</span>
      </div>
    </div>
  );
};
