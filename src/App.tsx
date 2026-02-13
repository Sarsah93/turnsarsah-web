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

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const stageNum = useGameStore((state) => state.stageNum);
  const chapterNum = useGameStore((state) => state.chapterNum);

  // Background Music Transition Logic
  useEffect(() => {
    if (gameState === GameState.MENU) {
      AudioManager.playBGM('/assets/backgrounds/medieval_music_openning.mp3');
    } else if (gameState === GameState.BATTLE || gameState === GameState.TUTORIAL) {
      AudioManager.playBGM('/assets/backgrounds/meadow field_background.mp3');
    }
  }, [gameState]);

  // Background Video Source
  const getBackgroundSource = () => {
    if (gameState === GameState.MENU) {
      return "/assets/backgrounds/wilderness_background.mp4";
    }
    // Chapter 2 (A or B) uses black screen (empty source/mock)
    if (chapterNum.startsWith('2')) {
      return ""; // No video = black background (assuming CSS handles it)
    }
    return "/assets/backgrounds/meadow field_background.mp4";
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
          store.setMessage("DEFEAT... PROCEEDING TO STAGE 7");
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
