import styled from '@emotion/styled';
import { Card as CardType } from '../types';

const HandContainer = styled.div<{ cards: number}>`
  display: flex;
  width : ${props => props.cards * 30 + 40}px;
  position: relative;
  height: 120px;
  margin-top: 1rem;
  padding: 0 30px;
`

const Card = styled.div<{ index: number }>`
  position: absolute;
  left: ${props => props.index * 30}px;
  width: 70px;
  height: 100px;
  padding: 8px;
  border: 2px solid #000;
  border-radius: 10px;
  background: white;
  font-size: 20px;
  cursor: pointer;
  user-select: none;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  color: black;

  &:hover {
    transform: translateY(-20px);
    z-index: 100;
  }

  &.red {
    color: red;
  }
`

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
  gap: 2px;
`

const Suit = styled.div`
  font-size: 24px;
  line-height: 1;
`

const Rank = styled.div`
  font-size: 20px;
  line-height: 1;
`

interface CardHandProps {
  cards: CardType[];
}

const isRedSuit = (suit: CardType['suit']) => {
  return suit === '♥' || suit === '♦';
};

export const CardHand: React.FC<CardHandProps> = ({ cards }) => {
  return (
    <HandContainer cards={cards.length}>
      {cards.map((card, index) => (
        <Card
          key={index}
          index={index}
          className={isRedSuit(card.suit) ? 'red' : ''}
          style={{ zIndex: index }}
        >
          <CardContent>
            <Suit>{card.suit}</Suit>
            <Rank>{card.rank}</Rank>
          </CardContent>
        </Card>
      ))}
    </HandContainer>
  );
}; 