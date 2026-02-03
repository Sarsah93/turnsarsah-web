// components/Common/Modal.tsx

import React from 'react';
import '../styles/Modal.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose?: () => void;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  width = 400,
  height = 300,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseButton && (
            <button className="modal-close" onClick={onClose}>
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
