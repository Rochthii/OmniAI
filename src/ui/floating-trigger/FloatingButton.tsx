import React from 'react';
import { OmniContext } from '../../context/types';

interface FloatingButtonProps {
  position: { top: number; left: number };
  context: OmniContext;
  onOpenHUD: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ position, onOpenHUD }) => {
  return (
    <div
      className="omniai-floating-trigger"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button className="omniai-floating-btn" onClick={onOpenHUD}>
        <span className="omniai-floating-logo">OmniAI</span>
        <span>Hỏi AI / Tra cứu ✨</span>
      </button>
    </div>
  );
};
