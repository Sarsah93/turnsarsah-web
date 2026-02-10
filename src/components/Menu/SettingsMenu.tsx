import React, { useState } from 'react';
import Modal from '../Common/Modal';
import { BlockButton } from '../BlockButton';
import { AudioManager } from '../../utils/AudioManager';
import { useGameStore } from '../../state/gameStore';
import { TRANSLATIONS } from '../../constants/translations';
import '../styles/SettingsMenu.css';

interface SettingsMenuProps {
  onVolumeChange?: (type: 'bgm' | 'sfx', volume: number) => void;
  onClose?: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onVolumeChange, onClose }) => {
  const { language, setLanguage } = useGameStore();
  const t = TRANSLATIONS[language].SETTINGS;
  const [bgmVolume, setBgmVolume] = useState(Math.round(AudioManager.getBGMVolume() * 10));
  const [sfxVolume, setSfxVolume] = useState(Math.round(AudioManager.getSFXVolume() * 10));

  const handleBgmChange = (delta: number) => {
    const newVolumeBars = Math.max(0, Math.min(10, bgmVolume + delta));
    setBgmVolume(newVolumeBars);
    onVolumeChange?.('bgm', newVolumeBars / 10);
  };

  const handleSfxChange = (delta: number) => {
    const newVolumeBars = Math.max(0, Math.min(10, sfxVolume + delta));
    setSfxVolume(newVolumeBars);
    onVolumeChange?.('sfx', newVolumeBars / 10);
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

        {/* Language Selection */}
        <div className="setting-item" style={{ marginTop: '10px' }}>
          <label>{t.LANGUAGE}</label>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <BlockButton
              text={t.KOREAN}
              onClick={() => setLanguage('KR')}
              variant={language === 'KR' ? 'primary' : undefined}
              width="150px"
              fontSize="1.2rem"
            />
            <BlockButton
              text={t.ENGLISH}
              onClick={() => setLanguage('EN')}
              variant={language === 'EN' ? 'primary' : undefined}
              width="150px"
              fontSize="1.2rem"
            />
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <BlockButton text="BACK" onClick={() => onClose?.()} width="160px" />
        </div>
      </div>
    </Modal>
  );
};
