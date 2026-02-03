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

function App() {
  const gameState = useGameStore((state) => state.gameState);
  const stageNum = useGameStore((state) => state.stageNum);

  // Background Music Transition Logic
  useEffect(() => {
    if (gameState === GameState.MENU) {
      AudioManager.playBGM('/assets/backgrounds/medieval_music_openning.mp3');
    } else if (gameState === GameState.BATTLE) {
      // Wilderness music for battle, but ensure opening music stops
      AudioManager.playBGM('/assets/backgrounds/wilderness_background.mp3');
    }
  }, [gameState]);

  // Background Video Source with Robust Fallback
  const getBackgroundSource = () => {
    if (gameState === GameState.BATTLE) {
      // Try stage-specific video, fallback to wilderness if missing (which we know it is for now)
      // As verified, only wilderness_background.mp4 exists in backgrounds folder
      return "/assets/backgrounds/wilderness_background.mp4";
    }
    return "/assets/backgrounds/wilderness_background.mp4";
  };

  return (
    <div className="App">
      {/* Background Video Layer */}
      <VideoBackground source={getBackgroundSource()} />

      {/* UI Layer */}
      <div className="ui-layer">
        {gameState === GameState.MENU && <MainMenu />}
        {gameState === GameState.BATTLE && <Game />}
        {gameState === GameState.GAMEOVER && <GameOverScreen />}
      </div>
    </div>
  );
}

export default App;
