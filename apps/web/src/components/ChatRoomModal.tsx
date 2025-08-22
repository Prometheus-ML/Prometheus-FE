'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { ChatRoom, ChatMessage } from '@prometheus-fe/types';

interface ChatRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: ChatRoom;
}

const ChatRoomModal: React.FC<ChatRoomModalProps> = ({ isOpen, onClose, selectedRoom }) => {
  const [messageInput, setMessageInput] = useState('');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { getAccessToken, user } = useAuthStore();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollButtonRef = useRef<HTMLButtonElement>(null);
  
  const [state, actions] = useChat({
    autoConnect: false,
    reconnectInterval: 1000,
    maxReconnectAttempts: 3
  });

  const { currentRoom, messages, isConnected, isLoading, error } = state;
  const { selectRoom, sendMessage, connect, disconnect, loadHistory } = actions;

  // 자동 스크롤 함수
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
      setShouldAutoScroll(true);
      setShowScrollButton(false);
    }
  }, []);

  // 컴포넌트 렌더링 시 상태 로깅
  console.log('ChatRoomModal render state:', {
    isOpen,
    selectedRoom: selectedRoom?.id,
    currentRoom: currentRoom?.id,
    isConnected,
    isLoading,
    error,
    messagesCount: messages.length
  });

  // 채팅방 선택 시 자동 연결
  useEffect(() => {
    if (isOpen && selectedRoom) {
      const initializeRoom = async () => {
        try {
          console.log('Initializing chat room:', selectedRoom);
          console.log('Current state - currentRoom:', currentRoom, 'isConnected:', isConnected);
          
          // 이미 같은 채팅방에 연결되어 있다면 재연결하지 않음
          if (currentRoom?.id === selectedRoom.id && isConnected) {
            console.log('Already connected to the same room, skipping initialization');
            return;
          }
          
          // 기존 연결이 있다면 먼저 해제
          if (isConnected) {
            console.log('Disconnecting from previous room before connecting to new room');
            disconnect();
            // 연결 해제 완료를 기다림
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          console.log('Calling selectRoom with roomId:', selectedRoom.id);
          await selectRoom(selectedRoom.id);
          console.log('Room selection completed');
          
        } catch (error) {
          console.error('Failed to select room:', error);
        }
      };
      
      initializeRoom();
    }
  }, [isOpen, selectedRoom, selectRoom, currentRoom?.id, isConnected, disconnect]);

  // WebSocket 연결 상태 변경 시 히스토리 로드
  useEffect(() => {
    console.log('Connection status changed:', { isConnected, currentRoom, selectedRoom, messagesLength: messages.length });
    
    if (isConnected && currentRoom && selectedRoom && currentRoom.id === selectedRoom.id) {
      console.log('WebSocket connected, loading chat history for room:', currentRoom.id);
      // 이미 메시지가 있다면 히스토리를 다시 로드하지 않음
      if (messages.length === 0) {
        loadHistory({ chat_room_id: currentRoom.id });
      } else {
        // 기존 메시지가 있다면 맨 아래로 스크롤
        setTimeout(() => scrollToBottom('auto'), 100);
      }
    }
  }, [isConnected, currentRoom, selectedRoom, loadHistory, messages.length, scrollToBottom]);

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      // 메시지가 추가될 때마다 자동으로 맨 아래로 스크롤
      setTimeout(() => scrollToBottom('smooth'), 50);
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // 채팅방 변경 시 스크롤 초기화 및 메시지 정리
  useEffect(() => {
    if (selectedRoom) {
      setShouldAutoScroll(true);
      setShowScrollButton(false);
      // 채팅방 변경 시 즉시 맨 아래로 스크롤
      setTimeout(() => scrollToBottom('auto'), 100);
    }
  }, [selectedRoom, scrollToBottom]);

  // 스크롤 위치 확인 및 자동 스크롤 제어
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    setShouldAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  }, []);

  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // currentRoom 상태 확인
    if (!currentRoom) {
      console.error('Current room is not set, cannot send message');
      return;
    }
    
    if (messageInput.trim() && isConnected) {
      console.log('Sending message:', messageInput, 'to room:', currentRoom.id);
      
      const messageToSend = messageInput.trim();
      const success = await sendMessage(messageToSend);
      
      if (success) {
        setMessageInput('');
        console.log('Message sent successfully');
        setShouldAutoScroll(true);
        // 메시지 전송 후 즉시 맨 아래로 스크롤
        setTimeout(() => scrollToBottom('smooth'), 50);
      } else {
        console.error('Failed to send message');
      }
    } else {
      console.log('Cannot send message:', { 
        hasInput: !!messageInput.trim(), 
        isConnected,
        currentRoomId: currentRoom?.id
      });
    }
  };

  // 모달 닫기
  const handleClose = () => {
    console.log('Closing ChatRoomModal, disconnecting WebSocket');
    disconnect();
    onClose();
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

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
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              title="뒤로 가기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedRoom.name || `채팅방 ${selectedRoom.id}`}
            </h2>
          </div>
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

        {/* 연결 상태 표시 */}
        {!isConnected && (
          <div className="flex-shrink-0 p-2 bg-yellow-100 border-b border-yellow-200">
            <div className="text-sm text-yellow-800 text-center">
              {isLoading ? '연결 중...' : '연결되지 않음'}
              {error && <span className="ml-2 text-red-600">({error})</span>}
            </div>
          </div>
        )}

        {/* 연결 성공 표시 */}
        {isConnected && (
          <div className="flex-shrink-0 p-2 bg-green-100 border-b border-green-200">
            <div className="text-sm text-green-800 text-center">
              연결됨 ✓
            </div>
          </div>
        )}

        {/* 채팅 메시지 영역 */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 min-h-0 p-4 overflow-y-auto bg-gray-50 scroll-smooth"
          onScroll={handleScroll}
        >
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                {isLoading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span>메시지를 불러오는 중...</span>
                  </div>
                ) : (
                  '아직 메시지가 없습니다.'
                )}
              </div>
            ) : (
              // 메시지를 시간순으로 정렬 (과거 → 최신)
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.sender_name || message.sender_id}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && messages.length > 0 && (
              <div className="text-center text-gray-500 text-sm">
                <div className="animate-pulse">메시지 로딩 중...</div>
              </div>
            )}
            
            {/* 스크롤 위치 마커 (메시지 영역 맨 아래) */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 스크롤 버튼 */}
        {showScrollButton && (
          <button
            ref={scrollButtonRef}
            onClick={() => scrollToBottom('smooth')}
            className="absolute right-6 bottom-20 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 hover:scale-110 z-10"
            title="맨 아래로 이동"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l5 5 5-5"></path>
              <path d="M7 6l5 5 5-5"></path>
            </svg>
          </button>
        )}

        {/* 메시지 입력 */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중입니다..."}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !messageInput.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '전송 중...' : '전송'}
            </button>
          </form>
          
          {/* 연결 상태 안내 */}
          {!isConnected && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              채팅방에 연결된 후 메시지를 보낼 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomModal;
