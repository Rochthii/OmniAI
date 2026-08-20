import { SourceMetadata } from '../types';

export function extractSourceMetadata(): SourceMetadata {
  const url = window.location.href;
  const title = document.title || window.location.hostname;
  const domain = window.location.hostname.replace(/^www\./, '');

  let favicon = '';
  const faviconEl = document.querySelector<HTMLLinkElement>(
    "link[rel~='icon'], link[rel='shortcut icon']"
  );
  if (faviconEl && faviconEl.href) {
    favicon = faviconEl.href;
  } else {
    favicon = `${window.location.origin}/favicon.ico`;
  }

  return {
    url,
    title,
    domain,
    favicon,
  };
}
