// components/Common/Modal.tsx

import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { TRANSLATIONS } from '../../constants/translations';
import '../styles/Modal.css';

interface ModalProps {
  isOpen?: boolean;
  title: string;
  onClose?: () => void;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  showCloseButton?: boolean;
  showBackButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen = true,
  title,
  onClose,
  children,
  width = 400,
  height = 300,
  showCloseButton = true,
  showBackButton = false,
}) => {
  const { language } = useGameStore();
  const backLabel = TRANSLATIONS[language].SETTINGS.BACK;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ '--modal-width': `${width}px`, '--modal-height': `${height}px` } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showBackButton && (
            <button className="modal-back-btn" onClick={onClose}>
              {backLabel}
            </button>
          )}
          {showCloseButton && !showBackButton && (
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
