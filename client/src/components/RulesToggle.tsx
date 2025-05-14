import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { RulesModal } from './RulesModal';

const ToggleButton = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background-color: #1565c0; }
`;

// Fetch rules from public folder
// NOTE: RULES.md should be placed in client/public

export const RulesToggle: React.FC = () => {
  const [showRules, setShowRules] = useState(false);
  const [content, setContent] = useState<string>('');
  useEffect(() => {
    fetch('/RULES.md')
      .then((res) => res.text())
      .then(setContent)
      .catch(console.error);
  }, []);
  return (
    <>
      <ToggleButton onClick={() => setShowRules(true)}>Rules</ToggleButton>
      {showRules && (
        <RulesModal content={content} onClose={() => setShowRules(false)} />
      )}
    </>
  );
}; 