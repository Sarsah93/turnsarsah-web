// components/Menu/ConfirmationPopup.tsx

import React from 'react';
import Modal from '../Common/Modal';
import { BlockButton } from '../BlockButton';
import { useGameStore } from '../../state/gameStore';
import { TRANSLATIONS } from '../../constants/translations';
import '../styles/ConfirmationPopup.css';

interface ConfirmationPopupProps {
  message: string;
  yesLabel?: string;
  noLabel?: string;
  onYes?: () => void;
  onNo?: () => void;
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  message,
  yesLabel,
  noLabel,
  onYes,
  onNo,
}) => {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];

  const finalYes = yesLabel || t.UI.YES;
  const finalNo = noLabel || t.UI.NO;

  return (
    <Modal title="" onClose={onNo} showCloseButton={false}>
      <div className="confirmation-content">
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-buttons">
          <BlockButton text={finalYes} onClick={onYes || (() => { })} width="140px" />
          <BlockButton text={finalNo} onClick={onNo || (() => { })} width="140px" />
        </div>
      </div>
    </Modal>
  );
};
