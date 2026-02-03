// components/Menu/SaveLoadMenu.tsx

import React, { useEffect, useState } from 'react';
import Modal from '../Common/Modal';
import { BlockButton } from '../BlockButton';
import { SaveManager } from '../../utils/SaveManager';
import { ConfirmationPopup } from './ConfirmationPopup';
import '../styles/SaveLoadMenu.css';

interface SaveLoadMenuProps {
  mode: 'SAVE' | 'LOAD';
  onAction?: (slot: number) => void;
  onClose?: () => void;
}

export const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({ mode, onAction, onClose }) => {
  const [slots, setSlots] = useState<Array<{ stage: string; date: string } | null>>([null, null, null]);
  const [confirmDeleteSlot, setConfirmDeleteSlot] = useState<number | null>(null);

  const refreshSlots = () => {
    const slotData = [0, 1, 2].map((i) => SaveManager.getSaveInfo(i));
    setSlots(slotData.map((info) => (info ? { stage: `Stage ${info.stage}`, date: info.date } : null)));
  };

  useEffect(() => {
    refreshSlots();
  }, []);

  const handleDelete = (index: number) => {
    setConfirmDeleteSlot(index);
  };

  const confirmDelete = () => {
    if (confirmDeleteSlot !== null) {
      SaveManager.deleteSave(confirmDeleteSlot);
      setConfirmDeleteSlot(null);
      refreshSlots();
    }
  };

  return (
    <>
      <Modal
        title={mode === 'SAVE' ? 'SAVE GAME' : 'LOAD GAME'}
        onClose={onClose}
        isOpen={true}
        width={650}
        height={550}
        showCloseButton={false}
      >
        <div className="save-load-slots">
          {slots.map((slot, index) => (
            <div key={index} className="save-slot">
              <div className="slot-content" onClick={() => onAction?.(index)}>
                <div className="slot-title">SLOT {index + 1}</div>
                <div className="slot-detail">{slot ? `${slot.stage} - ${slot.date}` : 'EMPTY'}</div>
              </div>
              {slot && (
                <BlockButton
                  text="DELETE"
                  onClick={() => handleDelete(index)}
                  width="80px"
                  variant="danger"
                />
              )}
            </div>
          ))}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
            <BlockButton text="CANCEL" onClick={() => onClose?.()} width="160px" />
          </div>
        </div>
      </Modal>

      {confirmDeleteSlot !== null && (
        <ConfirmationPopup
          message="DO YOU AGREE WITH DELETING THIS SAVED DATA?"
          onYes={confirmDelete}
          onNo={() => setConfirmDeleteSlot(null)}
        />
      )}
    </>
  );
};
