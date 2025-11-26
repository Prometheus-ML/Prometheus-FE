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

  // 상태 변경 로깅
  useEffect(() => {
    console.log('Chat state updated:', {
      currentRoom: state.currentRoom,
      currentRoomId: state.currentRoom?.id,
      isConnected: state.isConnected,
      messagesCount: state.messages.length,
      isLoading: state.isLoading,
      error: state.error
    });
  }, [state.currentRoom, state.isConnected, state.messages.length, state.isLoading, state.error]);

  // 웹소켓 관련 refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectingRoomIdRef = useRef<number | null>(null); // 연결 중인 roomId 추적

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

      // 이미 같은 방에 연결 중이거나 연결된 상태라면 재사용
      if (connectingRoomIdRef.current === roomId) {
        console.log('WebSocket connection already in progress for this room, skipping');
        return;
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && state.currentRoom?.id === roomId) {
        console.log('WebSocket already connected to the same room, reusing connection');
        return;
      }

      // CONNECTING 상태인 경우도 체크
      if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING && connectingRoomIdRef.current === roomId) {
        console.log('WebSocket connection already in progress for this room, skipping');
        return;
      }

      // 기존 연결이 있다면 완전히 정리될 때까지 기다림
      if (wsRef.current) {
        console.log('Cleaning up existing WebSocket connection');
        // 재연결 타이머 정리
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        
        const oldWs = wsRef.current;
        connectingRoomIdRef.current = null; // 기존 연결 중 상태 해제
        
        // 기존 연결 해제 및 완전히 닫힐 때까지 대기 (최대 2초)
        await new Promise<void>((resolve) => {
          let attempts = 0;
          const maxAttempts = 40; // 최대 2초 대기 (40 * 50ms)
          
          const checkClosed = () => {
            attempts++;
            if (oldWs.readyState === WebSocket.CLOSED) {
              console.log('Previous WebSocket connection closed');
              resolve();
            } else if (attempts >= maxAttempts) {
              console.warn('Previous WebSocket connection close timeout, proceeding anyway');
              resolve(); // 타임아웃이어도 진행
            } else {
              // 아직 닫히지 않았으면 잠시 대기 후 다시 확인
              setTimeout(checkClosed, 50);
            }
          };
          
          // 연결이 열려있거나 연결 중이면 닫기
          if (oldWs.readyState === WebSocket.OPEN || oldWs.readyState === WebSocket.CONNECTING) {
            oldWs.close(1000, 'Switching to new room');
            checkClosed();
          } else {
            // 이미 닫혔거나 닫히는 중이면 바로 resolve
            resolve();
          }
        });
        
        // wsRef.current가 여전히 oldWs를 가리키고 있다면 null로 설정
        if (wsRef.current === oldWs) {
          wsRef.current = null;
        }
      }

      // 연결 시도 중 상태로 설정
      connectingRoomIdRef.current = roomId;
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
        connectingRoomIdRef.current = null; // 연결 완료
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
          console.log('Raw WebSocket message received:', event.data);
          const data: ChatWebSocketEvent = JSON.parse(event.data);
          console.log('Parsed WebSocket message:', data);
          handleWebSocketMessage(data, roomId); // roomId를 직접 전달
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('WebSocket closed:', event.code, event.reason);
        
        // 현재 WebSocket 인스턴스인 경우에만 null로 설정
        if (wsRef.current === ws) {
          wsRef.current = null;
          connectingRoomIdRef.current = null; // 연결 해제
        }
        
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
        // 현재 WebSocket 인스턴스인 경우에만 상태 해제
        if (wsRef.current === ws) {
          connectingRoomIdRef.current = null; // 에러 발생 시 연결 중 상태 해제
          setState(prev => ({ 
            ...prev, 
            error: '웹소켓 연결 오류가 발생했습니다.',
            isLoading: false 
          }));
        }
      };

      // 새 연결을 ref에 설정 (기존 연결이 완전히 닫힌 후이므로 안전)
      wsRef.current = ws;

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      connectingRoomIdRef.current = null; // 에러 발생 시 연결 중 상태 해제
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
    
    // 연결 중 상태 해제
    connectingRoomIdRef.current = null;
    
    // 웹소켓 연결 해제
    if (wsRef.current) {
      // 정상 종료 코드로 연결 해제
      wsRef.current.close(1000, 'Manual disconnect');
      // wsRef.current는 onclose 이벤트에서 null로 설정
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
  const handleWebSocketMessage = useCallback((data: ChatWebSocketEvent, roomId: number) => {
    console.log('Processing WebSocket message:', data);
    console.log('Current room state when processing message:', state.currentRoom);
    
    // 타입 가드를 사용하여 각 이벤트 타입을 안전하게 처리
    if ('type' in data) {
      switch (data.type) {
        case 'chat_message':
          console.log('Raw chat message data:', data); // 디버깅용
          
          // 백엔드 메시지 구조를 직접 확인하고 처리
          if (data.type === 'chat_message' && 
              typeof (data as any).id === 'number' && 
              typeof (data as any).chat_room_id === 'number' && 
              typeof (data as any).sender_id === 'string' && 
              typeof (data as any).content === 'string') {
            
            // 백엔드 메시지 구조를 ChatMessage 타입으로 직접 변환
            const message: ChatMessage = {
              id: (data as any).id,
              chat_room_id: (data as any).chat_room_id,
              sender_id: (data as any).sender_id,
              sender_name: (data as any).sender_name || (data as any).sender_id,
              content: (data as any).content,
              message_type: (data as any).message_type || 'text',
              file_url: (data as any).file_url,
              file_name: (data as any).file_name,
              file_size: (data as any).file_size,
              is_deleted: (data as any).is_deleted || false,
              created_at: (data as any).created_at || (data as any).timestamp || new Date().toISOString(),
              updated_at: (data as any).updated_at || (data as any).created_at || (data as any).timestamp || new Date().toISOString()
            };
            
            console.log('Processed chat message:', {
              messageId: message.id,
              roomId: message.chat_room_id,
              senderId: message.sender_id,
              content: message.content
            });
            
            // 현재 채팅방의 메시지인지 확인
            if (message.chat_room_id === roomId) {
              console.log('Message is for current room, updating state');
              setState(prev => {
                // 임시 메시지가 있다면 실제 메시지로 교체, 없다면 새로 추가
                const existingTempMessage = prev.messages.find(m => 
                  m.id < 0 && m.sender_id === message.sender_id && 
                  m.content === message.content && 
                  Math.abs(new Date(m.created_at).getTime() - new Date(message.created_at).getTime()) < 10000 // 10초로 연장
                );
                
                if (existingTempMessage) {
                  console.log('Replacing temporary message with real message:', existingTempMessage.id, '->', message.id);
                  // 임시 메시지를 실제 메시지로 교체
                  return {
                    ...prev,
                    messages: prev.messages
                      .filter(m => m.id !== existingTempMessage.id)
                      .concat(message)
                  };
                } else {
                  console.log('Adding new message to state:', message.id);
                  // 새 메시지 추가 (중복 방지)
                  const messageExists = prev.messages.some(m => m.id === message.id);
                  if (!messageExists) {
                    return {
                      ...prev,
                      messages: [...prev.messages, message]
                    };
                  } else {
                    console.log('Message already exists in state, skipping:', message.id);
                    return prev;
                  }
                }
              });
              console.log('Chat message processed and state updated:', message);
            } else {
              console.log('Message is not for current room, ignoring:', {
                messageRoomId: message.chat_room_id,
                currentRoomId: roomId,
                hasCurrentRoom: true
              });
            }
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
          
        case 'heartbeat':
        case 'heartbeat_ack':
          console.log('Heartbeat message received:', data);
          // 하트비트 응답 처리
          break;
          
        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } else if ('id' in data && 'chat_room_id' in data && 'sender_id' in data && 
               'content' in data && 'message_type' in data && 'created_at' in data) {
      // ChatMessage 타입인지 확인 (모든 필수 속성이 있는지)
      const message = data as unknown as ChatMessage;
      
      console.log('Processing chat message (fallback):', {
        messageId: message.id,
        roomId: message.chat_room_id,
        senderId: message.sender_id,
        content: message.content
      });
      
      // 현재 채팅방의 메시지인지 확인
      if (message.chat_room_id === roomId) {
        setState(prev => {
          const messageExists = prev.messages.some(m => m.id === message.id);
          if (!messageExists) {
            return {
              ...prev,
              messages: [...prev.messages, message]
            };
          } else {
            console.log('Message already exists in state (fallback), skipping:', message.id);
            return prev;
          }
        });
        console.log('Chat message added to state (fallback)');
      } else {
        console.log('Message is not for current room (fallback), ignoring:', {
          messageRoomId: message.chat_room_id,
          currentRoomId: roomId,
          hasCurrentRoom: true
        });
      }
    } else {
      console.log('Unrecognized WebSocket message format:', data);
    }
  }, []); // state.currentRoom 의존성 제거

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
      
      // 이미 선택된 채팅방이고 연결되어 있는 경우 무시
      if (state.currentRoom?.id === roomId && state.isConnected) {
        console.log('Room already selected and connected, skipping selection');
        return;
      }

      // 이미 같은 방에 연결 중인 경우 무시
      if (connectingRoomIdRef.current === roomId) {
        console.log('Room connection already in progress, skipping selection');
        return;
      }
      
      console.log('Setting loading state and clearing previous data');
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null,
        messages: [], // 이전 메시지 초기화
        participants: [] // 이전 참여자 초기화
      }));
      
      // 1. 채팅방 정보 조회
      console.log('Fetching chat room info for roomId:', roomId);
      const room = await chatApi.getChatRoom(roomId);
      console.log('Chat room info loaded:', room);
      
      if (!room) {
        throw new Error('Failed to load chat room info');
      }
      
      // 2. 현재 채팅방 설정
      console.log('Setting current room in state:', room);
      setState(prev => {
        const newState = { 
          ...prev, 
          currentRoom: room,
          isLoading: true // 메시지 로딩 중
        };
        console.log('New state after setting current room:', newState);
        return newState;
      });
      
      // 3. 메시지 히스토리 먼저 로드
      console.log('Loading chat history before WebSocket connection...');
      try {
        await loadHistory({ chat_room_id: roomId });
        console.log('Chat history loaded successfully');
      } catch (historyError) {
        console.error('Failed to load chat history:', historyError);
        // 히스토리 로드 실패해도 웹소켓 연결은 시도
      }
      
      // 4. 웹소켓 연결 (메시지 로드 후)
      console.log('Chat history loaded, connecting WebSocket...');
      await connect(roomId);
      
      // 5. 연결 완료 대기
      const waitForConnection = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 50; // 최대 5초 대기 (50 * 100ms)
          
          const checkConnection = () => {
            attempts++;
            // ref를 통해 최신 연결 상태 확인
            const isConnected = wsRef.current?.readyState === WebSocket.OPEN;
            console.log(`Checking WebSocket connection (attempt ${attempts}/${maxAttempts}), readyState:`, wsRef.current?.readyState);
            
            if (isConnected) {
              console.log('WebSocket connected successfully');
              resolve();
            } else if (attempts >= maxAttempts) {
              console.error('WebSocket connection timeout');
              reject(new Error('WebSocket connection timeout'));
            } else if (wsRef.current?.readyState === WebSocket.CLOSED) {
              // 연결이 닫혔다면 에러
              console.error('WebSocket closed before connection established');
              reject(new Error('WebSocket closed before connection established'));
            } else {
              // 지연 시간
              setTimeout(checkConnection, 100);
            }
          };
          
          checkConnection();
        });
      };
      
      try {
        await waitForConnection();
        console.log('WebSocket connection confirmed');
        setState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));
      } catch (connectionError) {
        console.error('Failed to establish WebSocket connection:', connectionError);
        setState(prev => ({ 
          ...prev, 
          error: '웹소켓 연결에 실패했습니다.',
          isLoading: false 
        }));
      }
      
    } catch (error) {
      console.error('Failed to select chat room:', error);
      connectingRoomIdRef.current = null; // 에러 발생 시 연결 중 상태 해제
      setState(prev => ({ 
        ...prev, 
        error: '채팅방 선택에 실패했습니다.',
        isLoading: false 
      }));
    }
  }, [chatApi, connect, loadHistory]); // state 의존성 제거하여 불필요한 재생성 방지

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
        timestamp: new Date().toISOString(),
        sender_name: user?.name || user?.email || currentUserId  // 발신자 이름 추가
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
        read_by: currentUserId
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
