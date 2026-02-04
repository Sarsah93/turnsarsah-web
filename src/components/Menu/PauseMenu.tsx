// components/Menu/PauseMenu.tsx

import React from 'react';
import { BlockButton } from '../BlockButton';
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
      width={400}
      height={450}
    >
      <div className="pause-menu-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', padding: '20px' }}>
        <BlockButton text="RESUME" onClick={onResume || onClose || (() => { })} width="220px" height="40px" />
        <BlockButton text="SAVE GAME" onClick={onSave || (() => { })} width="220px" height="40px" />
        <BlockButton text="SETTINGS" onClick={onSettings || (() => { })} width="220px" height="40px" />
        <BlockButton text="BACK TO MAIN PAGE" onClick={onQuit || (() => { })} width="220px" height="40px" fontSize="1.5rem" />
      </div>
    </Modal>
  );
};
