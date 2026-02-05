import { useEffect } from 'react';
import { useGameStore } from './state/gameStore';
import { GameState } from './constants/gameConfig';
import { VideoBackground } from './components/VideoBackground';
import { MainMenu } from './components/MainMenu';
import { BattleScreen } from './components/Battle/BattleScreen';
import './App.css';
import { AudioManager } from './utils/AudioManager';

import { Game } from './components/Game';
import { GameOverScreen } from './components/GameOverScreen';
import { FadeOverlay } from './components/Common/FadeOverlay';

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const stageNum = useGameStore((state) => state.stageNum);

  // Background Music Transition Logic
  useEffect(() => {
    if (gameState === GameState.MENU) {
      AudioManager.playBGM('/assets/backgrounds/medieval_music_openning.mp3');
    } else if (gameState === GameState.BATTLE) {
      AudioManager.playBGM('/assets/backgrounds/wilderness_background.mp3');
    }
  }, [gameState]);

  // Background Video Source
  const getBackgroundSource = () => {
    return "/assets/backgrounds/wilderness_background.mp4";
  };

  const handleGameEnd = (result: 'WIN' | 'LOSE') => {
    const store = useGameStore.getState();
    if (result === 'WIN') {
      if (stageNum >= 10) {
        store.triggerTransition(() => store.setGameState(GameState.GAMEOVER));
      } else {
        store.triggerTransition(() => store.initGame(stageNum + 1));
      }
    } else {
      // LOSE
      if (stageNum === 6) {
        // Special Case Stage 6: Restore HP and Proceed to 7
        const restoredHp = store.stage6EntryHp;
        store.triggerTransition(() => {
          store.initGame(7);
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
        {(gameState === GameState.BATTLE || gameState === GameState.VICTORY || gameState === GameState.GAMEOVER) && <BattleScreen />}
      </div>
    </div>
  );
}

export default App;
