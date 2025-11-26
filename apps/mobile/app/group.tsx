import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGroup } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GroupModal from '../components/groups/GroupModal';
import GroupForm from '../components/groups/GroupForm';

const CATEGORIES = [
  { value: 'STUDY', label: '스터디 그룹' },
  { value: 'CASUAL', label: '취미 그룹' },
] as const;

const TAB_ITEMS = [
  { id: 'all', label: '전체' },
  { id: 'STUDY', label: '스터디 그룹' },
  { id: 'CASUAL', label: '취미 그룹' },
];

interface GroupFilters {
  search: string;
  category_filter: string;
}

const { width } = Dimensions.get('window');

export default function GroupPage() {
  const {
    groups,
    selectedGroup,
    isLoadingGroups,
    isCreatingGroup,
    isTogglingLike,
    userLikedGroups,
    fetchGroups,
    createGroup,
    requestJoinGroup,
    toggleGroupLike,
    handleGroupSelect,
    checkUserLikedGroup,
    checkUserMembership,
    canJoinGroup,
    hasPendingRequest,
    isGroupMember,
  } = useGroup();

  const { user } = useAuthStore();
  const { getThumbnailUrl, getDefaultImageUrl } = useImage();

  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<GroupFilters>({
    search: '',
    category_filter: ''
  });
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  // 탭 변경 핸들러
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const category = tabId === 'all' ? '' : tabId;
    const newFilters = {
      ...filters,
      category_filter: category
    };
    setFilters(newFilters);
  };

  // 초기 로딩 및 필터 변경 시 목록 다시 로드
  useEffect(() => {
    loadGroups();
  }, [filters.search, filters.category_filter]);

  // 그룹 목록이 로드된 후 각 그룹의 좋아요 상태 확인
  useEffect(() => {
    if (groups.length > 0) {
      groups.forEach(async (group) => {
        try {
          await checkUserLikedGroup(group.id);
          await checkUserMembership(group.id);
        } catch (error) {
          console.warn(`그룹 ${group.id} 상태 확인 실패:`, error);
        }
      });
    }
  }, [groups, checkUserLikedGroup, checkUserMembership]);

  const resolveGroupImageUrl = useCallback((value?: string, size: number = 300) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return getThumbnailUrl(value, size);
    }
    return `https://drive.google.com/thumbnail?id=${value}&sz=w${size}`;
  }, [getThumbnailUrl]);

  const loadGroups = async () => {
    try {
      setError('');
      await fetchGroups({ page: 1, size: 50 });
    } catch (err) {
      console.error('그룹 목록 로드 실패:', err);
      setError('그룹 목록을 불러오지 못했습니다.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  // 클라이언트 사이드 필터링
  const filteredGroups = useMemo(() => {
    return groups.filter((group: any) => {
      // 검색어 필터링
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          group.name.toLowerCase().includes(searchLower) ||
          (group.description && group.description.toLowerCase().includes(searchLower)) ||
          group.owner_name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // 카테고리 필터링
      if (filters.category_filter && group.category !== filters.category_filter) {
        return false;
      }

      return true;
    });
  }, [groups, filters]);

  // 필터 초기화
  const clearFilters = () => {
    const emptyFilters: GroupFilters = {
      search: '',
      category_filter: ''
    };
    setFilters(emptyFilters);
    setActiveTab('all');
  };

  const handleGroupClick = async (groupId: number) => {
    try {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        handleGroupSelect(group);
        setShowGroupDetail(true);
      }
    } catch (err) {
      console.error('그룹 선택 실패:', err);
      setError('그룹을 선택할 수 없습니다.');
    }
  };

  const handleLikeToggle = async (groupId: number, e?: any) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await toggleGroupLike(groupId);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      setError('좋아요 처리에 실패했습니다.');
    }
  };

  const handleCreateGroup = async (groupData: any) => {
    try {
      setError('');
      await createGroup(groupData);
      setShowCreateForm(false);
      await loadGroups();
      Alert.alert('성공', '그룹이 성공적으로 생성되었습니다.');
    } catch (err) {
      console.error('그룹 생성 실패:', err);
      setError('그룹 생성에 실패했습니다.');
      Alert.alert('오류', '그룹 생성에 실패했습니다.');
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await requestJoinGroup(groupId);
      await checkUserMembership(groupId);
      Alert.alert('성공', '가입 신청이 완료되었습니다.');
    } catch (err) {
      console.error('그룹 가입 신청 실패:', err);
      setError('그룹 가입 신청에 실패했습니다.');
      Alert.alert('오류', '그룹 가입 신청에 실패했습니다.');
    }
  };

  // 이미지 에러 처리
  const handleImageError = (groupId: string) => {
    setImageErrors(prev => ({ ...prev, [groupId]: true }));
  };

  // 그룹 상태 확인
  const getGroupStatus = (group: any) => {
    if (!group.deadline) return { label: '진행중', style: styles.statusOngoing };
    
    const now = new Date();
    const deadline = new Date(group.deadline);
    const isExpired = now > deadline;
    
    return isExpired 
      ? { label: '마감됨', style: styles.statusExpired }
      : { label: '진행중', style: styles.statusOngoing };
  };

  // 마감일까지 남은 시간 계산
  const getTimeUntilDeadline = (deadline: string) => {
    if (!deadline) return '무기한';
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `마감됨 (${deadlineDate.toLocaleDateString()})`;
    } else if (diffDays === 0) {
      return `오늘 마감 (${deadlineDate.toLocaleDateString()})`;
    } else {
      return `D-${diffDays}`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>그룹</Text>
            <Text style={styles.headerSubtitle}>프로메테우스 그룹 목록</Text>
          </View>
          <View style={styles.headerActions}>
            {user && (
              <TouchableOpacity
                onPress={() => setShowCreateForm(true)}
                style={styles.addButton}
              >
                <FontAwesome name="plus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <Text style={styles.groupCount}>
              전체 <Text style={styles.groupCountNumber}>{groups.length}</Text>개
            </Text>
          </View>
        </View>
      </View>

      {/* 검색 및 필터 */}
      <View style={styles.searchSection}>
        {/* 검색 입력 */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput
            value={filters.search}
            onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
            style={styles.searchInput}
            placeholder="그룹명, 설명을 검색해보세요!"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          {filters.search && (
            <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, search: '' }))}>
              <FontAwesome name="times" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>

        {/* 탭 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {TAB_ITEMS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => handleTabChange(tab.id)}
              style={[
                styles.tab,
                activeTab === tab.id && styles.tabActive
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 필터 초기화 버튼 */}
        {(filters.search || filters.category_filter) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <FontAwesome name="undo" size={14} color="#c2402a" />
            <Text style={styles.clearButtonText}>초기화</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 검색 결과 수 */}
      {(filters.search || filters.category_filter) && (
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>
            검색 결과: {filteredGroups.length}개
          </Text>
        </View>
      )}

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 그룹 목록 */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#c2402a']}
            tintColor="#c2402a"
          />
        }
      >
        {isLoadingGroups ? (
          <View style={styles.loadingContainer}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.skeletonCard}>
                <View style={styles.skeletonThumbnail} />
                <View style={styles.skeletonContent}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonDescription} />
                  <View style={styles.skeletonStats} />
                </View>
              </View>
            ))}
          </View>
        ) : filteredGroups.length > 0 ? (
          <View style={styles.groupsList}>
            {filteredGroups.map((group: any) => (
              <TouchableOpacity 
                key={group.id}
                style={styles.groupCard}
                onPress={() => handleGroupClick(group.id)}
              >
                {/* 썸네일 */}
                <View style={styles.thumbnailContainer}>
                  {group.thumbnail_url && !imageErrors[group.id.toString()] ? (
                    <Image
                      source={{ uri: resolveGroupImageUrl(group.thumbnail_url, 300) }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                      onError={() => handleImageError(group.id.toString())}
                    />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <FontAwesome name="users" size={24} color="rgba(255,255,255,0.3)" />
                    </View>
                  )}
                </View>

                {/* 그룹 정보 */}
                <View style={styles.groupInfo}>
                  {/* 제목과 기수 */}
                  <View style={styles.titleRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.groupTitle} numberOfLines={2}>
                      {group.name}
                    </Text>
                    <View style={styles.genBadge}>
                      <Text style={styles.genText}>{group.owner_gen}기</Text>
                    </View>
                  </View>

                  {/* 카테고리와 상태 */}
                  <View style={styles.badgeRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.badgeText}>
                        {group.category === 'STUDY' ? '스터디 그룹' : '취미 그룹'}
                      </Text>
                    </View>
                    <View style={getGroupStatus(group).style}>
                      <Text style={styles.badgeText}>
                        {getGroupStatus(group).label}
                      </Text>
                    </View>
                  </View>

                  {/* 설명 */}
                  <View style={styles.descriptionContainer}>
                    {group.description ? (
                      <Text style={styles.description} numberOfLines={2}>
                        {group.description}
                      </Text>
                    ) : (
                      <View style={styles.descriptionPlaceholder} />
                    )}
                  </View>

                  {/* 통계 정보 */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <FontAwesome name="users" size={12} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.statText}>
                          {group.current_member_count || 0}
                          {group.max_members ? `/${group.max_members}` : ''}명
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <FontAwesome name="heart" size={12} color="rgba(255,255,255,0.6)" />
                        <Text style={styles.statText}>{group.like_count || 0}개</Text>
                      </View>
                    </View>
                    <View style={styles.deadlineRow}>
                      <FontAwesome name="clock-o" size={12} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.deadlineText}>
                        {getTimeUntilDeadline(group.deadline)}
                      </Text>
                    </View>
                    <Text style={styles.ownerText}>
                      운영자: {group.owner_name}
                    </Text>
                  </View>

                  {/* 액션 버튼들 */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleLikeToggle(group.id, e);
                      }}
                      style={[
                        styles.actionButton,
                        userLikedGroups[group.id] ? styles.likedButton : styles.unlikedButton
                      ]}
                    >
                      <FontAwesome 
                        name={userLikedGroups[group.id] ? "heart" : "heart-o"}
                        size={12} 
                        color={userLikedGroups[group.id] ? "#ff4444" : "rgba(255,255,255,0.6)"} 
                      />
                      <Text style={[
                        styles.actionButtonText,
                        userLikedGroups[group.id] && styles.likedButtonText
                      ]}>
                        좋아요
                      </Text>
                    </TouchableOpacity>

                    {/* 가입 관련 버튼 */}
                    {user && user.id !== group.owner_id && (
                      <>
                        {canJoinGroup(group.id) && (
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              if (group.deadline && new Date(group.deadline) < new Date()) {
                                return;
                              }
                              handleJoinGroup(group.id);
                            }}
                            disabled={group.deadline && new Date(group.deadline) < new Date()}
                            style={[
                              styles.actionButton,
                              group.deadline && new Date(group.deadline) < new Date()
                                ? styles.disabledButton
                                : styles.joinButton
                            ]}
                          >
                            <FontAwesome name="user-plus" size={12} color="#FFFFFF" />
                            <Text style={styles.actionButtonText}>
                              {group.deadline && new Date(group.deadline) < new Date() ? '마감' : '가입'}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {hasPendingRequest(group.id) && (
                          <View style={[styles.actionButton, styles.pendingButton]}>
                            <Text style={styles.pendingButtonText}>신청 중</Text>
                          </View>
                        )}

                        {isGroupMember(group.id) && (
                          <View style={[styles.actionButton, styles.memberButton]}>
                            <Text style={styles.memberButtonText}>멤버</Text>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>그룹이 없습니다.</Text>
            <Text style={styles.emptyText}>
              {(filters.search || filters.category_filter) 
                ? '검색 결과가 없습니다.' 
                : '아직 등록된 그룹이 없습니다.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 그룹 상세 모달 */}
      <GroupModal
        group={selectedGroup}
        visible={showGroupDetail}
        onClose={async () => {
          setShowGroupDetail(false);
          // 모달이 닫힐 때 그룹 목록을 새로고침하여 좋아요 개수 업데이트
          await loadGroups();
          // 선택된 그룹의 좋아요 상태 확인 (이미 toggleGroupLike에서 업데이트되지만 확실히 하기 위해)
          if (selectedGroup) {
            try {
              await checkUserLikedGroup(selectedGroup.id);
            } catch (error) {
              console.warn(`그룹 ${selectedGroup.id} 좋아요 상태 확인 실패:`, error);
            }
          }
        }}
      />

      {/* 그룹 생성 폼 */}
      <GroupForm
        visible={showCreateForm}
        onSubmit={handleCreateGroup}
        onCancel={() => setShowCreateForm(false)}
        isSubmitting={isCreatingGroup}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  addButton: {
    padding: 4,
  },
  groupCount: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  groupCountNumber: {
    color: '#ffa282',
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 4,
  },
  tabsContainer: {
    flexGrow: 0,
  },
  tabsContent: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabActive: {
    backgroundColor: 'rgba(194, 64, 42, 0.2)',
    borderColor: '#c2402a',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    color: '#c2402a',
    fontSize: 12,
  },
  resultCount: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultCountText: {
    color: '#e0e0e0',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  skeletonThumbnail: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    width: '70%',
  },
  skeletonDescription: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    width: '90%',
  },
  skeletonStats: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    width: '50%',
  },
  groupsList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 20,
  },
  groupCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    height: 120,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    padding: 12,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: '#3FFF4F',
    borderRadius: 3,
    marginTop: 6,
  },
  groupTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 20,
  },
  genBadge: {
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(194, 64, 42, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genText: {
    color: '#ffa282',
    fontSize: 11,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusOngoing: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusExpired: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  descriptionContainer: {
    minHeight: 32,
  },
  description: {
    color: '#e0e0e0',
    fontSize: 13,
    lineHeight: 16,
  },
  descriptionPlaceholder: {
    height: 32,
  },
  statsContainer: {
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  ownerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  unlikedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  likedButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
  },
  joinButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  disabledButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  pendingButton: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
  },
  memberButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
  },
  detailButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
  },
  actionButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  likedButtonText: {
    color: '#ff4444',
  },
  detailButtonText: {
    color: '#2196F3',
    fontSize: 11,
  },
  pendingButtonText: {
    color: '#ffa500',
    fontSize: 11,
  },
  memberButtonText: {
    color: '#2196F3',
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 20,
  },
});
