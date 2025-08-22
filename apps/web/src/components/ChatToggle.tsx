'use client';

import React from 'react';

interface ChatToggleProps {
  onToggle: (isOpen: boolean) => void;
  isOpen: boolean;
}

const ChatToggle: React.FC<ChatToggleProps> = ({ onToggle, isOpen }) => {
  const handleClick = () => {
    onToggle(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
          flex items-center justify-center
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 text-white transform scale-110' 
            : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-110'
          }
        `}
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
      
      {/* 알림 뱃지 (새 메시지가 있을 때) */}
      {!isOpen && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">3</span>
        </div>
      )}
    </div>
  );
};

export default ChatToggle;
