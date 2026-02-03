// components/Menu/PauseMenu.tsx

import React from 'react';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import '../styles/PauseMenu.css';

interface PauseMenuProps {
  onClose?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
  onResume?: () => void;
  onQuit?: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({
  onClose,
  onSave,
  onSettings,
  onResume,
  onQuit,
}) => {
  return (
    <Modal
      title="일시정지"
      onClose={onResume || onClose}
    >
      <div className="pause-menu-buttons">
        <Button label="저장" onClick={onSave} size="lg" variant="primary" />
        <Button label="설정" onClick={onSettings} size="lg" variant="primary" />
        <Button label="게임 종료" onClick={onQuit} size="lg" variant="danger" />
        <Button label="계속하기" onClick={onResume || onClose} size="lg" variant="primary" />
      </div>
    </Modal>
  );
};

export default PauseMenu;
