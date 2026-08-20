import React, { useState, useEffect } from 'react';
import { WebSiteConfig } from '../../shared/types/sites';
import { getUserPreferences } from '../../shared/storage';

export const CompanionTopBar: React.FC = () => {
  const [sites, setSites] = useState<WebSiteConfig[]>([]);
  const currentUrl = window.location.href.toLowerCase();

  useEffect(() => {
    getUserPreferences().then((prefs) => {
      setSites(prefs.sites);
    });
  }, []);

  const handleTabClick = (site: WebSiteConfig) => {
    let target = site.url.replace('{query}', '');
    if (window.location.href !== target) {
      window.location.href = target;
    }
  };

  return (
    <div className="omniai-topbar-wrapper">
      <span className="omniai-topbar-badge">OmniAI</span>
      <div className="omniai-topbar-tabs">
        {sites.map((site) => {
          const isActive =
            (site.id === 'chatgpt' && currentUrl.includes('chatgpt.com')) ||
            (site.id === 'claude' && currentUrl.includes('claude.ai')) ||
            (site.id === 'deepseek' && currentUrl.includes('deepseek.com')) ||
            (site.id === 'gemini' && currentUrl.includes('gemini.google.com')) ||
            (site.id === 'translate' && currentUrl.includes('translate.google.com')) ||
            (site.id === 'perplexity' && currentUrl.includes('perplexity.ai'));

          return (
            <button
              key={site.id}
              className={`omniai-topbar-tab ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(site)}
              title={`Chuyển sang ${site.name}`}
            >
              {site.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
