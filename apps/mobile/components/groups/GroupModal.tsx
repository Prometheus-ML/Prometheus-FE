import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useGroup } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import type { Group } from '@prometheus-fe/types';

interface GroupModalProps {
  group: Group | null;
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'STUDY', label: '스터디 그룹' },
  { value: 'CASUAL', label: '취미 그룹' },
] as const;

const { width } = Dimensions.get('window');

export default function GroupModal({ group, visible, onClose }: GroupModalProps) {
  const { user } = useAuthStore();
  const {
    members,
    joinRequests,
    userLikedGroups,
    isLoadingMembers,
    isLoadingJoinRequests,
    isTogglingLike,
    isDeletingGroup,
    fetchGroupMembers,
    fetchJoinRequests,
    approveMember,
    rejectMember,
    removeMember,
    deleteGroup,
    toggleGroupLike,
    fetchGroupLikes,
    checkUserLikedGroup,
    canViewJoinRequests,
    canDeleteGroup,
    requestJoinGroup,
    checkUserMembership,
    canJoinGroup,
    hasPendingRequest,
    isGroupMember,
  } = useGroup();

  const [error, setError] = useState('');
  const [localLikeCount, setLocalLikeCount] = useState<number | null>(null);
  const { getThumbnailUrl } = useImage({});

  const resolveThumbnail = useCallback((value?: string, size: number = 400) => {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return getThumbnailUrl(value, size);
    }
    return `https://drive.google.com/thumbnail?id=${value}&sz=w${size}`;
  }, [getThumbnailUrl]);

  // 그룹의 좋아요 개수 (로컬 상태가 있으면 우선 사용, 없으면 prop 사용)
  const displayLikeCount = localLikeCount !== null ? localLikeCount : (group?.like_count || 0);

  // 그룹 prop이 변경되면 로컬 상태 초기화
  useEffect(() => {
    if (group) {
      setLocalLikeCount(null); // prop의 값으로 리셋
    }
  }, [group?.id]);

  // 그룹 상태 확인 (마감됨/진행중)
  const getGroupStatus = (group: Group) => {
    if (!group.deadline) return { status: 'ongoing', label: '진행중', style: styles.statusOngoing };
    
    const now = new Date();
    const deadline = new Date(group.deadline);
    const isExpired = now > deadline;
    
    if (isExpired) {
      return { status: 'expired', label: '마감됨', style: styles.statusExpired };
    } else {
      return { status: 'ongoing', label: '진행중', style: styles.statusOngoing };
    }
  };

  // 마감일까지 남은 시간 계산
  const getTimeUntilDeadline = (deadline: string) => {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return '마감됨';
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 1) {
      return `${diffDays}일 남음`;
    } else if (diffHours > 1) {
      return `${diffHours}시간 남음`;
    } else {
      return '1시간 미만 남음';
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const handleLikeToggle = async () => {
    if (!group) return;
    try {
      const result = await toggleGroupLike(group.id);
      // 좋아요 개수를 즉시 업데이트
      if (result && typeof result.like_count === 'number') {
        setLocalLikeCount(result.like_count);
      }
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      setError('좋아요 처리에 실패했습니다.');
    }
  };

  const handleApproveMember = async (requestId: number) => {
    if (!group) return;
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) return;
      
      await approveMember(group.id, request.member_id);
      await fetchJoinRequests(group.id);
      await fetchGroupMembers(group.id);
      
      if (user && user.id === request.member_id) {
        await checkUserMembership(group.id);
      }
    } catch (err) {
      console.error('멤버 승인 실패:', err);
      setError('멤버 승인에 실패했습니다.');
    }
  };

  const handleRejectMember = async (requestId: number) => {
    if (!group) return;
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) return;
      
      await rejectMember(group.id, request.member_id);
      await fetchJoinRequests(group.id);
      
      if (user && user.id === request.member_id) {
        await checkUserMembership(group.id);
      }
    } catch (err) {
      console.error('멤버 거절 실패:', err);
      setError('멤버 거절에 실패했습니다.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!group) return;
    
    Alert.alert(
      '멤버 제거',
      '정말 이 멤버를 그룹에서 제거하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제거',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMember(group.id, memberId);
              await fetchGroupMembers(group.id);
              
              if (user && user.id === memberId) {
                await checkUserMembership(group.id);
              }
            } catch (err) {
              console.error('멤버 제거 실패:', err);
              setError('멤버 제거에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleDeleteGroup = async () => {
    if (!group) return;
    
    Alert.alert(
      '그룹 삭제',
      '정말 이 그룹을 삭제하시겠습니까?\n삭제된 그룹은 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup(group.id);
              onClose();
              Alert.alert('성공', '그룹이 성공적으로 삭제되었습니다.');
            } catch (err) {
              console.error('그룹 삭제 실패:', err);
              setError('그룹 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleJoinGroup = async () => {
    if (!group) return;
    try {
      await requestJoinGroup(group.id);
      await checkUserMembership(group.id);
      Alert.alert('성공', '가입 신청이 완료되었습니다.');
      onClose();
    } catch (err) {
      console.error('그룹 가입 신청 실패:', err);
      setError('그룹 가입 신청에 실패했습니다.');
    }
  };

  // 컴포넌트가 마운트될 때 필요한 데이터 로드
  useEffect(() => {
    if (visible && group) {
      fetchGroupMembers(group.id);
      fetchGroupLikes(group.id).catch(() => {});
      checkUserLikedGroup(group.id).catch(() => {});
      checkUserMembership(group.id).catch(() => {});
      
      if (canViewJoinRequests(group)) {
        fetchJoinRequests(group.id).catch(() => {});
      }
    }
  }, [visible, group, fetchGroupMembers, fetchGroupLikes, checkUserLikedGroup, canViewJoinRequests, checkUserMembership]);

  if (!group) return null;

  const groupStatus = getGroupStatus(group);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {group.name}
            </Text>
            <View style={styles.headerActions}>
              {user && user.id === group.owner_id && (
                <TouchableOpacity
                  onPress={handleDeleteGroup}
                  disabled={isDeletingGroup}
                  style={styles.deleteButton}
                >
                  {isDeletingGroup ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <FontAwesome name="trash" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 에러 메시지 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 그룹 썸네일 */}
          <View className="w-full h-48 bg-white/10 rounded-lg overflow-hidden my-6">
            {group.thumbnail_url ? (
              <Image
                source={{ uri: getThumbnailUrl(group.thumbnail_url, 400) }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View style={styles.thumbnailPlaceholder}>
                <FontAwesome name="users" size={40} color="rgba(255,255,255,0.3)" />
              </View>
            )}
          </View>

          {/* 그룹 정보 */}
          <View style={styles.infoSection}>
            <View style={styles.badgeContainer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.badgeText}>{getCategoryLabel(group.category)}</Text>
              </View>
              <View style={[styles.statusBadge, groupStatus.style]}>
                <Text style={styles.badgeText}>{groupStatus.label}</Text>
              </View>
            </View>

            {group.description && (
              <Text style={styles.description}>{group.description}</Text>
            )}

            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>소유자: {group.owner_gen}기 {group.owner_name}</Text>
              <Text style={styles.detailText}>멤버 수: {group.current_member_count || 0}명</Text>
              {group.max_members && (
                <Text style={styles.detailText}>최대 인원: {group.max_members}명</Text>
              )}
              <Text style={styles.detailText}>좋아요: {displayLikeCount}개</Text>
            </View>

            {/* 마감일 정보 */}
            <View style={styles.deadlineContainer}>
              <Text style={styles.deadlineTitle}>마감일 정보</Text>
              {group.deadline ? (
                <>
                  <Text style={styles.deadlineText}>
                    마감일: {new Date(group.deadline).toLocaleString('ko-KR')}
                  </Text>
                  <Text style={[
                    styles.deadlineStatus,
                    groupStatus.status === 'expired' ? styles.deadlineExpired : styles.deadlineActive
                  ]}>
                    상태: {getTimeUntilDeadline(group.deadline)}
                  </Text>
                </>
              ) : (
                <Text style={styles.deadlineUnlimited}>무기한 진행</Text>
              )}
            </View>
          </View>

          {/* 액션 버튼들 */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={handleLikeToggle}
              disabled={isTogglingLike}
              style={[
                styles.actionButton,
                userLikedGroups[group.id] ? styles.likedButton : styles.unlikedButton
              ]}
            >
              <FontAwesome 
                name={userLikedGroups[group.id] ? "heart" : "heart-o"} 
                size={16} 
                color={userLikedGroups[group.id] ? "#ff4444" : "#FFFFFF"} 
              />
              <Text style={[
                styles.actionButtonText,
                userLikedGroups[group.id] && styles.likedButtonText
              ]}>
                {userLikedGroups[group.id] ? '좋아요 취소' : '좋아요'}
              </Text>
            </TouchableOpacity>

            {/* 가입 관련 버튼 - 오너가 아닌 사용자에게만 표시 */}
            {user && user.id !== group.owner_id && (
              <>
                {/* 가입 신청 버튼 */}
                {canJoinGroup(group.id) && (
                  <TouchableOpacity
                    onPress={handleJoinGroup}
                    disabled={!!(group.deadline && new Date(group.deadline) < new Date())}
                    style={[
                      styles.actionButton,
                      group.deadline && new Date(group.deadline) < new Date()
                        ? styles.disabledButton
                        : styles.joinButton
                    ]}
                  >
                    <FontAwesome name="user-plus" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>
                      {group.deadline && new Date(group.deadline) < new Date() ? '마감됨' : '가입 신청'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* 가입 신청 중 표시 */}
                {hasPendingRequest(group.id) && (
                  <View style={[styles.actionButton, styles.pendingButton]}>
                    <FontAwesome name="clock-o" size={16} color="#ffa500" />
                    <Text style={styles.pendingButtonText}>가입 신청 중</Text>
                  </View>
                )}

                {/* 이미 멤버인 경우 표시 */}
                {isGroupMember(group.id) && (
                  <View style={[styles.actionButton, styles.memberButton]}>
                    <FontAwesome name="check" size={16} color="#4CAF50" />
                    <Text style={styles.memberButtonText}>이미 멤버</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* 멤버 목록 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>멤버 목록</Text>
            {isLoadingMembers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#c2402a" />
              </View>
            ) : (
              <View style={styles.membersList}>
                {members.map((member: any) => (
                  <View key={member.member_id} style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <View style={styles.memberBadges}>
                        <View style={styles.genBadge}>
                          <Text style={styles.genText}>{member.gen}기</Text>
                        </View>
                        <View style={[
                          styles.roleBadge,
                          member.role === 'owner' ? styles.ownerBadge : styles.memberRoleBadge
                        ]}>
                          <Text style={styles.roleText}>
                            {member.role === 'owner' ? '소유자' : '멤버'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {/* 소유자가 아닌 멤버만 제거 가능 */}
                    {user && user.id === group.owner_id && member.role !== 'owner' && (
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(member.member_id)}
                        style={styles.removeButton}
                      >
                        <FontAwesome name="times" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 가입 신청 목록 */}
          {canViewJoinRequests(group) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>가입 신청</Text>
              {isLoadingJoinRequests ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#c2402a" />
                </View>
              ) : (
                <View style={styles.requestsList}>
                  {joinRequests.length > 0 ? (
                    joinRequests.map((request: any) => (
                      <View key={request.id} style={styles.requestItem}>
                        <View style={styles.requestInfo}>
                          <Text style={styles.requestName}>{request.name}</Text>
                          <View style={styles.genBadge}>
                            <Text style={styles.genText}>{request.gen}기</Text>
                          </View>
                        </View>
                        <View style={styles.requestActions}>
                          <TouchableOpacity
                            onPress={() => handleApproveMember(request.id)}
                            style={styles.approveButton}
                          >
                            <FontAwesome name="check" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleRejectMember(request.id)}
                            style={styles.rejectButton}
                          >
                            <FontAwesome name="times" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <FontAwesome name="users" size={24} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.emptyText}>아직 가입 신청이 없습니다</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    backgroundColor: '#c2402a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
  },
  thumbnailContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  thumbnail: {
    width: width - 64,
    height: 160,
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    width: width - 64,
    height: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    marginBottom: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusOngoing: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusExpired: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  description: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailText: {
    color: '#e0e0e0',
    fontSize: 13,
    marginBottom: 4,
  },
  deadlineContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  deadlineTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deadlineText: {
    color: '#e0e0e0',
    fontSize: 13,
    marginBottom: 4,
  },
  deadlineStatus: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  deadlineExpired: {
    color: '#ff4444',
  },
  deadlineActive: {
    color: '#4CAF50',
  },
  deadlineUnlimited: {
    color: '#2196F3',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  unlikedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  likedButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  joinButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  disabledButton: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  pendingButton: {
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.3)',
  },
  memberButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  likedButtonText: {
    color: '#ff4444',
  },
  pendingButtonText: {
    color: '#ffa500',
    fontSize: 14,
    fontWeight: '500',
  },
  memberButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  membersList: {
    gap: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  memberBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  genBadge: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genText: {
    color: '#2196F3',
    fontSize: 11,
  },
  roleBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  ownerBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  memberRoleBadge: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    borderColor: 'rgba(0, 123, 255, 0.3)',
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  removeButton: {
    backgroundColor: '#c2402a',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  requestsList: {
    gap: 8,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  requestInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  rejectButton: {
    backgroundColor: '#c2402a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 8,
  },
});
