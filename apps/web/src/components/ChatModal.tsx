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
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* 모달 컨테이너 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            채팅
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 채팅방이 선택되지 않은 경우 - 채팅방 목록 */}
        {!selectedRoom && (
          <div className="flex-1 min-h-0 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">내 채팅방</h3>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomSelect(room)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {room.name || `채팅방 ${room.id}`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {room.room_type === 'group' ? '그룹 채팅' : '커피챗'}
                        </p>
                        {room.last_message && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {room.last_message.content}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">
                          {room.participant_count}명
                        </span>
                        {room.last_message && (
                          <div className="text-xs text-gray-400 mt-1">
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
