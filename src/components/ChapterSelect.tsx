import React from 'react';
import { useGameStore } from '../state/gameStore';
import { BlockButton } from './BlockButton';

export const ChapterSelect: React.FC = () => {
    const { initGame, triggerTransition, setChapterNum } = useGameStore();

    const handleSelectChapter = (chapterId: string) => {
        triggerTransition(() => {
            initGame(chapterId, 1);
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            color: '#fff',
            fontFamily: "'Bebas Neue', sans-serif"
        }}>
            <h1 style={{ fontSize: '4rem', color: '#f1c40f', marginBottom: '20px', textShadow: '0 0 20px rgba(241,196,15,0.5)' }}>
                SELECT NEXT CHAPTER
            </h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '50px', letterSpacing: '2px' }}>
                당신의 다음 여정을 선택하세요.
            </p>

            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '300px', height: '150px',
                        background: 'linear-gradient(45deg, #e67e22, #f39c12)',
                        borderRadius: '15px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '3rem', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 0 30px rgba(230,126,34,0.3)',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        DESERT
                    </div>
                    <BlockButton
                        text="2A: 사막 지대"
                        onClick={() => handleSelectChapter('2A')}
                        width="300px"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: '300px', height: '150px',
                        background: 'linear-gradient(45deg, #27ae60, #2ecc71)',
                        borderRadius: '15px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '3rem', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 0 30px rgba(39,174,96,0.3)',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        FOREST
                    </div>
                    <BlockButton
                        text="2B: 깊은 숲"
                        onClick={() => handleSelectChapter('2B')}
                        width="300px"
                    />
                </div>
            </div>
        </div>
    );
};
