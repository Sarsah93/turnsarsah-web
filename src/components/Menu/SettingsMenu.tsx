// components/Menu/SettingsMenu.tsx

import React, { useState } from 'react';
import Modal from '../Common/Modal';
import { BlockButton } from '../BlockButton';
import '../styles/SettingsMenu.css';

interface SettingsMenuProps {
  onVolumeChange?: (type: 'bgm' | 'sfx', delta: number) => void;
  onClose?: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onVolumeChange, onClose }) => {
  const [bgmVolume, setBgmVolume] = useState(5);
  const [sfxVolume, setSfxVolume] = useState(5);

  const handleBgmChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(10, bgmVolume + delta));
    setBgmVolume(newVolume);
    onVolumeChange?.('bgm', delta);
  };

  const handleSfxChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(10, sfxVolume + delta));
    setSfxVolume(newVolume);
    onVolumeChange?.('sfx', delta);
  };

  return (
    <Modal title="SETTINGS" onClose={onClose} width={600} height={550} showCloseButton={false}>
      <div className="settings-content" style={{ padding: '40px', gap: '35px' }}>
        <div className="setting-item">
          <label>BGM VOLUME</label>
          <div className="volume-bars">
            <button onClick={() => handleBgmChange(-1)}>-</button>
            <div className="bars">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`bar ${i < bgmVolume ? 'active' : ''}`} />
              ))}
            </div>
            <button onClick={() => handleBgmChange(1)}>+</button>
          </div>
        </div>
        <div className="setting-item">
          <label>SFX VOLUME</label>
          <div className="volume-bars">
            <button onClick={() => handleSfxChange(-1)}>-</button>
            <div className="bars">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`bar ${i < sfxVolume ? 'active' : ''}`} />
              ))}
            </div>
            <button onClick={() => handleSfxChange(1)}>+</button>
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <BlockButton text="BACK" onClick={() => onClose?.()} width="160px" />
        </div>
      </div>
    </Modal>
  );
};
