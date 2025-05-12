import styled from '@emotion/styled';
import { Card as CardType, Player } from '../types';
import { CardHand } from './CardHand';
import { useState } from 'react';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const GameTable = styled.div`
  width: 800px;
  height: 600px;
  background-color: #277714;
  border-radius: 200px;
  position: relative;
  margin: 2rem auto;
  border: 20px solid #5c3a21;
  display: flex;
  justify-content: center;
  align-items: center;
`

const PlayerPosition = styled.div<{ position: 'top' | 'left' | 'right' | 'bottom' }>`
  position: absolute;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  color: white;
  
  ${({ position }) => {
    switch (position) {
      case 'top':
        return 'top: 20px; left: 50%; transform: translateX(-50%);';
      case 'left':
        return 'left: 20px; top: 50%; transform: translateY(-50%);';
      case 'right':
        return 'right: 20px; top: 50%; transform: translateY(-50%);';
      case 'bottom':
        return 'bottom: 20px; left: 50%; transform: translateX(-50%);';
    }
  }}
`

const PlayerInfo = styled.div`
  text-align: center;
  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #fff;
    margin-bottom: 0.5rem;
  }
  p {
    margin: 5px 0;
    font-size: 1rem;
    color: #ccc;
  }
`

const UserPlayerInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  margin-bottom: 20px
`

const DrawPile = styled.div`
  position: relative;
  width: 70px;
  height: 100px;
  left: 400px;
  
  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 70px;
    height: 100px;
    background: #C41E3A;
    border: 2px solid white;
    border-radius: 10px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 70px;
    height: 100px;
    background: #C41E3A;
    border: 2px solid white;
    border-radius: 10px;
  }
`

const DrawPileCount = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
  z-index: 1;
`

interface GameScreenProps {
  players: Player[];
  currentPlayerId: string;
  cards: CardType[];
  drawPileCount: number;
  onPlayHand: (indices: number[]) => void;
}

const getPlayerPositions = (players: Player[], currentPlayerId: string) => {
  const positions: ('top' | 'left' | 'right' | 'bottom')[] = [];
  const playerIndex = players.findIndex(p => p.id === currentPlayerId);
  const otherPlayers = [...players.slice(playerIndex + 1), ...players.slice(0, playerIndex)];

  if (players.length === 3) {
    positions.push('top');
    positions.push('left');
  } else if (players.length === 4) {
    positions.push('top');
    positions.push('right');
    positions.push('left');
  }

  return otherPlayers.map((player, index) => ({
    ...player,
    position: positions[index]
  }));
};

export const GameScreen: React.FC<GameScreenProps> = ({
  players,
  currentPlayerId,
  cards,
  drawPileCount,
  onPlayHand
}) => {
  const otherPlayers = getPlayerPositions(players, currentPlayerId);
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleCardSelection = (index: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const confirmPlay = () => {
    if (onPlayHand && selectedIndices.size > 0) {
      onPlayHand(Array.from(selectedIndices));
      setSelectedIndices(new Set());
    }
  };

  return (
    <Container>
      <h1>Game Started!</h1>
      <GameTable>
        {otherPlayers.map(player => (
          <PlayerPosition key={player.id} position={player.position}>
            <PlayerInfo>
              <h3>{player.name}</h3>
              <p>Cards: {player.cardCount}</p>
              <p>Score: {player.score}</p>
            </PlayerInfo>
          </PlayerPosition>
        ))}
        <DrawPile>
          <DrawPileCount>{drawPileCount} cards</DrawPileCount>
        </DrawPile>
        <UserPlayerInfo>
          {currentPlayer && (
            <PlayerInfo>
              <h3>{currentPlayer.name} (You)</h3>
              <p>Cards: {currentPlayer.cardCount}</p>
              <p>Score: {currentPlayer.score}</p>
            </PlayerInfo>
          )}
          <CardHand
            cards={cards}
            selectedIndices={selectedIndices}
            onCardClick={toggleCardSelection}
          />
        </UserPlayerInfo>
        <button onClick={confirmPlay} disabled={selectedIndices.size === 0}>
          Play Selected Hand
        </button>
      </GameTable>
    </Container>
  );
}; 