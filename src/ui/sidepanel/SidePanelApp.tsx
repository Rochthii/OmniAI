import React, { useState, useEffect } from 'react';
import { WebSiteConfig, DEFAULT_SITES, UserPreferences } from '../../shared/types/sites';
import { getUserPreferences, saveUserPreferences } from '../../shared/storage';
import { ExtensionMessage } from '../../shared/types/messages';
import { SettingsDrawer } from './SettingsDrawer';

const STORAGE_KEY_ACTIVE_SITE = 'omniai_last_active_site';

export const SidePanelApp: React.FC = () => {
  const [sites, setSites] = useState<WebSiteConfig[]>(DEFAULT_SITES);
  const [activeSiteId, setActiveSiteId] = useState<string>('chatgpt');

  // Settings Drawer State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Drag and Drop Tab Reordering States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Keep track of loaded tab instances (On-demand mounting)
  const [loadedSiteIds, setLoadedSiteIds] = useState<Set<string>>(new Set(['chatgpt']));

  // Track loading status of tabs
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Custom Add Form
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Restore preferences and last active tab on mount
  useEffect(() => {
    async function initSession() {
      const prefs = await getUserPreferences();
      const currentSites = prefs.sites && prefs.sites.length > 0 ? prefs.sites : DEFAULT_SITES;
      setSites(currentSites);

      chrome.storage.local.get([STORAGE_KEY_ACTIVE_SITE], (result) => {
        const savedActiveSite = result[STORAGE_KEY_ACTIVE_SITE];
        const targetActiveId =
          savedActiveSite && currentSites.some((s) => s.id === savedActiveSite)
            ? savedActiveSite
            : prefs.defaultSiteId || currentSites[0].id;

        setActiveSiteId(targetActiveId);
        setLoadedSiteIds((prev) => new Set([...prev, targetActiveId]));
      });
    }

    initSession();

    // Listen for prompt requests from Content Script
    const messageListener = (message: ExtensionMessage) => {
      if (message.type === 'SEND_PROMPT_TO_COMPANION') {
        const payload = message.payload;
        if (payload) {
          const targetId = payload.providerId || 'chatgpt';
          switchTab(targetId);
        }
        showToast('Copied to clipboard. Press Ctrl+V to paste.');
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const switchTab = (siteId: string) => {
    setActiveSiteId(siteId);

    setLoadedSiteIds((prev) => {
      const next = new Set([...prev, siteId]);
      return next;
    });

    chrome.storage.local.set({ [STORAGE_KEY_ACTIVE_SITE]: siteId });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTabClick = (site: WebSiteConfig) => {
    switchTab(site.id);
  };

  const handleDeleteTab = async (e: React.MouseEvent, siteId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const targetSite = sites.find((s) => s.id === siteId);
    const updated = sites.filter((s) => s.id !== siteId);

    if (updated.length === 0) {
      showToast('Must keep at least 1 tab');
      return;
    }

    setSites(updated);

    if (activeSiteId === siteId) {
      const nextActive = updated[0];
      switchTab(nextActive.id);
    }

    await saveUserPreferences({ sites: updated });
    showToast(`Removed tab ${targetSite?.name || ''}`);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...sites];
    const [movedSite] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedSite);

    setSites(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);

    await saveUserPreferences({ sites: updated });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRefresh = () => {
    const frame = document.getElementById(`omniai-frame-${activeSiteId}`) as HTMLIFrameElement | null;
    if (frame) {
      setLoadingStates((prev) => ({ ...prev, [activeSiteId]: true }));
      const siteConfig = sites.find((s) => s.id === activeSiteId);
      frame.src = siteConfig?.url.replace('{query}', '') || 'about:blank';
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    const formattedUrl = newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`;
    const newSite: WebSiteConfig = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      url: formattedUrl,
      isCustom: true,
    };

    const updated = [...sites, newSite];
    setSites(updated);
    switchTab(newSite.id);

    await saveUserPreferences({ sites: updated });

    setNewName('');
    setNewUrl('');
    setIsAdding(false);
    showToast(`Added ${newSite.name}`);
  };

  const handleFrameLoad = (siteId: string) => {
    setLoadingStates((prev) => ({ ...prev, [siteId]: false }));
  };

  return (
    <div className="omniai-sidepanel-container">
      {toastMessage && <div className="omniai-sidepanel-toast">{toastMessage}</div>}

      {/* Top Navigation Bar */}
      <div className="omniai-sidepanel-topbar">
        <div className="omniai-sidepanel-tabs">
          {sites.map((site, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index && draggedIndex !== index;

            return (
              <button
                key={site.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`omniai-sidepanel-tab ${activeSiteId === site.id ? 'active' : ''} ${
                  isDragging ? 'is-dragging' : ''
                } ${isDragOver ? 'is-drag-over' : ''}`}
                onClick={() => handleTabClick(site)}
                title={`${site.name} (Drag to reorder, click X to remove)`}
              >
                <svg className="omniai-tab-drag-svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="6" r="2" />
                  <circle cx="15" cy="6" r="2" />
                  <circle cx="9" cy="12" r="2" />
                  <circle cx="15" cy="12" r="2" />
                  <circle cx="9" cy="18" r="2" />
                  <circle cx="15" cy="18" r="2" />
                </svg>
                <span>{site.name}</span>
                <span
                  className="omniai-tab-close"
                  onClick={(e) => handleDeleteTab(e, site.id)}
                  title="Close tab"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>

        <div className="omniai-sidepanel-actions">
          <button
            className="omniai-icon-btn"
            onClick={() => setIsAdding(!isAdding)}
            title="Add new website tab"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button
            className="omniai-icon-btn"
            onClick={handleRefresh}
            title="Refresh current page"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
          <button
            className="omniai-icon-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="OmniAI Settings"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            className="omniai-icon-btn omniai-sidepanel-close-btn"
            onClick={() => window.close()}
            title="Close Side Panel"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Inline Add Site Form */}
      {isAdding && (
        <form className="omniai-sidepanel-add-form" onSubmit={handleAddSite}>
          <input
            type="text"
            placeholder="Site name (e.g. Wikipedia, DevDocs...)"
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
          <div className="omniai-sidepanel-add-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Stacked IFrame Container */}
      <div className="omniai-sidepanel-frame-container">
        {sites
          .filter((site) => loadedSiteIds.has(site.id))
          .map((site) => {
            const url = site.url.replace('{query}', '');
            const isActive = activeSiteId === site.id;
            const isLoading = loadingStates[site.id];

            return (
              <div
                key={site.id}
                className={`omniai-frame-wrapper ${isActive ? 'is-active' : ''}`}
              >
                {isLoading && (
                  <div className="omniai-skeleton-loader">
                    <div className="omniai-spinner" />
                    <span>Connecting to {site.name}...</span>
                  </div>
                )}
                <iframe
                  id={`omniai-frame-${site.id}`}
                  src={url}
                  className="omniai-sidepanel-iframe"
                  loading="eager"
                  onLoad={() => handleFrameLoad(site.id)}
                  allow="clipboard-read; clipboard-write; microphone; camera; display-capture; geolocation; encrypted-media; autoplay; web-share"
                />
              </div>
            );
          })}
      </div>

      {/* Settings Drawer Modal */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onPreferencesUpdated={(updatedPrefs) => {
          setSites(updatedPrefs.sites);
        }}
      />
    </div>
  );
};

