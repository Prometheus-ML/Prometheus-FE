import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const renderChatRoom = ({ item: room }: { item: ChatRoom }) => (
    <TouchableOpacity
      onPress={() => handleRoomSelect(room)}
      style={styles.roomItem}
      activeOpacity={0.7}
    >
      <View style={styles.roomContent}>
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>
            {room.name || `채팅방 ${room.id}`}
          </Text>
          <View style={styles.roomTypeContainer}>
            <Text style={styles.roomType}>
              {room.room_type === 'group' ? '그룹 채팅' : '커피챗'}
            </Text>
          </View>
          {room.last_message && (
            <Text style={styles.lastMessage} numberOfLines={2}>
              {room.last_message.content}
            </Text>
          )}
        </View>
        <View style={styles.roomMeta}>
          <View style={styles.participantCountContainer}>
            <Text style={styles.participantCount}>
              {room.participant_count}명
            </Text>
          </View>
          {room.last_message && (
            <Text style={styles.lastMessageTime}>
              {new Date(room.last_message.created_at).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#ffa282" />
          <Text style={styles.emptyText}>로딩 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={48} color="#9ca3af" />
        <Text style={styles.emptyText}>채팅방이 없습니다</Text>
        <Text style={styles.emptySubText}>아직 참여한 채팅방이 없습니다</Text>
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>채팅</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* 채팅방 목록 */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>내 채팅방</Text>
          
          {rooms.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={rooms}
              renderItem={renderChatRoom}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </SafeAreaView>

      {/* ChatRoomModal 렌더링 */}
      {showChatRoom && selectedRoom && (
        <ChatRoomModal
          isOpen={showChatRoom}
          onClose={handleChatRoomClose}
          selectedRoom={selectedRoom}
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  roomItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  roomContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  roomTypeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  roomType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  roomMeta: {
    alignItems: 'flex-end',
  },
  participantCountContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  participantCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  lastMessageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ChatModal;
