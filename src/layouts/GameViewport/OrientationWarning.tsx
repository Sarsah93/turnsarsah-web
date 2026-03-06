import React from 'react';
import styles from './GameViewport.module.css';

interface OrientationWarningProps {
    language: string;
}

export const OrientationWarning: React.FC<OrientationWarningProps> = ({ language }) => {
    return (
        <div className={styles.orientationWarning}>
            <div className={styles.warningIcon}>📱🔄</div>
            <div className={styles.warningText}>
                {language === 'KR'
                    ? '이 게임은 가로 모드에서 플레이해야 합니다.\n기기를 회전시켜 주세요.'
                    : 'This game is designed for landscape mode.\nPlease rotate your device.'}
            </div>
        </div>
    );
};
