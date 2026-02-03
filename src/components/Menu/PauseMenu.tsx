// components/Menu/PauseMenu.tsx

import React from 'react';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import '../styles/PauseMenu.css';

interface PauseMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
  onResume?: () => void;
  onQuit?: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onClose,
  onSave,
  onSettings,
  onResume,
  onQuit,
}) => {
  return (
    <Modal
      title="PAUSE"
      isOpen={isOpen}
      onClose={onResume || onClose}
      showCloseButton={false}
    >
      <div className="pause-menu-buttons">
        <Button label="SAVE GAME" onClick={onSave} size="lg" variant="primary" />
        <Button label="SETTINGS" onClick={onSettings} size="lg" variant="primary" />
        <Button label="QUIT GAME" onClick={onQuit} size="lg" variant="danger" />
        <Button label="BACK TO GAME" onClick={onResume || onClose} size="lg" variant="primary" />
      </div>
    </Modal>
  );
};
