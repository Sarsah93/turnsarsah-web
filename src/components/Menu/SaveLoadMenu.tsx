// components/Menu/SaveLoadMenu.tsx

import React, { useEffect, useState } from 'react';
import Modal from '../Common/Modal';
import { BlockButton } from '../BlockButton';
import { SaveManager } from '../../utils/SaveManager';
import { ConfirmationPopup } from './ConfirmationPopup';
import { useGameStore } from '../../state/gameStore';
import { TRANSLATIONS } from '../../constants/translations';
import '../styles/SaveLoadMenu.css';

interface SaveLoadMenuProps {
  mode: 'SAVE' | 'LOAD';
  onAction?: (slot: number) => void;
  onClose?: () => void;
}

export const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({ mode, onAction, onClose }) => {
  const { language } = useGameStore();
  const t = TRANSLATIONS[language];
  const [slots, setSlots] = useState<Array<{ stage: string; date: string } | null>>([null, null, null]);
  const [confirmDeleteSlot, setConfirmDeleteSlot] = useState<number | null>(null);
  const [confirmOverwriteSlot, setConfirmOverwriteSlot] = useState<number | null>(null);

  const refreshSlots = () => {
    const slotData = [0, 1, 2].map((i) => SaveManager.getSaveInfo(i));
    setSlots(slotData.map((info) => (info ? { stage: `${t.UI.STAGE_NUM} ${info.stage}`, date: info.date } : null)));
  };

  useEffect(() => {
    refreshSlots();
  }, []);

  const handleSlotClick = (index: number) => {
    if (mode === 'SAVE' && slots[index] !== null) {
      setConfirmOverwriteSlot(index);
    } else {
      onAction?.(index);
    }
  };

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

  const confirmOverwrite = () => {
    if (confirmOverwriteSlot !== null) {
      onAction?.(confirmOverwriteSlot);
      setConfirmOverwriteSlot(null);
    }
  };

  return (
    <>
      <Modal
        title={mode === 'SAVE' ? t.UI.SAVE_GAME : t.UI.LOAD_GAME}
        onClose={onClose}
        isOpen={true}
        width={650}
        height={550}
        showCloseButton={false}
      >
        <div className="save-load-slots">
          {slots.map((slot, index) => (
            <div key={index} className="save-slot">
              <div className="slot-content" onClick={() => handleSlotClick(index)}>
                <div className="slot-title">{t.UI.SLOT} {index + 1}</div>
                <div className="slot-detail">{slot ? `${slot.stage} - ${slot.date}` : t.UI.EMPTY}</div>
              </div>
              {slot && (
                <BlockButton
                  text={t.UI.DELETE}
                  onClick={() => handleDelete(index)}
                  width="80px"
                  variant="danger"
                  fontSize="1.4rem"
                  style={{ marginLeft: 'auto', marginRight: '5px' }}
                />
              )}
            </div>
          ))}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
            <BlockButton text={t.UI.CANCEL} onClick={() => onClose?.()} width="160px" />
          </div>
        </div>
      </Modal>

      {confirmDeleteSlot !== null && (
        <ConfirmationPopup
          message={t.UI.DELETE_CONFIRM}
          onYes={confirmDelete}
          onNo={() => setConfirmDeleteSlot(null)}
        />
      )}

      {confirmOverwriteSlot !== null && (
        <ConfirmationPopup
          message={t.UI.OVERWRITE_CONFIRM}
          onYes={confirmOverwrite}
          onNo={() => setConfirmOverwriteSlot(null)}
        />
      )}
    </>
  );
};
