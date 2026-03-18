// components/Menu/ConfirmationPopup.tsx

import React from 'react';
import Modal from '../Common/Modal';
import { Button } from '../Common/Button';
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
        <div className="confirmation-buttons" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
          <Button variant="overlay" size="md" onClick={onYes || (() => { })} style={{ width: '140px', borderColor: '#e74c3c', color: '#e74c3c' }}>{finalYes}</Button>
          <Button variant="overlay" size="md" onClick={onNo || (() => { })} style={{ width: '140px', borderColor: '#bdc3c7', color: '#ecf0f1' }}>{finalNo}</Button>
        </div>
      </div>
    </Modal>
  );
};
