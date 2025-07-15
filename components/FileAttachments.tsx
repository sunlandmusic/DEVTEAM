import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useAutomationStore } from '../services/store';

const AttachmentContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
  width: 100%;
  max-width: 36rem;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  background: rgba(51, 51, 51, 0.8);
  border-radius: 8px;
  padding: 6px 12px;
  gap: 8px;
  backdrop-filter: blur(8px);
`;

const StatusIndicator = styled.div<{ status: 'uploading' | 'success' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ status }) => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      default:
        return '#FFC107';
    }
  }};
`;

const FileName = styled.span`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  
  &:hover {
    color: #F44336;
  }
`;

export const FileAttachments: React.FC = () => {
  const { attachments, removeAttachment } = useAutomationStore();

  const handleRemove = useCallback((id: string) => {
    removeAttachment(id);
  }, [removeAttachment]);

  if (attachments.length === 0) {
    return null;
  }

  return (
      <AttachmentContainer>
        {attachments.map((attachment) => (
          <AttachmentItem key={attachment.id}>
            <StatusIndicator status={attachment.status} />
            <FileName>{attachment.name}</FileName>
            <RemoveButton onClick={() => handleRemove(attachment.id)}>×</RemoveButton>
          </AttachmentItem>
        ))}
      </AttachmentContainer>
  );
}; 