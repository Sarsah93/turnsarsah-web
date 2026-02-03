// components/Menu/SettingsMenu.tsx

import React, { useState } from 'react';
import Modal from '../Common/Modal';
import Button from '../Common/Button';
import '../styles/SettingsMenu.css';

interface SettingsMenuProps {
  onVolumeChange?: (type: 'bgm' | 'sfx', delta: number) => void;
  onClose?: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onVolumeChange, onClose }) => {
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
    <Modal title="설정" onClose={onClose}>
      <div className="settings-content">
        <div className="setting-item">
          <label>배경음악: {bgmVolume}</label>
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
          <label>효과음: {sfxVolume}</label>
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
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <Button label="닫기" onClick={onClose} variant="primary" />
        </div>
      </div>
    </Modal>
  );
};

export default SettingsMenu;
