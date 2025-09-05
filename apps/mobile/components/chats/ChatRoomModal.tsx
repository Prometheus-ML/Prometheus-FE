import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage } from '@prometheus-fe/hooks';
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
  
  // useImage 훅 사용
  const { getThumbnailUrl, getDefaultImageUrl } = useImage({});
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const scrollButtonRef = useRef<View>(null);
  
  const [state, actions] = useChat({
    autoConnect: false,
    reconnectInterval: 1000,
    maxReconnectAttempts: 3
  });

  const { currentRoom, messages, isConnected, isLoading, error } = state;
  const { selectRoom, sendMessage, connect, disconnect, loadHistory } = actions;

  // 자동 스크롤 함수
  const scrollToBottom = useCallback((animated: boolean = true) => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated });
      setShouldAutoScroll(true);
      setShowScrollButton(false);
    }
  }, [messages.length]);

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
        // 기존 메시지가 있다면 맨 아래로 스크롤
        scrollToBottom(false);
      }
    }
  }, [isConnected, currentRoom, selectedRoom, loadHistory, messages.length, scrollToBottom]);

  // 메시지가 추가될 때마다 자동 스크롤
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      // 메시지가 추가될 때마다 자동으로 맨 아래로 스크롤
      scrollToBottom(true);
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // 채팅방 변경 시 스크롤 초기화 및 메시지 정리
  useEffect(() => {
    if (selectedRoom) {
      setShouldAutoScroll(true);
      setShowScrollButton(false);
      // 채팅방 변경 시 즉시 맨 아래로 스크롤
      scrollToBottom(false);
    }
  }, [selectedRoom, scrollToBottom]);

  // 스크롤 위치 확인 및 자동 스크롤 제어
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 10;
    
    setShouldAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  }, []);

  // 메시지 전송
  const handleSendMessage = async () => {
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
        scrollToBottom(true);
      } else {
        console.error('Failed to send message');
        Alert.alert('오류', '메시지 전송에 실패했습니다.');
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

  const renderMessage = ({ item: message }: { item: ChatMessage }) => {
    const isMyMessage = message.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {/* 상대방 이름 표시 */}
        {!isMyMessage && (
          <Text style={styles.senderName}>
            {message.sender_name || message.sender_id}
          </Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          {/* 프로필 이미지 (상대방 메시지만) */}
          {!isMyMessage && (
            <View style={styles.profileImageContainer}>
              {message.sender_profile_image ? (
                <Image
                  source={{ uri: getThumbnailUrl(message.sender_profile_image, 80) }}
                  style={styles.profileImage}
                  onError={() => {
                    console.warn('프로필 이미지 로드 실패:', message.sender_profile_image);
                  }}
                />
              ) : (
                <View style={styles.defaultProfileImage}>
                  <Ionicons name="person" size={20} color="rgba(255, 255, 255, 0.6)" />
                </View>
              )}
            </View>
          )}
          
          <View style={styles.messageContent}>
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText
            ]}>
              {message.content}
            </Text>
            <Text style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime
            ]}>
              {new Date(message.created_at).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {isLoading || !isConnected ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffa282" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      ) : (
        <View style={styles.noMessagesContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="rgba(255, 255, 255, 0.6)" />
          <Text style={styles.noMessagesText}>아직 메시지가 없습니다.</Text>
        </View>
      )}
    </View>
  );

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />
        
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {selectedRoom.name || `채팅방 ${selectedRoom.id}`}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* 채팅 메시지 영역 */}
          <View style={styles.messagesContainer}>
            {messages.length === 0 ? (
              renderEmptyState()
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => {
                  if (shouldAutoScroll) {
                    scrollToBottom(false);
                  }
                }}
              />
            )}
            
            {isLoading && messages.length > 0 && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#ffa282" />
                <Text style={styles.loadingMoreText}>메시지 로딩 중...</Text>
              </View>
            )}
          </View>

          {/* 스크롤 버튼 */}
          {showScrollButton && (
            <TouchableOpacity
              ref={scrollButtonRef}
              onPress={() => scrollToBottom(true)}
              style={styles.scrollButton}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-down" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* 메시지 입력 */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                value={messageInput}
                onChangeText={setMessageInput}
                placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중입니다..."}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                style={styles.textInput}
                editable={isConnected}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!isConnected || !messageInput.trim() || isLoading}
                style={[
                  styles.sendButton,
                  (!isConnected || !messageInput.trim() || isLoading) && styles.sendButtonDisabled
                ]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={(!isConnected || !messageInput.trim() || isLoading) ? "rgba(255, 255, 255, 0.3)" : "#ffffff"} 
                />
              </TouchableOpacity>
            </View>
            
            {/* 연결 상태 안내 */}
            {!isConnected && (
              <Text style={styles.connectionStatusText}>
                채팅방에 연결된 후 메시지를 보낼 수 있습니다.
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 36, // backButton과 동일한 크기로 균형 맞춤
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    marginLeft: 4,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  myMessageBubble: {
    justifyContent: 'flex-end',
  },
  otherMessageBubble: {
    justifyContent: 'flex-start',
  },
  profileImageContainer: {
    marginRight: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
    fontSize: 16,
  },
  noMessagesContainer: {
    alignItems: 'center',
  },
  noMessagesText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 12,
    fontSize: 16,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingMoreText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
    fontSize: 14,
  },
  scrollButton: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1f2937',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  connectionStatusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ChatRoomModal;
