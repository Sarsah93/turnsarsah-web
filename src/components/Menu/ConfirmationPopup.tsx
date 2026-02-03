// components/Menu/ConfirmationPopup.tsx

import React from 'react';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import '../styles/ConfirmationPopup.css';

interface ConfirmationPopupProps {
  message: string;
  yesLabel?: string;
  noLabel?: string;
  onYes?: () => void;
  onNo?: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
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
          <Button label={yesLabel} onClick={onYes} size="lg" variant="primary" />
          <Button label={noLabel} onClick={onNo} size="lg" variant="secondary" />
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationPopup;
