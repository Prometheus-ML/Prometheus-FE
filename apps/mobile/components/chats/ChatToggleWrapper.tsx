import React, { useState } from 'react';
import ChatToggle from './ChatToggle';
import ChatModal from './ChatModal';
import { ChatRoom } from '@prometheus-fe/types';

const ChatToggleWrapper: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showChatRoom, setShowChatRoom] = useState(false);

  const handleChatToggle = (isOpen: boolean) => {
    setIsChatOpen(isOpen);
  };

  const handleCloseModal = () => {
    setIsChatOpen(false);
    setSelectedRoom(null);
    setShowChatRoom(false);
  };

  return (
    <>
      <ChatToggle 
        isOpen={isChatOpen} 
        onToggle={handleChatToggle} 
      />
      
      {/* 채팅방 목록 모달 */}
      <ChatModal 
        isOpen={isChatOpen && !showChatRoom} 
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ChatToggleWrapper;
