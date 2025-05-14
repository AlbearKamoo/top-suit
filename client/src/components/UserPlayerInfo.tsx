import React from 'react';
import styled from '@emotion/styled';
import { Card as CardType, Player, PlayedHand } from '../types';
import { CardHand } from './CardHand';
import { validateHand } from '@shared/gameLogic';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-self: flex-end;
  margin-bottom: 20px;
  margin-left: -40px;
`;

// Inner container for Info and CardHand that shows active border
const Content = styled.div<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  padding: 4px;
  border: ${({ isActive }) => (isActive ? '4px solid rgba(255, 215, 0, 0.9)' : 'none')};
  border-radius: 10px;
  margin-right: 10px;
`;

const Info = styled.div`
  text-align: center;
  margin-right: 20px;
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
`;

// Styled confirm button for smaller height
const ConfirmButton = styled.button`
  height: 30px;
  padding: 4px 12px;
  font-size: 0.9rem;
  margin-left: 10px;
  border-radius: 4px;
  border: none;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  align-self: center;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`;

const SortContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const SortButton = styled.button`
  padding: 4px 8px;
  border: none;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

interface UserPlayerInfoProps {
  player: Player;
  cards: CardType[];
  selectedIndices: Set<number>;
  onCardClick: (index: number) => void;
  isActive?: boolean;
  onConfirm: () => void;
  onPass: () => void;
  onSortBySuit: () => void;
  onSortByRank: () => void;
  previousHand: PlayedHand | null;
}

export const UserPlayerInfo: React.FC<UserPlayerInfoProps> = ({
  player,
  cards,
  selectedIndices,
  onCardClick,
  isActive = false,
  onConfirm,
  onPass,
  onSortBySuit,
  onSortByRank,
  previousHand,
}) => {
  // Build the selected cards array
  const selectedCards = Array.from(selectedIndices).map(i => cards[i]);
  // Validate the selected hand against the previous hand
  const { valid } = validateHand(selectedCards, previousHand);
  // Enable button only if there is a selection and it's valid
  const canConfirm = selectedIndices.size > 0 && valid;

  return (
    <Wrapper>
      <Content isActive={isActive}>
        <Info>
          <h3>{player.name} (You)</h3>
          <p>Cards: {player.cardCount}</p>
          <p>Score: {player.score}</p>
          {isActive && (
            <SortContainer>
              <SortButton onClick={onSortBySuit}>-&gt;♥</SortButton>
              <SortButton onClick={onSortByRank}>-&gt;9</SortButton>
            </SortContainer>
          )}
        </Info>
        <CardHand
          cards={cards}
          selectedIndices={selectedIndices}
          onCardClick={onCardClick}
          canPlay={isActive}
        />
      </Content>
      {isActive && <ButtonContainer>
        <ConfirmButton onClick={onConfirm} disabled={!canConfirm}>
          Play Selected Hand
        </ConfirmButton>
        <ConfirmButton onClick={onPass} disabled={!isActive}>
          Draw and pass
        </ConfirmButton>
      </ButtonContainer> }
    </Wrapper>
  );
}; 