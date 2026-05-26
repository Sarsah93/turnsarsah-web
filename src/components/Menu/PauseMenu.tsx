// components/Menu/PauseMenu.tsx

import React from 'react';
import { BlockButton } from '../BlockButton';
import Modal from '../Common/Modal';
import { useGameStore } from '../../state/gameStore';
import { TRANSLATIONS } from '../../constants/translations';
import { INTERNAL_FEATURES } from '../../utils/buildTarget';
import '../styles/PauseMenu.css';

interface PauseMenuProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onSettings?: () => void;
  onResume?: () => void;
  onQuit?: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad,
  onSettings,
  onResume,
  onQuit,
}) => {
  const { language, isProcessing, forceSaveGame, loadGame, gameState } = useGameStore();
  const t = TRANSLATIONS[language];
  const isBattle = gameState === 'BATTLE';

  return (
    <Modal
      title={t.UI.PAUSE}
      isOpen={isOpen}
      onClose={onResume || onClose}
      showCloseButton={false}
      showBackButton={true}
      width={500}
      height={onLoad ? 580 : 520}
    >
      <div className="pause-menu-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center', padding: '24px' }}>
        <BlockButton text={t.UI.RESUME} onClick={onResume || onClose || (() => { })} width="280px" height="50px" fontSize="1.5rem" />
        <BlockButton 
          text={t.UI.SAVE_GAME} 
          onClick={isProcessing || isBattle ? (() => { }) : (onSave || (() => { }))} 
          width="280px" 
          height="50px" 
          fontSize="1.5rem"
          disabled={isProcessing || isBattle}
        />
        {onLoad && (
          <BlockButton 
            text={t.UI.LOAD_GAME} 
            onClick={onLoad} 
            width="280px" 
            height="50px" 
            fontSize="1.5rem"
          />
        )}
        <BlockButton text={t.SETTINGS.TITLE} onClick={onSettings || (() => { })} width="280px" height="50px" fontSize="1.5rem" />
        {INTERNAL_FEATURES && (
          <>
            <BlockButton text="INTERNAL: FORCE SAVE (SLOT 1)" onClick={() => forceSaveGame(0)} width="300px" height="50px" fontSize="1.2rem" />
            <BlockButton text="INTERNAL: FORCE LOAD (SLOT 1)" onClick={() => loadGame(0)} width="300px" height="50px" fontSize="1.2rem" />
          </>
        )}
        <BlockButton text={t.UI.BACK_TO_MAIN} onClick={onQuit || (() => { })} width="280px" height="50px" fontSize="1.5rem" />
      </div>
    </Modal>
  );
};
