import React from 'react';
import ReactDOM from 'react-dom/client';
import { OmniContext } from '../context/types';
import { SpotlightModal } from './spotlight/SpotlightModal';
import { CompanionTopBar } from './companion-bar/CompanionTopBar';
import { CornerWidget } from './corner-widget/CornerWidget';
// @ts-ignore
import spotlightCss from './spotlight/spotlight.css?inline';
// @ts-ignore
import topbarCss from './companion-bar/companion-bar.css?inline';
// @ts-ignore
import cornerWidgetCss from './corner-widget/corner-widget.css?inline';

let shadowHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let reactRoot: ReactDOM.Root | null = null;

// Corner Launcher Dock Host
let cornerDockHost: HTMLElement | null = null;
let cornerDockRoot: ReactDOM.Root | null = null;

function ensureShadowRoot(): ShadowRoot {
  if (!shadowHost) {
    shadowHost = document.createElement('div');
    shadowHost.id = 'omniai-root-host';
    shadowHost.style.position = 'absolute';
    shadowHost.style.top = '0';
    shadowHost.style.left = '0';
    shadowHost.style.zIndex = '2147483647';
    document.body.appendChild(shadowHost);

    shadowRoot = shadowHost.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = `${spotlightCss}\n${topbarCss}\n${cornerWidgetCss}`;
    shadowRoot.appendChild(styleEl);

    const container = document.createElement('div');
    container.id = 'omniai-app-container';
    shadowRoot.appendChild(container);

    reactRoot = ReactDOM.createRoot(container);
  }
  return shadowRoot!;
}

export function mountSpotlightHUD(context: OmniContext): void {
  ensureShadowRoot();
  reactRoot?.render(
    <React.StrictMode>
      <SpotlightModal context={context} onClose={unmountOmniUI} />
    </React.StrictMode>
  );
}

export function mountPersistentDock(enableCornerWidget: boolean = true): void {
  if (!enableCornerWidget) return;
  if (document.getElementById('omniai-corner-dock-host')) return;

  cornerDockHost = document.createElement('div');
  cornerDockHost.id = 'omniai-corner-dock-host';
  cornerDockHost.style.position = 'fixed';
  cornerDockHost.style.top = '0';
  cornerDockHost.style.right = '0';
  cornerDockHost.style.width = '0';
  cornerDockHost.style.height = '0';
  cornerDockHost.style.zIndex = '2147483646';
  cornerDockHost.style.pointerEvents = 'none';

  (document.body || document.documentElement).appendChild(cornerDockHost);

  const shadow = cornerDockHost.attachShadow({ mode: 'open' });
  const styleEl = document.createElement('style');
  styleEl.textContent = cornerWidgetCss;
  shadow.appendChild(styleEl);

  const container = document.createElement('div');
  shadow.appendChild(container);

  cornerDockRoot = ReactDOM.createRoot(container);
  cornerDockRoot.render(
    <React.StrictMode>
      <CornerWidget />
    </React.StrictMode>
  );
}

export function mountCompanionTopBar(): void {
  document.body.style.paddingTop = '38px';

  const topHost = document.createElement('div');
  topHost.id = 'omniai-companion-topbar-host';
  document.documentElement.appendChild(topHost);

  const topShadow = topHost.attachShadow({ mode: 'open' });
  const styleEl = document.createElement('style');
  styleEl.textContent = topbarCss;
  topShadow.appendChild(styleEl);

  const container = document.createElement('div');
  topShadow.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <CompanionTopBar />
    </React.StrictMode>
  );
}

export function unmountOmniUI(): void {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
  if (shadowHost && shadowHost.parentElement) {
    shadowHost.parentElement.removeChild(shadowHost);
    shadowHost = null;
    shadowRoot = null;
  }
}

