// components/Common/Modal.tsx

import React from 'react';
import { Button } from './Button';
import '../styles/Modal.css';

interface ModalProps {
  isOpen?: boolean;
  title: string;
  onClose?: () => void;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen = true,
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
        style={{ '--modal-width': `${width}px`, '--modal-height': `${height}px` } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseButton && (
            <Button
              className="modal-close"
              variant="overlay"
              size="sm"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                minWidth: 'auto',
                padding: 0,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: '#bdc3c7',
                color: '#ecf0f1'
              }}
            >
              ✕
            </Button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
