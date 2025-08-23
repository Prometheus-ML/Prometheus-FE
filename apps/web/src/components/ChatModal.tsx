'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { ChatRoom } from '@prometheus-fe/types';
import ChatRoomModal from './ChatRoomModal';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showChatRoom, setShowChatRoom] = useState(false);
  const { user } = useAuthStore();
  
  const [state, actions] = useChat({
    autoConnect: false,
    reconnectInterval: 1000,
    maxReconnectAttempts: 3
  });

  const { rooms, isLoading, error } = state;
  const { getRooms, disconnect } = actions;

  // 컴포넌트 마운트 시 채팅방 목록 로드
  useEffect(() => {
    if (isOpen) {
      getRooms();
    }
  }, [isOpen, getRooms]);

  // 채팅방 선택
  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setShowChatRoom(true);
  };

  // 모달 닫기
  const handleClose = () => {
    console.log('Closing ChatModal, cleaning up all connections');
    if (selectedRoom) {
      disconnect();
    }
    setSelectedRoom(null);
    setShowChatRoom(false);
    onClose();
  };

  // 채팅방 모달 닫기
  const handleChatRoomClose = () => {
    console.log('Closing chat room modal, cleaning up state');
    setShowChatRoom(false);
    setSelectedRoom(null);
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showChatRoom) {
          handleChatRoomClose();
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, showChatRoom]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 모달 컨테이너 - GlassCard 스타일 */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/20">
        {/* 헤더 */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-kimm-bold text-[#FFFFFF]">
            채팅
          </h2>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 채팅방이 선택되지 않은 경우 - 채팅방 목록 */}
        {!selectedRoom && (
          <div className="flex-1 min-h-0 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-pretendard text-[#FFFFFF] mb-3">내 채팅방</h3>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50"></div>
              </div>
            ) : error ? (
              <div className="text-red-400 text-center py-12 font-pretendard">{error}</div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-white/60 text-lg font-pretendard mb-2">채팅방이 없습니다</div>
                <div className="text-white/40 text-sm font-pretendard">아직 참여한 채팅방이 없습니다</div>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    className="p-6 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 hover:border-white/30 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-kimm-bold text-[#FFFFFF] text-lg mb-2">
                          {room.name || `채팅방 ${room.id}`}
                        </h4>
                        <div className="inline-block bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-3">
                          <span className="text-white/80 text-sm font-pretendard">
                            {room.room_type === 'group' ? '그룹 채팅' : '커피챗'}
                          </span>
                        </div>
                        {room.last_message && (
                          <p className="text-white/70 text-sm mt-3 font-pretendard">
                            {room.last_message.content}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-2">
                          <span className="text-white/80 text-sm font-pretendard font-semibold">
                            {room.participant_count}명
                          </span>
                        </div>
                        {room.last_message && (
                          <div className="text-white/60 text-xs font-pretendard">
                            {new Date(room.last_message.created_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ChatRoomModal 렌더링 */}
      {showChatRoom && selectedRoom && (
        <ChatRoomModal
          isOpen={showChatRoom}
          onClose={handleChatRoomClose}
          selectedRoom={selectedRoom}
        />
      )}
    </div>
  );
};

export default ChatModal;
