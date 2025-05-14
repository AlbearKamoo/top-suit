import React from 'react';
import styled from '@emotion/styled';
import SuitDiamonds from '../assets/SuitDiamonds.png';
import SuitDiagram from '../assets/SuitDiagram.png';

const FixedBox = styled.div`
  position: fixed;
  bottom: 16px;
  left: 16px;
  background: rgba(255,255,255,0.9);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
`

export const SuitHierarchyDiagram: React.FC = () => (
  <FixedBox>
    <ContentWrapper>
      <img src={SuitDiamonds} alt="Suit Diamonds" style={{ width: '52px', height: 'auto' }} />
      <img src={SuitDiagram} alt="Suit Diagram" style={{ width: '128px', height: '142px', objectFit: 'cover' }} />
    </ContentWrapper>
  </FixedBox>
); 