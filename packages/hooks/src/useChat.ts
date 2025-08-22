import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useApi } from '@prometheus-fe/context';
import { useAuthStore } from '@prometheus-fe/stores';
import {
  ChatRoom,
  ChatMessage,
  ChatRoomParticipant,
  ChatRoomInvitation,
  ChatMessageCreate,
  ChatRoomCreate,
  ChatRoomInvitationCreate,
  ChatHistoryRequest,
  ChatRoomListRequest,
  WebSocketMessage,
  TypingIndicator,
  ReadReceipt,
  ChatWebSocketEvent
} from '@prometheus-fe/types';

export interface UseChatOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  participants: ChatRoomParticipant[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatActions {
  // 채팅방 관리
  createRoom: (data: ChatRoomCreate) => Promise<ChatRoom | null>;
  getRooms: (request?: ChatRoomListRequest) => Promise<void>;
  selectRoom: (roomId: number) => Promise<void>;
  leaveRoom: (roomId: number) => Promise<boolean>;
  
  // 메시지 관리
  sendMessage: (content: string, messageType?: 'text' | 'image' | 'file' | 'system') => Promise<boolean>;
  loadHistory: (request?: ChatHistoryRequest) => Promise<void>;
  markAsRead: (messageId: number) => Promise<boolean>;
  
  // 참여자 관리
  addParticipant: (memberId: string, role?: string) => Promise<boolean>;
  removeParticipant: (memberId: string) => Promise<boolean>;
  
  // 초대 관리
  inviteMember: (data: ChatRoomInvitationCreate) => Promise<ChatRoomInvitation | null>;
  respondToInvitation: (invitationId: number, response: 'accepted' | 'rejected') => Promise<boolean>;
  
  // 웹소켓 관리
  connect: (roomId: number) => Promise<void>;
  disconnect: () => void;
  
  // 타이핑 표시
  sendTypingIndicator: (isTyping: boolean) => void;
  
  // 읽음 확인
  sendReadReceipt: (messageId: number) => void;
}

export const useChat = (options: UseChatOptions = {}): [ChatState, ChatActions] => {
  const {
    autoConnect = false,
    reconnectInterval = 1000, // 5초 → 1초로 단축
    maxReconnectAttempts = 3  // 5회 → 3회로 단축
  } = options;

  const { chat: chatApi } = useApi();
  const { getAccessToken, user } = useAuthStore();
  
  // 상태 관리
  const [state, setState] = useState<ChatState>({
    rooms: [],
    currentRoom: null,
    messages: [],
    participants: [],
    isConnected: false,
    isLoading: false,
    error: null
  });

  // 웹소켓 관련 refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 현재 사용자 ID 가져오기
  const getCurrentUserId = useCallback((): string | null => {
    return user?.id || null;
  }, [user]);

  // 웹소켓 연결
  const connect = useCallback(async (roomId: number) => {
    try {
      const token = getAccessToken();
      if (!token) {
        setState(prev => ({ ...prev, error: '인증 토큰이 없습니다.' }));
        return;
      }

      // 이미 연결된 상태라면 재사용 (같은 채팅방인 경우)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && state.currentRoom?.id === roomId) {
        console.log('WebSocket already connected to the same room, reusing connection');
        return;
      }

      // 기존 연결이 있다면 정리
      if (wsRef.current) {
        console.log('Cleaning up existing WebSocket connection');
        // 재연결 타이머 정리
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        // 기존 연결 해제
        wsRef.current.close(1000, 'Switching to new room');
        wsRef.current = null;
      }

      // 연결 시도 중 상태로 설정
      setState(prev => ({ ...prev, isConnected: false, isLoading: true, error: null }));

      const wsUrl = chatApi.getWebSocketUrl(roomId, token);
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      // 연결 타임아웃 설정 (5초)
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket connection timeout, closing connection');
          ws.close();
          setState(prev => ({ 
            ...prev, 
            error: '연결 시간 초과',
            isLoading: false 
          }));
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket connected successfully to room:', roomId);
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          error: null,
          isLoading: false
        }));
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data: ChatWebSocketEvent = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket closed:', event.code, event.reason);
        
        setState(prev => ({ 
          ...prev, 
          isConnected: false,
          isLoading: false 
        }));
        
        // 정상 종료가 아닌 경우에만 재연결 시도
        if (event.code !== 1000 && event.code !== 1001 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          console.log(`Attempting to reconnect in ${reconnectInterval}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect(roomId);
          }, reconnectInterval);
        } else if (event.code === 1000 || event.code === 1001) {
          console.log('WebSocket closed normally, not reconnecting');
        } else {
          console.log('Max reconnection attempts reached');
        }
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          error: '웹소켓 연결 오류가 발생했습니다.',
          isLoading: false 
        }));
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setState(prev => ({ 
        ...prev, 
        error: '연결에 실패했습니다.',
        isLoading: false 
      }));
    }
  }, [chatApi, getAccessToken, reconnectInterval, maxReconnectAttempts, state.currentRoom?.id]);

  // 웹소켓 연결 해제
  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket connection');
    
    // 재연결 타이머 정리
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // 웹소켓 연결 해제
    if (wsRef.current) {
      // 정상 종료 코드로 연결 해제
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    // 상태 초기화
    setState(prev => ({ 
      ...prev, 
      isConnected: false,
      isLoading: false,
      error: null
    }));
    
    // 재연결 시도 횟수 초기화
    reconnectAttemptsRef.current = 0;
  }, []);

  // 웹소켓 메시지 처리
  const handleWebSocketMessage = useCallback((data: ChatWebSocketEvent) => {
    console.log('Processing WebSocket message:', data);
    
    // 타입 가드를 사용하여 각 이벤트 타입을 안전하게 처리
    if ('type' in data) {
      switch (data.type) {
        case 'chat_message':
          // ChatMessage 타입인지 확인 (모든 필수 속성이 있는지)
          if ('id' in data && 'chat_room_id' in data && 'sender_id' in data && 
              'content' in data && 'message_type' in data && 'created_at' in data) {
            const message = data as unknown as ChatMessage;
            
            setState(prev => {
              // 임시 메시지가 있다면 실제 메시지로 교체, 없다면 새로 추가
              const existingTempMessage = prev.messages.find(m => 
                m.id < 0 && m.sender_id === message.sender_id && 
                m.content === message.content && 
                Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime()) < 5000 // 5초 이내
              );
              
              if (existingTempMessage) {
                // 임시 메시지를 실제 메시지로 교체
                return {
                  ...prev,
                  messages: prev.messages
                    .filter(m => m.id !== existingTempMessage.id)
                    .concat(message)
                };
              } else {
                // 새 메시지 추가
                return {
                  ...prev,
                  messages: prev.messages.filter(m => m.id !== message.id).concat(message)
                };
              }
            });
            console.log('Chat message processed:', message);
          } else {
            console.warn('Invalid chat message format:', data);
          }
          break;
          
        case 'connection_status':
          if ('status' in data) {
            console.log('Connection status update:', data.status);
            setState(prev => ({ 
              ...prev, 
              isConnected: data.status === 'connected' 
            }));
          }
          break;
          
        case 'typing':
          const typingData = data as TypingIndicator;
          console.log('Typing indicator received:', typingData);
          // 타이핑 표시 로직 구현 (필요시)
          break;
          
        case 'read_receipt':
          const readData = data as ReadReceipt;
          console.log('Read receipt received:', readData);
          // 읽음 확인 로직 구현 (필요시)
          break;
          
        case 'message_sent':
          console.log('Message sent confirmation:', data);
          // 메시지 전송 확인 처리
          break;
          
        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } else if ('id' in data && 'chat_room_id' in data && 'sender_id' in data && 
               'content' in data && 'message_type' in data && 'created_at' in data) {
      // ChatMessage 타입인지 확인 (모든 필수 속성이 있는지)
      const message = data as unknown as ChatMessage;
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== message.id).concat(message)
      }));
      console.log('Chat message added to state (fallback)');
    } else {
      console.log('Unrecognized WebSocket message format:', data);
    }
  }, []);

  // 채팅방 생성
  const createRoom = useCallback(async (data: ChatRoomCreate): Promise<ChatRoom | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const room = await chatApi.createChatRoom(data);
      setState(prev => ({ 
        ...prev, 
        rooms: [...prev.rooms, room],
        isLoading: false 
      }));
      return room;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      setState(prev => ({ 
        ...prev, 
        error: '채팅방 생성에 실패했습니다.',
        isLoading: false 
      }));
      return null;
    }
  }, [chatApi]);

  // 채팅방 목록 조회
  const getRooms = useCallback(async (request: ChatRoomListRequest = {}) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const rooms = await chatApi.getChatRooms(request);
      setState(prev => ({ 
        ...prev, 
        rooms,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Failed to get chat rooms:', error);
      setState(prev => ({ 
        ...prev, 
        error: '채팅방 목록을 가져오는데 실패했습니다.',
        isLoading: false 
      }));
    }
  }, [chatApi]);

  // 채팅 기록 로드
  const loadHistory = useCallback(async (request?: ChatHistoryRequest) => {
    const roomId = request?.chat_room_id || state.currentRoom?.id;
    if (!roomId) return;

    try {
      const historyRequest: ChatHistoryRequest = {
        chat_room_id: roomId,
        limit: 50,
        ...request
      };
      
      const messages = await chatApi.getChatHistory(historyRequest);
      setState(prev => ({ 
        ...prev, 
        messages: messages.reverse() // 최신 메시지가 아래에 오도록 정렬
      }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setState(prev => ({ 
        ...prev, 
        error: '채팅 기록을 가져오는데 실패했습니다.' 
      }));
    }
  }, [chatApi, state.currentRoom]);

  // 채팅방 선택 - 안정적인 연결 관리
  const selectRoom = useCallback(async (roomId: number) => {
    try {
      console.log('Selecting chat room:', roomId);
      
      // 이미 선택된 채팅방인 경우 무시
      if (state.currentRoom?.id === roomId) {
        console.log('Room already selected, skipping selection');
        return;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        messages: [], // 이전 메시지 초기화
        participants: [] // 이전 참여자 초기화
      }));
      
      // 1. 채팅방 정보 조회
      const room = await chatApi.getChatRoom(roomId);
      
      // 2. 현재 채팅방 설정
      setState(prev => ({ 
        ...prev, 
        currentRoom: room,
        isLoading: false 
      }));
      
      // 3. 웹소켓 연결
      await connect(roomId);
      
      // 4. 연결 완료 후 히스토리 로드
      setTimeout(() => {
        loadHistory({ chat_room_id: roomId });
      }, 500); // 연결 안정화를 위해 약간의 지연
      
    } catch (error) {
      console.error('Failed to select chat room:', error);
      setState(prev => ({ 
        ...prev, 
        error: '채팅방 선택에 실패했습니다.',
        isLoading: false 
      }));
    }
  }, [chatApi, connect, state.currentRoom?.id]);

  // 채팅방 나가기
  const leaveRoom = useCallback(async (roomId: number): Promise<boolean> => {
    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) {
        console.error('User ID not available');
        return false;
      }

      const success = await chatApi.removeParticipant(roomId, currentUserId);
      if (success) {
        disconnect();
        setState(prev => ({ 
          ...prev, 
          currentRoom: null,
          messages: [],
          participants: []
        }));
      }
      return success;
    } catch (error) {
      console.error('Failed to leave chat room:', error);
      return false;
    }
  }, [chatApi, disconnect, getCurrentUserId]);

  // 메시지 전송
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'file' | 'system' = 'text'): Promise<boolean> => {
    if (!state.currentRoom || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return false;
    }

    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.error('User ID not available');
      return false;
    }

    try {
      // 임시 메시지 ID 생성 (음수 값으로 구분)
      const tempId = -Date.now();
      
      // 즉시 로컬 상태에 메시지 추가 (낙관적 업데이트)
      const tempMessage: ChatMessage = {
        id: tempId,
        chat_room_id: state.currentRoom.id,
        sender_id: currentUserId,
        sender_name: user?.name || user?.email || currentUserId,
        content,
        message_type: messageType,
        file_url: undefined,
        file_name: undefined,
        file_size: undefined,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, tempMessage]
      }));

      const message: WebSocketMessage = {
        type: 'chat_message',
        chat_room_id: state.currentRoom.id,
        sender_id: currentUserId,
        content,
        message_type: messageType,
        timestamp: new Date().toISOString()
      };

      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }, [state.currentRoom, getCurrentUserId, user]);

  // 메시지 읽음 처리
  const markAsRead = useCallback(async (messageId: number): Promise<boolean> => {
    if (!state.currentRoom) return false;

    try {
      return await chatApi.markMessageAsRead(state.currentRoom.id, messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      return false;
    }
  }, [state.currentRoom, chatApi]);

  // 참여자 추가
  const addParticipant = useCallback(async (memberId: string, role: string = 'member'): Promise<boolean> => {
    if (!state.currentRoom) return false;

    try {
      return await chatApi.addParticipant(state.currentRoom.id, memberId, role);
    } catch (error) {
      console.error('Failed to add participant:', error);
      return false;
    }
  }, [state.currentRoom, chatApi]);

  // 참여자 제거
  const removeParticipant = useCallback(async (memberId: string): Promise<boolean> => {
    if (!state.currentRoom) return false;

    try {
      return await chatApi.removeParticipant(state.currentRoom.id, memberId);
    } catch (error) {
      console.error('Failed to remove participant:', error);
      return false;
    }
  }, [state.currentRoom, chatApi]);

  // 멤버 초대
  const inviteMember = useCallback(async (data: ChatRoomInvitationCreate): Promise<ChatRoomInvitation | null> => {
    if (!state.currentRoom) return null;

    try {
      return await chatApi.createInvitation(state.currentRoom.id, data);
    } catch (error) {
      console.error('Failed to invite member:', error);
      return null;
    }
  }, [state.currentRoom, chatApi]);

  // 초대 응답
  const respondToInvitation = useCallback(async (invitationId: number, response: 'accepted' | 'rejected'): Promise<boolean> => {
    try {
      return await chatApi.respondToInvitation(invitationId, response);
    } catch (error) {
      console.error('Failed to respond to invitation:', error);
      return false;
    }
  }, [chatApi]);

  // 타이핑 표시 전송
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!state.currentRoom || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.error('User ID not available');
      return;
    }

    // 이전 타이핑 표시 제거
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      const typingData: TypingIndicator = {
        type: 'typing',
        chat_room_id: state.currentRoom.id,
        sender_id: currentUserId,
        is_typing: isTyping
      };

      wsRef.current.send(JSON.stringify(typingData));

      // 타이핑 중지 시 자동으로 false 전송
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingIndicator(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }, [state.currentRoom, getCurrentUserId]);

  // 읽음 확인 전송
  const sendReadReceipt = useCallback((messageId: number) => {
    if (!state.currentRoom || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      console.error('User ID not available');
      return;
    }

    try {
      const readData: ReadReceipt = {
        type: 'read_receipt',
        message_id: messageId,
        sender_id: currentUserId
      };

      wsRef.current.send(JSON.stringify(readData));
    } catch (error) {
      console.error('Failed to send read receipt:', error);
    }
  }, [state.currentRoom, getCurrentUserId]);

  // 자동 연결
  useEffect(() => {
    if (autoConnect && state.currentRoom) {
      connect(state.currentRoom.id);
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, state.currentRoom, connect, disconnect]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const actions: ChatActions = useMemo(() => ({
    createRoom,
    getRooms,
    selectRoom,
    leaveRoom,
    sendMessage,
    loadHistory,
    markAsRead,
    addParticipant,
    removeParticipant,
    inviteMember,
    respondToInvitation,
    connect,
    disconnect,
    sendTypingIndicator,
    sendReadReceipt
  }), [
    createRoom,
    getRooms,
    selectRoom,
    leaveRoom,
    sendMessage,
    loadHistory,
    markAsRead,
    addParticipant,
    removeParticipant,
    inviteMember,
    respondToInvitation,
    connect,
    disconnect,
    sendTypingIndicator,
    sendReadReceipt
  ]);

  return [state, actions];
};
