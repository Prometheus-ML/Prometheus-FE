'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage } from '@prometheus-fe/hooks';
import { ChatRoom, ChatMessage } from '@prometheus-fe/types';
import Image from 'next/image';

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
  
  // useImage 훅 사용
  const { getThumbnailUrl, getDefaultImageUrl } = useImage({});
  
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
            // 연결 해제 완료를 기다림 - 지연 제거
            await new Promise(resolve => resolve(undefined));
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
        // 기존 메시지가 있다면 맨 아래로 스크롤 - 지연 제거
        scrollToBottom('auto');
      }
    }
  }, [isConnected, currentRoom, selectedRoom, loadHistory, messages.length, scrollToBottom]);

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      // 메시지가 추가될 때마다 자동으로 맨 아래로 스크롤 - 지연 제거
      scrollToBottom('smooth');
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // 채팅방 변경 시 스크롤 초기화 및 메시지 정리
  useEffect(() => {
    if (selectedRoom) {
      setShouldAutoScroll(true);
      setShowScrollButton(false);
      // 채팅방 변경 시 즉시 맨 아래로 스크롤 - 지연 제거
      scrollToBottom('auto');
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
        // 메시지 전송 후 즉시 맨 아래로 스크롤 - 지연 제거
        scrollToBottom('smooth');
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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* 모달 컨테이너 - GlassCard 스타일 */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/20">
        {/* 헤더 */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              title="뒤로 가기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 className="text-xl font-kimm-bold text-[#FFFFFF]">
              {selectedRoom.name || `채팅방 ${selectedRoom.id}`}
            </h2>
          </div>
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

        {/* 채팅 메시지 영역 */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 min-h-0 p-6 overflow-y-auto bg-white/5 scroll-smooth"
          onScroll={handleScroll}
        >
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-white/60 text-sm py-8 font-pretendard">
                {isLoading || !isConnected ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/50"></div>
                    <span>로딩 중...</span>
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
                  <div className="flex flex-col items-start space-y-1">
                    {/* 상대방 이름 표시 (말풍선 왼쪽 위) */}
                    {message.sender_id !== user?.id && (
                      <div className="text-sm font-medium text-white/80 font-pretendard mb-1">
                        {message.sender_name || message.sender_id}
                      </div>
                    )}
                    
                    <div className="flex items-end space-x-2">
                      {/* 시간 표시 (왼쪽) */}
                      {message.sender_id === user?.id && (
                        <div className="text-xs text-white/50 font-pretendard mb-2">
                          {new Date(message.created_at).toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                        </div>
                      )}
                      
                      {/* 프로필 이미지 (상대방 메시지만) */}
                      {message.sender_id !== user?.id && (
                                                  <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex-shrink-0 mb-2 flex items-center justify-center overflow-hidden">
                            {message.sender_profile_image ? (
                              <Image
                                src={getThumbnailUrl(message.sender_profile_image, 80)}
                                alt={`${message.sender_name || message.sender_id}의 프로필`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover rounded-full"
                                onError={() => {
                                  // 에러 발생 시 기본 아이콘으로 대체
                                  console.warn('프로필 이미지 로드 실패:', message.sender_profile_image);
                                }}
                              />
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                            )}
                          </div>
                      )}
                      
                      {/* 메시지 말풍선 */}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                          message.sender_id === user?.id
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-white/10 text-white border border-white/20'
                        }`}
                      >
                        <div className="text-sm font-pretendard">{message.content}</div>
                      </div>
                      
                      {/* 시간 표시 (오른쪽) */}
                      {message.sender_id !== user?.id && (
                        <div className="text-xs text-white/50 font-pretendard mb-2">
                          {new Date(message.created_at).toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: false 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && messages.length > 0 && (
              <div className="text-center text-white/60 text-sm font-pretendard">
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
            className="absolute right-6 bottom-24 p-3 bg-white/20 text-white rounded-full shadow-lg hover:bg-white/30 transition-all duration-200 hover:scale-110 z-10 border border-white/30"
            title="맨 아래로 이동"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l5 5 5-5"></path>
              <path d="M7 6l5 5 5-5"></path>
            </svg>
          </button>
        )}

        {/* 메시지 입력 */}
        <div className="flex-shrink-0 p-6 border-t border-white/20">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중입니다..."}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 disabled:bg-white/5 text-white placeholder-white/50 font-pretendard"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !messageInput.trim() || isLoading}
              className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed transition-all duration-200 border border-white/30 hover:border-white/40 font-pretendard"
            >
              {isLoading ? '전송 중...' : '전송'}
            </button>
          </form>
          
          {/* 연결 상태 안내 */}
          {!isConnected && (
            <div className="mt-3 text-xs text-white/50 text-center font-pretendard">
              채팅방에 연결된 후 메시지를 보낼 수 있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoomModal;
