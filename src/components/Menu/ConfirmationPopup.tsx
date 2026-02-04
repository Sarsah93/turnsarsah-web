// components/Menu/ConfirmationPopup.tsx

import React from 'react';
import Modal from '../Common/Modal';
import { BlockButton } from '../BlockButton';
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
  yesLabel = 'YES',
  noLabel = 'NO',
  onYes,
  onNo,
}) => {
  return (
    <Modal title="" onClose={onNo} showCloseButton={false}>
      <div className="confirmation-content">
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-buttons">
          <BlockButton text={yesLabel} onClick={onYes || (() => { })} width="140px" />
          <BlockButton text={noLabel} onClick={onNo || (() => { })} width="140px" />
        </div>
      </div>
    </Modal>
  );
};
