import React, { useState } from 'react';
import { OmniContext } from '../../context/types';
import { getUserPreferences } from '../../shared/storage';
import { providerRegistry } from '../../providers/registry';
import { sendToBackground } from '../../shared/messaging/bus';
import { copyToClipboard } from '../../automation/clipboard';

interface FloatingMiniIconProps {
  position: { top: number; left: number };
  context: OmniContext;
  onOpenHUD: () => void;
  onClose: () => void;
}

export const FloatingMiniIcon: React.FC<FloatingMiniIconProps> = ({
  position,
  context,
  onOpenHUD,
  onClose,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleInstantSend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSending) return;
    setIsSending(true);

    const prefs = await getUserPreferences();
    const site = prefs.sites.find((s) => s.id === prefs.defaultSiteId) || prefs.sites[0];
    const provider = providerRegistry.get(site.id) || providerRegistry.getDefault();

    const formattedPrompt = provider.formatPrompt(context, '');

    // 1. Instant Copy to Clipboard
    await copyToClipboard(formattedPrompt);

    // 2. Prepare Target URL
    let finalTargetUrl = site.url;
    if (finalTargetUrl.includes('{query}')) {
      finalTargetUrl = finalTargetUrl.replace(
        '{query}',
        encodeURIComponent(context.content.slice(0, 1000))
      );
    }

    // 3. Open Mini Companion
    await sendToBackground({
      type: 'SEND_PROMPT_TO_COMPANION',
      payload: {
        formattedPrompt,
        context,
        providerId: site.id,
        targetUrl: finalTargetUrl,
      },
    });

    setIsSending(false);
    onClose();
  };

  return (
    <div
      className="omniai-mini-trigger-container"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* 1-Click Instant Action Button */}
      <button
        className="omniai-mini-send-btn"
        onClick={handleInstantSend}
        title="Bấm 1 phát: Tự động mở Mini Companion & điền nội dung"
      >
        <span>⚡</span>
        <span>{isSending ? 'Đang gửi...' : 'Gửi AI'}</span>
      </button>

      {/* Expand to full HUD Button */}
      <button
        className="omniai-mini-expand-btn"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenHUD();
        }}
        title="Mở bảng điều khiển chi tiết (Alt + A)"
      >
        ✎
      </button>
    </div>
  );
};
