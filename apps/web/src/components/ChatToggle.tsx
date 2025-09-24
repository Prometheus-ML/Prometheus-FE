'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface ChatToggleProps {
  onToggle: (isOpen: boolean) => void;
  isOpen: boolean;
}

const ChatToggle: React.FC<ChatToggleProps> = ({ onToggle, isOpen }) => {
  const pathname = usePathname();
  
  // 루트 페이지(/)에서는 ChatToggle을 숨김
  if (pathname === '/' || pathname === '/about' || pathname === '/auth/login' || pathname === '/auth/google') {
    return null;
  }

  const handleClick = () => {
    onToggle(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-300 ease-in-out
          flex items-center justify-center border
          ${isOpen 
            ? 'bg-[#8B0000]/20 hover:bg-[#8B0000]/40 border-[#c2402a] text-[#ffa282] transform scale-110' 
            : 'bg-[#8B0000]/20 hover:bg-[#8B0000]/40 border-[#c2402a]/30 text-[#ffa282] hover:scale-110 hover:border-[#c2402a]'
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
    </div>
  );
};

export default ChatToggle;
