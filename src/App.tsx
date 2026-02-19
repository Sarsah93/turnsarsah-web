import { useEffect } from 'react';
import { useGameStore } from './state/gameStore';
import { GameState } from './constants/gameConfig';
import { VideoBackground } from './components/VideoBackground';
import { MainMenu } from './components/MainMenu';
import { BattleScreen } from './components/Battle/BattleScreen';
import { ChapterSelect } from './components/ChapterSelect';
import './App.css';
import { AudioManager } from './utils/AudioManager';

import { Game } from './components/Game';
import { GameOverScreen } from './components/GameOverScreen';
import { FadeOverlay } from './components/Common/FadeOverlay';
import { TRANSLATIONS } from './constants/translations';

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const stageNum = useGameStore((state) => state.stageNum);
  const chapterNum = useGameStore((state) => state.chapterNum);
  const fontSize = useGameStore((state) => state.fontSize);
  const language = useGameStore((state) => state.language);
  const t = TRANSLATIONS[language];

  // Global Font Size Handling
  useEffect(() => {
    if (fontSize === 'SMALL') {
      document.documentElement.classList.add('font-small-root');
    } else {
      document.documentElement.classList.remove('font-small-root');
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

    // Default Chapter 1
    return "/assets/backgrounds/video/meadow field_background.mp4";
  };

  const handleGameEnd = (result: 'WIN' | 'LOSE') => {
    const store = useGameStore.getState();
    if (result === 'WIN') {
      if (chapterNum === '1' && stageNum === 10) {
        // Chapter 1 End -> Selection
        store.triggerTransition(() => store.setGameState(GameState.CHAPTER_SELECT));
      } else if (chapterNum.startsWith('2') && stageNum === 10) {
        // Final Chapter End -> GameOver
        store.triggerTransition(() => store.setGameState(GameState.GAMEOVER));
      } else {
        // Next Stage
        store.triggerTransition(() => store.initGame(chapterNum, stageNum + 1));
      }
    } else {
      // LOSE
      if (chapterNum === '1' && stageNum === 6) {
        // Special Case Stage 6: Restore HP and Proceed to 7
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
    <div className="App">
      {/* Global Transition Overlay */}
      <FadeOverlay />

      {/* Background Video Layer */}
      <VideoBackground source={getBackgroundSource()} />

      {/* UI Layer */}
      <div className="ui-layer">
        {gameState === GameState.MENU && <MainMenu />}
        {gameState === GameState.CHAPTER_SELECT && <ChapterSelect />}
        {(gameState === GameState.BATTLE || gameState === GameState.TUTORIAL || gameState === GameState.VICTORY || gameState === GameState.GAMEOVER) && <BattleScreen />}
      </div>
    </div>
  );
}

export default App;
