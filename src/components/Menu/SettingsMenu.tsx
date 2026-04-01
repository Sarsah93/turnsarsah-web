import React, { useState } from 'react';
import Modal from '../Common/Modal';
import { Button } from '../Common/Button';
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
  const { language, setLanguage, fontSize, setFontSize, gameSpeed, setGameSpeed } = useGameStore();
  const t = TRANSLATIONS[language].SETTINGS;
  const [bgmVolume, setBgmVolume] = useState(Math.round(AudioManager.getBGMVolume() * 10));
  const [sfxVolume, setSfxVolume] = useState(Math.round(AudioManager.getSFXVolume() * 10));

  // Pending changes — applied only when closing settings
  const [pendingFontSize, setPendingFontSize] = useState(fontSize);
  const [pendingLanguage, setPendingLanguage] = useState(language);

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

  const handleClose = () => {
    // Apply pending language on close
    if (pendingLanguage !== language) {
      setLanguage(pendingLanguage);
    }
    // Apply pending font size on close
    if (pendingFontSize !== fontSize) {
      setFontSize(pendingFontSize);
    }
    onClose?.();
  };

  // Font sizes for each button to visually represent the size
  const fontSizePreview: Record<string, string> = {
    LARGE: '1.6rem',
    NORMAL: '1.3rem',
    SMALL: '1.0rem',
  };

  return (
    <Modal title={t.TITLE} onClose={handleClose} width={620} height={580} showCloseButton={false} showBackButton={true}>
      <div className="settings-content" style={{ padding: '30px', gap: '20px' }}>
        <div className="setting-item">
          <label>{t.BGM}</label>
          <div className="volume-bars">
            <Button variant="overlay" size="sm" onClick={() => handleBgmChange(-1)} style={{ width: '40px', height: '40px', minWidth: 'auto', padding: 0, borderColor: '#f1c40f', color: '#f1c40f' }}>-</Button>
            <div className="bars">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`bar ${i < bgmVolume ? 'active' : ''}`} />
              ))}
            </div>
            <Button variant="overlay" size="sm" onClick={() => handleBgmChange(1)} style={{ width: '40px', height: '40px', minWidth: 'auto', padding: 0, borderColor: '#f1c40f', color: '#f1c40f' }}>+</Button>
          </div>
        </div>
        <div className="setting-item">
          <label>{t.SFX}</label>
          <div className="volume-bars">
            <Button variant="overlay" size="sm" onClick={() => handleSfxChange(-1)} style={{ width: '40px', height: '40px', minWidth: 'auto', padding: 0, borderColor: '#f1c40f', color: '#f1c40f' }}>-</Button>
            <div className="bars">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`bar ${i < sfxVolume ? 'active' : ''}`} />
              ))}
            </div>
            <Button variant="overlay" size="sm" onClick={() => handleSfxChange(1)} style={{ width: '40px', height: '40px', minWidth: 'auto', padding: 0, borderColor: '#f1c40f', color: '#f1c40f' }}>+</Button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="setting-item" style={{ marginTop: '5px' }}>
          <label>{t.LANGUAGE}</label>
          <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
            <BlockButton
              text={t.KOREAN}
              onClick={() => setPendingLanguage('KR')}
              variant={pendingLanguage === 'KR' ? 'primary' : undefined}
              textColor={pendingLanguage === 'KR' ? '#f39c12' : undefined}
              width="160px"
              fontSize="1.3rem"
            />
            <BlockButton
              text={t.ENGLISH}
              onClick={() => setPendingLanguage('EN')}
              variant={pendingLanguage === 'EN' ? 'primary' : undefined}
              textColor={pendingLanguage === 'EN' ? '#f39c12' : undefined}
              width="160px"
              fontSize="1.3rem"
            />
          </div>
        </div>

        {/* Font Size Selection — each button shows its actual preview size */}
        <div className="setting-item" style={{ marginTop: '5px' }}>
          <label>{t.FONT_SIZE}</label>
          <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
            <BlockButton
              text={t.FONT_LARGE}
              onClick={() => setPendingFontSize('LARGE')}
              variant={pendingFontSize === 'LARGE' ? 'primary' : undefined}
              textColor={pendingFontSize === 'LARGE' ? '#f39c12' : undefined}
              width="160px"
              fontSize={fontSizePreview.LARGE}
            />
            <BlockButton
              text={t.FONT_NORMAL}
              onClick={() => setPendingFontSize('NORMAL')}
              variant={pendingFontSize === 'NORMAL' ? 'primary' : undefined}
              textColor={pendingFontSize === 'NORMAL' ? '#f39c12' : undefined}
              width="160px"
              fontSize={fontSizePreview.NORMAL}
            />
            <BlockButton
              text={t.FONT_SMALL}
              onClick={() => setPendingFontSize('SMALL')}
              variant={pendingFontSize === 'SMALL' ? 'primary' : undefined}
              textColor={pendingFontSize === 'SMALL' ? '#f39c12' : undefined}
              width="160px"
              fontSize={fontSizePreview.SMALL}
            />
          </div>
        </div>

        {/* v2.5.0: Game Speed Selection */}
        <div className="setting-item" style={{ marginTop: '5px' }}>
          <label>{t.GAME_SPEED}</label>
          <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
            <BlockButton
              text="1.0x"
              onClick={() => setGameSpeed(1.0)}
              variant={gameSpeed === 1.0 ? 'primary' : undefined}
              textColor={gameSpeed === 1.0 ? '#f39c12' : undefined}
              width="160px"
              fontSize="1.3rem"
            />
            <BlockButton
              text="1.5x"
              onClick={() => setGameSpeed(1.5)}
              variant={gameSpeed === 1.5 ? 'primary' : undefined}
              textColor={gameSpeed === 1.5 ? '#f39c12' : undefined}
              width="160px"
              fontSize="1.3rem"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
