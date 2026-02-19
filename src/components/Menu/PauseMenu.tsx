// components/Menu/PauseMenu.tsx

import React from 'react';
import { BlockButton } from '../BlockButton';
import Modal from '../Common/Modal';
import { useGameStore } from '../../state/gameStore';
import { TRANSLATIONS } from '../../constants/translations';
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
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];

  return (
    <Modal
      title={t.UI.PAUSE}
      isOpen={isOpen}
      onClose={onResume || onClose}
      showCloseButton={false}
      width={400}
      height={450}
    >
      <div className="pause-menu-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', padding: '20px' }}>
        <BlockButton text={t.UI.RESUME} onClick={onResume || onClose || (() => { })} width="220px" height="40px" />
        <BlockButton text={t.UI.SAVE_GAME} onClick={onSave || (() => { })} width="220px" height="40px" />
        <BlockButton text={t.SETTINGS.TITLE} onClick={onSettings || (() => { })} width="220px" height="40px" />
        <BlockButton text={t.UI.BACK_TO_MAIN} onClick={onQuit || (() => { })} width="220px" height="40px" fontSize="1.5rem" />
      </div>
    </Modal>
  );
};
