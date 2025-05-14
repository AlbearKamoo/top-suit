import styled from '@emotion/styled';
import { Player } from '../types';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Button = styled.button`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`

const Input = styled.input`
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
`

const GameCode = styled.div`
  font-size: 24px;
  margin: 20px 0;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  display: inline-block;
`

interface LobbyScreenProps {
  playerName: string;
  gameCode: string;
  players: Player[];
  error: string;
  onPlayerNameChange: (name: string) => void;
  onGameCodeChange: (code: string) => void;
  onCreateGame: () => void;
  onJoinGame: () => void;
  onStartGame: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  playerName,
  gameCode,
  players,
  error,
  onPlayerNameChange,
  onGameCodeChange,
  onCreateGame,
  onJoinGame,
  onStartGame
}) => {
  return (
    <Container>
      <h1>Top Suit</h1>
      <div>
        <Input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
        />
      </div>
      <div>
        <Button onClick={onCreateGame}>Create New Game</Button>
      </div>
      <div>
        <Input
          type="text"
          placeholder="Enter game code"
          value={gameCode}
          onChange={(e) => onGameCodeChange(e.target.value.toUpperCase())}
        />
        <Button onClick={onJoinGame}>Join Game</Button>
      </div>
      {players.length >= 3 && (<div>
        <Button onClick={onStartGame}>Start Game</Button>
      </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {gameCode && players.length >= 1 && (
        <div>
          <h2>Game Code:</h2>
          <GameCode>{gameCode}</GameCode>
          <h3>Players:</h3>
          <ul>
            {players.map(player => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
          <p>Waiting for players... (3-4 players needed)</p>
        </div>
      )}
    </Container>
  );
}; 