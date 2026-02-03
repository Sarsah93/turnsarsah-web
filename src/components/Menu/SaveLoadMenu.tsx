// components/Menu/SaveLoadMenu.tsx

import React, { useEffect, useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import { SaveManager } from '../../utils/SaveManager';
import '../styles/SaveLoadMenu.css';

interface SaveLoadMenuProps {
  onLoad?: (slot: number) => void;
  onClose?: () => void;
}

const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({ onLoad, onClose }) => {
  const [slots, setSlots] = useState<Array<{ stage: string; date: string } | null>>([null, null, null]);

  useEffect(() => {
    const slotData = [0, 1, 2].map((i) => SaveManager.getSaveInfo(i));
    setSlots(slotData.map((info) => (info ? { stage: `Stage ${info.stage}`, date: info.date } : null)));
  }, []);

  return (
    <Modal title="저장/로드" onClose={onClose}>
      <div className="save-load-slots">
        {slots.map((slot, index) => (
          <div key={index} className="save-slot">
            <div className="slot-content" onClick={() => onLoad?.(index)}>
              <div className="slot-title">슬롯 {index + 1}</div>
              <div className="slot-detail">{slot ? `${slot.stage} - ${slot.date}` : '비어있음'}</div>
            </div>
            {slot && (
              <Button
                label="삭제"
                onClick={() => {
                  SaveManager.deleteSave(index);
                  setSlots((prev) => [...prev.slice(0, index), null, ...prev.slice(index + 1)]);
                }}
                size="sm"
                variant="danger"
              />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default SaveLoadMenu;
