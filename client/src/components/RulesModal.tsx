import React from 'react';
import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  width: 80vw;
  max-width: 800px;
  height: 80vh;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
`;

const CloseButton = styled.button`
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Content = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 10px;
`;

interface RulesModalProps {
  content: string;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ content, onClose }) => (
  <Overlay>
    <Modal>
      <Header>
        <Title>Rules</Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>
      <Content>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </Content>
    </Modal>
  </Overlay>
); 