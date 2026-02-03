import { useEffect } from 'react';
import { useGameStore } from './state/gameStore';
import { GameState } from './constants/gameConfig';
import { VideoBackground } from './components/VideoBackground';
import { MainMenu } from './components/MainMenu';
import { BattleScreen } from './components/Battle/BattleScreen';
import './App.css';
import { AudioManager } from './utils/AudioManager';

import { GameOverScreen } from './components/GameOverScreen';

function App() {
  const gameState = useGameStore((state) => state.gameState);

  // Background Music Logic ... (unchanged)

  return (
    <div className="App">
      {/* Background Video Layer */}
      <VideoBackground source="/assets/backgrounds/wilderness_background.mp4" />

      {/* UI Layer */}
      <div className="ui-layer">
        {gameState === GameState.MENU && <MainMenu />}
        {gameState === GameState.BATTLE && <BattleScreen />}
        {gameState === GameState.GAMEOVER && <GameOverScreen />}
      </div>
    </div>
  );
}

export default App;
