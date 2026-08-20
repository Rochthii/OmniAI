import React, { useState, useEffect, useRef } from 'react';
import { sendToBackground } from '../../shared/messaging/bus';

const STORAGE_KEY_TOP_PERCENT = 'omniai_widget_top_percent';
const SLEEP_DELAY_MS = 3000;

export const CornerWidget: React.FC = () => {
  const [topPercent, setTopPercent] = useState<number>(50);
  const [isSleeping, setIsSleeping] = useState<boolean>(false);

  const widgetRef = useRef<HTMLDivElement | null>(null);
  const sleepTimerRef = useRef<any>(null);
  const dragStartPosRef = useRef<{ x: number; y: number; startTopPercent: number } | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const rafIdRef = useRef<number | null>(null);

  // 1. Restore saved position
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY_TOP_PERCENT], (res) => {
      if (typeof res[STORAGE_KEY_TOP_PERCENT] === 'number') {
        const saved = Math.min(92, Math.max(8, res[STORAGE_KEY_TOP_PERCENT]));
        setTopPercent(saved);
        if (widgetRef.current) {
          widgetRef.current.style.top = `${saved}%`;
        }
      }
    });

    startSleepTimer();

    return () => {
      clearSleepTimer();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const startSleepTimer = () => {
    clearSleepTimer();
    sleepTimerRef.current = setTimeout(() => {
      setIsSleeping(true);
    }, SLEEP_DELAY_MS);
  };

  const clearSleepTimer = () => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
  };

  const handlePointerEnter = () => {
    clearSleepTimer();
    setIsSleeping(false);
  };

  const handlePointerLeave = () => {
    startSleepTimer();
  };

  // 2. High-Performance 60-120 FPS Direct DOM Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    clearSleepTimer();
    setIsSleeping(false);
    hasMovedRef.current = false;

    dragStartPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      startTopPercent: topPercent,
    };

    let latestPercent = topPercent;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!dragStartPosRef.current) return;

      const deltaY = moveEvent.clientY - dragStartPosRef.current.y;
      const deltaX = moveEvent.clientX - dragStartPosRef.current.x;

      if (!hasMovedRef.current && Math.hypot(deltaX, deltaY) > 4) {
        hasMovedRef.current = true;
        if (widgetRef.current) {
          widgetRef.current.classList.add('is-dragging');
        }
      }

      if (hasMovedRef.current) {
        const windowHeight = window.innerHeight || document.documentElement.clientHeight || 800;
        const newTopPx = (dragStartPosRef.current.startTopPercent / 100) * windowHeight + deltaY;
        latestPercent = Math.min(92, Math.max(8, (newTopPx / windowHeight) * 100));

        // 🌟 Ultra-smooth 0ms latency direct GPU update
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          if (widgetRef.current) {
            widgetRef.current.style.top = `${latestPercent}%`;
          }
        });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      upEvent.stopPropagation();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (widgetRef.current) {
        widgetRef.current.classList.remove('is-dragging');
      }

      if (hasMovedRef.current) {
        setTopPercent(latestPercent);
        chrome.storage.local.set({ [STORAGE_KEY_TOP_PERCENT]: latestPercent });
        startSleepTimer();
      } else {
        // Instant 1-Click Trigger (Handled exclusively here to prevent double triggering)
        sendToBackground({ type: 'OPEN_COMPANION_WINDOW' });
        startSleepTimer();
      }

      setTimeout(() => {
        dragStartPosRef.current = null;
        hasMovedRef.current = false;
      }, 50);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <div
      ref={widgetRef}
      className={`omniai-corner-dock ${isSleeping ? 'is-sleeping' : ''}`}
      style={{ top: `${topPercent}%` }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      title="OmniAI (Click to open sidebar, drag to reposition)"
    >
      <div className="omniai-corner-handle">
        <svg
          className="omniai-corner-svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" />
        </svg>
        <span className="omniai-corner-text">AI</span>
      </div>
    </div>
  );
};



