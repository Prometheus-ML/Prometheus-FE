import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useCoffeeChat } from '@prometheus-fe/hooks';
import { 
  CoffeeChatMember,
  CoffeeChatRequest,
  CoffeeChatCreateRequest,
  CoffeeChatRespondRequest,
  CoffeeChatStatus
} from '@prometheus-fe/types';

// 커피챗 요청 모달 컴포넌트
interface CoffeeChatRequestModalProps {
  visible: boolean;
  onClose: () => void;
  target: CoffeeChatMember | null;
  onSendRequest: (message: string) => void;
  isRequesting: boolean;
}

function CoffeeChatRequestModal({
  visible,
  onClose,
  target,
  onSendRequest,
  isRequesting
}: CoffeeChatRequestModalProps) {
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setRequestMessage('');
    }
  }, [visible]);

  const handleSendRequest = () => {
    onSendRequest(requestMessage);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>커피챗 요청</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {target && (
            <Text style={styles.modalTarget}>대상: {target.name}</Text>
          )}
          
          <TextInput
            value={requestMessage}
            onChangeText={setRequestMessage}
            multiline
            numberOfLines={4}
            maxLength={300}
            placeholder="메시지 (선택)"
            placeholderTextColor="#888"
            style={styles.modalTextInput}
          />
          
          <TouchableOpacity
            onPress={handleSendRequest}
            disabled={isRequesting}
            style={[styles.modalSendButton, isRequesting && styles.disabledButton]}
          >
            <Text style={styles.modalSendButtonText}>
              {isRequesting ? '요청 중...' : '보내기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// 탭 타입 정의
type TabType = 'available' | 'sent' | 'received';

export default function ProfileCoffeeChat() {
  const { isAuthenticated, user } = useAuthStore();
  const { 
    getAvailableMembers, 
    createRequest, 
    getSentRequests, 
    getReceivedRequests, 
    respondToRequest, 
    getContactInfo 
  } = useCoffeeChat();
  const { getThumbnailUrl } = useImage();

  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>('available');

  // 가능한 사용자 상태
  const [availableUsers, setAvailableUsers] = useState<CoffeeChatMember[]>([]);
  const [availableTotal, setAvailableTotal] = useState(0);
  const [availablePage, setAvailablePage] = useState(1);
  const [availableSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // 요청 상태
  const [sentRequests, setSentRequests] = useState<CoffeeChatRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<CoffeeChatRequest[]>([]);
  const [sentStatus, setSentStatus] = useState<CoffeeChatStatus | ''>('');
  const [receivedStatus, setReceivedStatus] = useState<CoffeeChatStatus | ''>('');
  const [loadingSent, setLoadingSent] = useState(false);
  const [loadingReceived, setLoadingReceived] = useState(false);

  // 모달 상태
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTarget, setRequestTarget] = useState<CoffeeChatMember | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // 새로고침 상태
  const [refreshing, setRefreshing] = useState(false);

  // 계산된 값들
  const availableTotalPages = Math.max(1, Math.ceil(availableTotal / availableSize));

  // 유틸리티 함수들
  const getFirstLetter = useCallback((name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  }, []);

  // 가능한 사용자 조회
  const fetchAvailableUsers = useCallback(async (page: number = 1) => {
    try {
      setLoadingAvailable(true);
      const params = {
        page,
        size: availableSize,
        ...(searchText && { search: searchText }),
        ...(selectedGen !== null && { gen_filter: selectedGen })
      };
      const res = await getAvailableMembers(params);
      
      if (page === 1) {
        setAvailableUsers(res.members || []);
      } else {
        setAvailableUsers(prev => [...prev, ...(res.members || [])]);
      }
      setAvailableTotal(res.total || res.members?.length || 0);
      setAvailablePage(page);
    } catch (err) {
      console.error('Failed to load available users:', err);
      if (page === 1) {
        setAvailableUsers([]);
        setAvailableTotal(0);
      }
    } finally {
      setLoadingAvailable(false);
    }
  }, [availableSize, searchText, selectedGen, getAvailableMembers]);

  // 보낸 요청 조회
  const fetchSent = useCallback(async () => {
    try {
      setLoadingSent(true);
      const params = {
        page: 1,
        size: 20,
        ...(sentStatus && { status_filter: sentStatus })
      };
      const res = await getSentRequests(params);
      setSentRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load sent requests:', err);
      setSentRequests([]);
    } finally {
      setLoadingSent(false);
    }
  }, [sentStatus, getSentRequests]);

  // 받은 요청 조회
  const fetchReceived = useCallback(async () => {
    try {
      setLoadingReceived(true);
      const params = {
        page: 1,
        size: 20,
        ...(receivedStatus && { status_filter: receivedStatus })
      };
      const res = await getReceivedRequests(params);
      setReceivedRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load received requests:', err);
      setReceivedRequests([]);
    } finally {
      setLoadingReceived(false);
    }
  }, [receivedStatus, getReceivedRequests]);

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'available') {
        await fetchAvailableUsers(1);
      } else if (activeTab === 'sent') {
        await fetchSent();
      } else if (activeTab === 'received') {
        await fetchReceived();
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, fetchAvailableUsers, fetchSent, fetchReceived]);

  // 더 많은 사용자 로드
  const loadMoreUsers = useCallback(() => {
    if (!loadingAvailable && availablePage < availableTotalPages) {
      fetchAvailableUsers(availablePage + 1);
    }
  }, [loadingAvailable, availablePage, availableTotalPages, fetchAvailableUsers]);

  // 요청 모달 관련
  const openRequestModal = useCallback((user: CoffeeChatMember) => {
    setRequestTarget(user);
    setShowRequestModal(true);
  }, []);

  const closeRequestModal = useCallback(() => {
    setShowRequestModal(false);
    setRequestTarget(null);
  }, []);

  const handleCreateRequest = useCallback(async (message: string) => {
    if (!requestTarget) return;
    
    // 자기 자신에게 요청하는지 확인
    if (user && requestTarget.id === user.id) {
      Alert.alert('알림', '자기 자신에게는 커피챗을 요청할 수 없습니다.');
      return;
    }
    
    try {
      setIsRequesting(true);
      const payload: CoffeeChatCreateRequest = {
        recipient_id: requestTarget.id,
        message: message || ''
      };
      await createRequest(payload);
      Alert.alert('성공', '요청을 보냈습니다.');
      closeRequestModal();
      fetchSent();
    } catch (err) {
      console.error('Failed to create request:', err);
      Alert.alert('오류', '요청 실패. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsRequesting(false);
    }
  }, [requestTarget, user, createRequest, closeRequestModal, fetchSent]);

  // 요청 응답
  const respond = useCallback(async (req: CoffeeChatRequest, status: 'accepted' | 'rejected') => {
    try {
      const payload: CoffeeChatRespondRequest = { 
        status,
        response_message: ''
      };
      await respondToRequest(req.id, payload);
      fetchReceived();
      Alert.alert('성공', status === 'accepted' ? '요청을 수락했습니다.' : '요청을 거절했습니다.');
    } catch (err) {
      console.error('Failed to respond request:', err);
      Alert.alert('오류', '처리 실패');
    }
  }, [respondToRequest, fetchReceived]);

  // 연락처 조회
  const viewContact = useCallback(async (req: CoffeeChatRequest) => {
    try {
      const res = await getContactInfo(req.id);
      const contactInfo = res?.requester_kakao_id || res?.requester_instagram_id || '제공되지 않음';
      Alert.alert('연락처', `연락처: ${contactInfo}`);
    } catch (err) {
      console.error('Failed to get contact info:', err);
      Alert.alert('오류', '연락처 조회 실패');
    }
  }, [getContactInfo]);

  // 검색 실행
  const handleSearch = useCallback(() => {
    setAvailablePage(1);
    fetchAvailableUsers(1);
  }, [fetchAvailableUsers]);

  // 초기 로드
  useEffect(() => {
    if (isAuthenticated()) {
      fetchAvailableUsers(1);
      fetchSent();
      fetchReceived();
    }
  }, [isAuthenticated, fetchAvailableUsers, fetchSent, fetchReceived]);

  // 탭 변경 시 로드
  useEffect(() => {
    if (activeTab === 'available' && isAuthenticated()) {
      fetchAvailableUsers(1);
    } else if (activeTab === 'sent' && isAuthenticated()) {
      fetchSent();
    } else if (activeTab === 'received' && isAuthenticated()) {
      fetchReceived();
    }
  }, [activeTab, isAuthenticated, fetchAvailableUsers, fetchSent, fetchReceived]);

  // 탭 데이터
  const tabData = [
    { key: 'available', label: '가능 사용자' },
    { key: 'sent', label: '보낸 요청' },
    { key: 'received', label: '받은 요청' }
  ];

  // 탭 렌더링
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <FlatList
        data={tabData}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tab, activeTab === item.key && styles.activeTab]}
            onPress={() => setActiveTab(item.key as TabType)}
          >
            <Text style={[styles.tabText, activeTab === item.key && styles.activeTabText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      />
    </View>
  );

  // 사용자 카드 렌더링
  const renderUserCard = ({ item: user }: { item: CoffeeChatMember }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userImageContainer}>
          {user.profile_image_url ? (
            <Image
              source={{ uri: getThumbnailUrl(user.profile_image_url, 120) }}
              style={styles.userImage}
            />
          ) : (
            <View style={styles.userImagePlaceholder}>
              <Text style={styles.userImageText}>
                {getFirstLetter(user.name)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.userDetails}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.gen && (
              <Text style={styles.userGen}> · {user.gen}기</Text>
            )}
          </View>
          <Text style={styles.userSchool}>{user.school} {user.major}</Text>
          {user.mbti && (
            <Text style={styles.userMbti}>MBTI: {user.mbti}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => openRequestModal(user)}
        style={styles.requestButton}
      >
        <Text style={styles.requestButtonText}>요청</Text>
      </TouchableOpacity>
    </View>
  );

  // 요청 카드 렌더링
  const renderRequestCard = ({ item: request }: { item: CoffeeChatRequest }) => {
    const isSent = activeTab === 'sent';
    const name = isSent ? request.recipient_name : request.requester_name;
    const gen = isSent ? request.recipient_gen : request.requester_gen;
    const school = isSent ? request.recipient_school : request.requester_school;
    const major = isSent ? request.recipient_major : request.requester_major;

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestInfo}>
          <View style={styles.requestNameRow}>
            <Text style={styles.requestName}>{name}</Text>
            {gen !== null && (
              <Text style={styles.requestGen}> · {gen}기</Text>
            )}
          </View>
          <Text style={styles.requestSchool}>{school} {major}</Text>
          <Text style={styles.requestStatus}>상태: {request.status}</Text>
          <Text style={styles.requestMessage}>
            메시지: {request.message || '없음'}
          </Text>
        </View>
        
        {/* 액션 버튼들 */}
        {isSent && request.status === 'accepted' && (
          <TouchableOpacity
            onPress={() => viewContact(request)}
            style={styles.contactButton}
          >
            <Text style={styles.contactButtonText}>연락처 보기</Text>
          </TouchableOpacity>
        )}
        
        {!isSent && request.status === 'pending' && (
          <View style={styles.responseButtons}>
            <TouchableOpacity
              onPress={() => respond(request, 'accepted')}
              style={styles.acceptButton}
            >
              <Text style={styles.acceptButtonText}>수락</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => respond(request, 'rejected')}
              style={styles.rejectButton}
            >
              <Text style={styles.rejectButtonText}>거절</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // 가능한 사용자 탭 콘텐츠
  const renderAvailableContent = () => (
    <View style={styles.content}>
      {/* 검색 필터 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="검색"
            placeholderTextColor="#888"
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>기수:</Text>
          <FlatList
            data={[{ gen: null, label: '전체' }, ...Array.from({ length: 20 }, (_, i) => ({ gen: i + 1, label: `${i + 1}기` }))]}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedGen(item.gen)}
                style={[styles.filterChip, selectedGen === item.gen && styles.activeFilterChip]}
              >
                <Text style={[styles.filterChipText, selectedGen === item.gen && styles.activeFilterChipText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.gen?.toString() || 'all'}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          />
        </View>
      </View>

      {/* 사용자 목록 */}
      <FlatList
        data={availableUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B0000"
          />
        }
        onEndReached={loadMoreUsers}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingAvailable ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#8B0000" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loadingAvailable ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>가능한 사용자가 없습니다</Text>
            </View>
          ) : null
        }
      />
    </View>
  );

  // 요청 목록 탭 콘텐츠
  const renderRequestsContent = () => {
    const isSent = activeTab === 'sent';
    const requests = isSent ? sentRequests : receivedRequests;
    const loading = isSent ? loadingSent : loadingReceived;
    const status = isSent ? sentStatus : receivedStatus;
    const setStatus = isSent ? setSentStatus : setReceivedStatus;
    const fetchData = isSent ? fetchSent : fetchReceived;

    return (
      <View style={styles.content}>
        {/* 상태 필터 */}
        <View style={styles.statusFilterContainer}>
          <Text style={styles.filterLabel}>상태:</Text>
          <FlatList
            data={[
              { status: '', label: '전체' },
              { status: 'pending', label: '대기' },
              { status: 'accepted', label: '수락' },
              { status: 'rejected', label: '거절' }
            ]}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setStatus(item.status as CoffeeChatStatus | '')}
                style={[styles.filterChip, status === item.status && styles.activeFilterChip]}
              >
                <Text style={[styles.filterChipText, status === item.status && styles.activeFilterChipText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.status || 'all'}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          />
          <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 요청 목록 */}
        <FlatList
          data={requests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B0000"
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isSent ? '보낸 요청이 없습니다' : '받은 요청이 없습니다'}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    );
  };

  if (!isAuthenticated()) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>로그인이 필요합니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 탭 */}
      {renderTabs()}

      {/* 콘텐츠 */}
      {activeTab === 'available' && renderAvailableContent()}
      {(activeTab === 'sent' || activeTab === 'received') && renderRequestsContent()}

      {/* 요청 모달 */}
      <CoffeeChatRequestModal
        visible={showRequestModal}
        onClose={closeRequestModal}
        target={requestTarget}
        onSendRequest={handleCreateRequest}
        isRequesting={isRequesting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabScrollContent: {
    paddingHorizontal: 0,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#8B0000',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8B0000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterScrollContent: {
    paddingHorizontal: 0,
  },
  statusFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 12,
    fontWeight: '500',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#8B0000',
  },
  filterChipText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#8B0000',
    padding: 8,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImageContainer: {
    marginRight: 12,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userImageText: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: '500',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userGen: {
    fontSize: 12,
    color: '#888',
  },
  userSchool: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 2,
  },
  userMbti: {
    fontSize: 12,
    color: '#888',
  },
  requestButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  requestButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  requestCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  requestInfo: {
    marginBottom: 12,
  },
  requestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requestGen: {
    fontSize: 12,
    color: '#888',
  },
  requestSchool: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 4,
  },
  requestStatus: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  contactButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTarget: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 16,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalSendButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSendButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
