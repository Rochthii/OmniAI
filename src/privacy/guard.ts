export interface PrivacyCheckResult {
  allowed: boolean;
  reason?: string;
}

const BLOCKED_DOMAINS = [
  'vault.bitwarden.com',
  'app.1password.com',
  'lastpass.com',
  'passbolt.com',
  'myaccount.google.com/security',
];

export function checkPrivacyGuard(targetElement?: HTMLElement | null): PrivacyCheckResult {
  const currentUrl = typeof window !== 'undefined' && window.location ? window.location.href.toLowerCase() : '';

  // 1. Check blocked domain
  if (currentUrl) {
    for (const domain of BLOCKED_DOMAINS) {
      if (currentUrl.includes(domain)) {
        return {
          allowed: false,
          reason: 'OmniAI đã tự động tạm dừng trên trang bảo mật này để bảo vệ dữ liệu của bạn.',
        };
      }
    }
  }

  // 2. Check if target element is inside password or sensitive input
  if (targetElement && typeof targetElement.getAttribute === 'function') {
    const isPassword =
      targetElement.getAttribute('type') === 'password' ||
      targetElement.getAttribute('autocomplete')?.includes('password') ||
      (typeof targetElement.closest === 'function' && targetElement.closest('input[type="password"]'));

    if (isPassword) {
      return {
        allowed: false,
        reason: 'Không thể trích xuất ngữ cảnh từ trường mật khẩu.',
      };
    }
  }

  return { allowed: true };
}
