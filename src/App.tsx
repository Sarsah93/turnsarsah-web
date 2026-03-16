import { useEffect, useState } from 'react';
import { useGameStore } from './state/gameStore';
import { GameState } from './constants/gameConfig';
import { VideoBackground } from './components/VideoBackground';
import { MainMenu } from './components/MainMenu';
import { BattleScreen } from './components/Battle/BattleScreen';
import { ChapterSelect } from './components/ChapterSelect';
import { ChapterNextPopup } from './components/ChapterNextPopup';
import './App.css';
// import './responsive.css';
import './styles/safe-area.css';
import { AudioManager } from './utils/AudioManager';
import { SaveManager, SAVE_VERSION } from './utils/SaveManager';

import { FadeOverlay } from './components/Common/FadeOverlay';
import { TRANSLATIONS } from './constants/translations';
import { GameViewport } from './layouts/GameViewport/GameViewport';

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const stageNum = useGameStore((state) => state.stageNum);
  const chapterNum = useGameStore((state) => state.chapterNum);
  const fontSize = useGameStore((state) => state.fontSize);
  const language = useGameStore((state) => state.language);
  const t = TRANSLATIONS[language];

  // Version migration popup state
  const [showVersionNotice, setShowVersionNotice] = useState(false);

  // Version check and Scroll reset on mount
  useEffect(() => {
    // Force scroll to top on mount to fix UI shift issues
    window.scrollTo(0, 0);
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const wasWiped = SaveManager.checkAndMigrateVersion();
    if (wasWiped) {
      setShowVersionNotice(true);
      // v2.4.1: Refresh store state after migration wipes localStorage
      useGameStore.getState().syncDifficulties();
    }
  }, []);

  // Global Font Size Handling
  useEffect(() => {
    if (fontSize === 'SMALL') {
      document.documentElement.classList.add('font-small-root');
      document.documentElement.classList.remove('font-normal-root');
    } else if (fontSize === 'NORMAL') {
      document.documentElement.classList.add('font-normal-root');
      document.documentElement.classList.remove('font-small-root');
    } else {
      document.documentElement.classList.remove('font-small-root', 'font-normal-root');
    }
  }, [fontSize]);

  // Background Music Transition Logic
  useEffect(() => {
    if (gameState === GameState.MENU) {
      AudioManager.playBGM('/assets/backgrounds/audio sounds/medieval_music_openning.mp3');
    } else if (gameState === GameState.BATTLE || gameState === GameState.TUTORIAL) {
      let bgm = 'meadow field_background.mp3';
      if (chapterNum === '2A') bgm = 'desert_background.mp3';
      else if (chapterNum === '2B') bgm = 'deep forest.mp3';
      else if (chapterNum === '3A') bgm = 'cave_background.mp3';
      else if (chapterNum === '3B') bgm = 'swamp_background.mp3';

      AudioManager.playBGM(`/assets/backgrounds/audio sounds/${bgm}`);
    }
  }, [gameState, chapterNum]);

  // Background Video Source
  const getBackgroundSource = () => {
    if (gameState === GameState.MENU) {
      return "/assets/backgrounds/video/wilderness_background.mp4";
    }

    if (chapterNum === '2A') {
      return "/assets/backgrounds/video/desert_background.mp4";
    }
    if (chapterNum === '2B') {
      return "/assets/backgrounds/video/deep forest.mp4";
    }
    if (chapterNum === '3A') {
      return "/assets/backgrounds/video/cave_background.mp4";
    }
    if (chapterNum === '3B') {
      return "/assets/backgrounds/video/swamp_background.mp4";
    }

    // Default Chapter 1
    return "/assets/backgrounds/video/meadow field_background.mp4";
  };

  const handleGameEnd = (result: 'WIN' | 'LOSE') => {
    const store = useGameStore.getState();
    if (result === 'WIN') {
      if (chapterNum === '1' && stageNum === 10) {
        store.triggerTransition(() => store.setGameState(GameState.CHAPTER_SELECT));
      } else if (chapterNum === '2A' && stageNum === 11) {
        // 2A 스페셜 스테이지(SAND DRAGON) 클리어 → 챕터 3A 연결 팝업
        store.triggerTransition(() => {
          store.setNextChapterId('3A');
          store.setGameState(GameState.CHAPTER_NEXT);
        });
      } else if (chapterNum === '2A' && stageNum === 10) {
        // 2A-10(SPHINX) 클리어 → 스페셜 스테이지 진입
        store.triggerTransition(() => store.initGame('2A', 11));
      } else if (chapterNum.startsWith('2') && stageNum === 10) {
        // 2B-10 클리어 (향후 3B 추가 전까지 임시 GAMEOVER)
        store.triggerTransition(() => store.setGameState(GameState.GAMEOVER));
      } else if (chapterNum === '3A' && stageNum === 10) {
        // 3A-10(HYDRA) 클리어 → 엔딩(향후 추가 챕터 연결)
        store.triggerTransition(() => store.setGameState(GameState.GAMEOVER));
      } else {
        store.triggerTransition(() => store.initGame(chapterNum, stageNum + 1));
      }
    } else {
      if (chapterNum === '1' && stageNum === 6) {
        const restoredHp = store.stage6EntryHp;
        store.triggerTransition(() => {
          store.initGame('1', 7);
          store.setPlayerHp(restoredHp);
          store.setMessage(t.COMBAT.PROCEED_STAGE7);
        });
      } else {
        store.triggerTransition(() => store.setGameState(GameState.MENU));
      }
    }
  };

  return (
    <GameViewport>
      <div className="App">
        {/* Global Transition Overlay */}
        <FadeOverlay />

        {/* Background Video Layer */}
        <VideoBackground source={getBackgroundSource()} />

        {/* UI Layer */}
        <div className="ui-layer">
          {gameState === GameState.MENU && <MainMenu />}
          {gameState === GameState.CHAPTER_SELECT && <ChapterSelect />}
          {gameState === GameState.CHAPTER_NEXT && <ChapterNextPopup />}
          {(gameState === GameState.BATTLE || gameState === GameState.TUTORIAL || gameState === GameState.VICTORY || gameState === GameState.GAMEOVER) && <BattleScreen />}
        </div>

        {/* Version Migration Notice Popup */}
        {showVersionNotice && (
          <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.82)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999,
            fontFamily: "'Noto Sans KR', 'Bebas Neue', sans-serif"
          }}>
            <div style={{
              backgroundColor: '#1a1a2e',
              border: '2px solid #e67e22',
              borderRadius: '12px',
              padding: '32px 36px',
              maxWidth: '480px',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(230,126,34,0.3)',
            }}>
              <div style={{ fontSize: '2.4rem', color: '#e67e22', marginBottom: '8px', fontFamily: "'Bebas Neue', sans-serif" }}>
                ⚠ VERSION UPDATE
              </div>
              <div style={{ fontSize: '2.4rem', color: '#e67e22', marginBottom: '16px', letterSpacing: '1px' }}>
                {SAVE_VERSION}
              </div>
              <p style={{ color: '#ecf0f1', fontSize: '2.4rem', lineHeight: '1.4', marginBottom: '24px', whiteSpace: 'pre-line' }}>
                {language === 'KR'
                  ? '최신 버전으로 업데이트됨에 따라, 기존에 저장된 데이터가 손상되거나 게임 진행에 오류를 발생시킬 수 있으므로 초기화를 진행합니다.\n\n저장 데이터 및 제단 데이터가 초기화되었습니다.'
                  : 'The game has been updated to the latest version. Existing save data may be corrupted or cause errors, so all data has been reset.\n\nSave data and Altar data have been cleared.'}
              </p>
              <button
                onClick={() => setShowVersionNotice(false)}
                style={{
                  backgroundColor: '#e67e22', color: '#fff',
                  border: 'none', borderRadius: '8px',
                  padding: '12px 40px',
                  fontSize: '1.3rem', fontFamily: "'Bebas Neue', sans-serif",
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(230,126,34,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {language === 'KR' ? '확인' : 'CONFIRM'}
              </button>
            </div>
          </div>
        )}
      </div>
    </GameViewport>
  );
}

export default App;
