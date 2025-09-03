'use client';

import { useState, useEffect } from 'react';
import { useGroup } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from './GlassCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faCheck, 
  faTimes, 
  faTrash,
  faUserPlus,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import Image from 'next/image';
import type { Group } from '@prometheus-fe/types';

interface GroupModalProps {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'STUDY', label: '스터디 그룹' },
  { value: 'CASUAL', label: '취미 그룹' },
] as const;

export default function GroupModal({ group, isOpen, onClose }: GroupModalProps) {
  const { user } = useAuthStore();
  const {
    members,
    joinRequests,
    groupLikes,
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
    requestJoinGroup, // 가입 신청 함수 추가
    checkUserMembership, // 가입 상태 확인 함수 추가
    canJoinGroup, // 가입 가능 여부 확인 함수 추가
    hasPendingRequest, // 가입 신청 중인지 확인 함수 추가
    isGroupMember, // 이미 멤버인지 확인 함수 추가
  } = useGroup();

  const [error, setError] = useState('');

  // useImage 훅 사용
  const {
    getThumbnailUrl,
  } = useImage({});

  // 그룹 상태 확인 (마감됨/진행중)
  const getGroupStatus = (group: Group) => {
    if (!group.deadline) return { status: 'ongoing', label: '진행중', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
    
    const now = new Date();
    const deadline = new Date(group.deadline);
    const isExpired = now > deadline;
    
    if (isExpired) {
      return { status: 'expired', label: '마감됨', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    } else {
      return { status: 'ongoing', label: '진행중', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      STUDY: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      CASUAL: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const handleLikeToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await toggleGroupLike(group.id);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      setError('좋아요 처리에 실패했습니다.');
    }
  };

  const handleApproveMember = async (requestId: number) => {
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) return;
      
      await approveMember(group.id, request.member_id);
      await fetchJoinRequests(group.id);
      await fetchGroupMembers(group.id);
      
      // 승인된 사용자의 가입 상태 업데이트 (해당 사용자가 현재 로그인한 사용자인 경우)
      if (user && user.id === request.member_id) {
        await checkUserMembership(group.id);
      }
    } catch (err) {
      console.error('멤버 승인 실패:', err);
      setError('멤버 승인에 실패했습니다.');
    }
  };

  const handleRejectMember = async (requestId: number) => {
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) return;
      
      await rejectMember(group.id, request.member_id);
      await fetchJoinRequests(group.id);
      
      // 거절된 사용자의 가입 상태 업데이트 (해당 사용자가 현재 로그인한 사용자인 경우)
      if (user && user.id === request.member_id) {
        await checkUserMembership(group.id);
      }
    } catch (err) {
      console.error('멤버 거절 실패:', err);
      setError('멤버 거절에 실패했습니다.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('정말 이 멤버를 그룹에서 제거하시겠습니까?')) {
      return;
    }
    
    try {
      await removeMember(group.id, memberId);
      await fetchGroupMembers(group.id);
      
      // 제거된 사용자의 가입 상태 업데이트 (해당 사용자가 현재 로그인한 사용자인 경우)
      if (user && user.id === memberId) {
        await checkUserMembership(group.id);
      }
    } catch (err) {
      console.error('멤버 제거 실패:', err);
      setError('멤버 제거에 실패했습니다.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('정말 이 그룹을 삭제하시겠습니까?\n삭제된 그룹은 복구할 수 없습니다.')) {
      return;
    }
    
    try {
      await deleteGroup(group.id);
      onClose();
      alert('그룹이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('그룹 삭제 실패:', err);
      setError('그룹 삭제에 실패했습니다.');
    }
  };

  const handleJoinGroup = async () => {
    try {
      await requestJoinGroup(group.id);
      // 가입 신청 후 가입 상태 다시 확인
      await checkUserMembership(group.id);
      alert('가입 신청이 완료되었습니다.');
      // 가입 신청 후 모달 닫기
      onClose();
    } catch (err) {
      console.error('그룹 가입 신청 실패:', err);
      setError('그룹 가입 신청에 실패했습니다.');
    }
  };

  // 컴포넌트가 마운트될 때 필요한 데이터 로드
  useEffect(() => {
    if (isOpen && group) {
      fetchGroupMembers(group.id);
      fetchGroupLikes(group.id).catch(() => {});
      checkUserLikedGroup(group.id).catch(() => {});
      checkUserMembership(group.id).catch(() => {}); // 가입 상태 확인 추가
      
      if (canViewJoinRequests(group)) {
        fetchJoinRequests(group.id).catch(() => {});
      }
    }
  }, [isOpen, group, fetchGroupMembers, fetchGroupLikes, checkUserLikedGroup, canViewJoinRequests, checkUserMembership]);

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{group.name}</h2>
          <div className="flex items-center space-x-2">
            {/* 소유자만 그룹 삭제 가능 */}
            {user && user.id === group.owner_id && (
              <button
                onClick={handleDeleteGroup}
                disabled={isDeletingGroup}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="그룹 삭제"
              >
                {isDeletingGroup ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    삭제 중...
                  </div>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    그룹 삭제
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {/* 그룹 썸네일 */}
          <div className="flex justify-center">
            <div className="w-48 h-32 rounded-lg overflow-hidden bg-white/10">
              {group.thumbnail_url ? (
                <Image
                  src={getThumbnailUrl(group.thumbnail_url, 400)}
                  alt={group.name}
                  width={192}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== group.thumbnail_url && group.thumbnail_url) {
                      target.src = group.thumbnail_url;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faUsers} className="text-white/30 text-4xl" />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(group.category)}`}>
              {getCategoryLabel(group.category)}
            </span>
            <span className={`ml-2 px-2 py-1 text-xs rounded-full border ${getGroupStatus(group).color}`}>
              {getGroupStatus(group).label}
            </span>
          </div>
          
          {group.description && (
            <p className="text-gray-300">{group.description}</p>
          )}
          
          <div className="text-sm text-gray-300">
            <p>소유자: {group.owner_gen}기 {group.owner_name}</p>
            <p>멤버 수: {group.current_member_count || 0}명</p>
            {group.max_members && (
              <p>최대 인원: {group.max_members}명</p>
            )}
            <p>좋아요: {group.like_count || 0}개</p>
            {/* 마감일 정보 표시 */}
            <div className="mt-2 p-2 bg-white/10 rounded">
              <p className="font-medium text-white">마감일 정보</p>
              {group.deadline ? (
                <>
                  <p>마감일: {new Date(group.deadline).toLocaleString('ko-KR')}</p>
                  <p className={`font-semibold ${
                    getGroupStatus(group).status === 'expired' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    상태: {getTimeUntilDeadline(group.deadline)}
                  </p>
                </>
              ) : (
                <p className="font-semibold text-blue-400">무기한 진행</p>
              )}
            </div>
          </div>

          {/* 좋아요 버튼과 가입 신청 버튼을 나란히 배치 */}
          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={handleLikeToggle}
              disabled={isTogglingLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                userLikedGroups[group.id]
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
              }`}
            >
              <FontAwesomeIcon 
                icon={userLikedGroups[group.id] ? faHeartSolid : faHeartRegular} 
                className="mr-2" 
              />
              <span>
                {userLikedGroups[group.id] ? '좋아요 취소' : '좋아요'}
              </span>
            </button>

            {/* 가입 관련 버튼 - 오너가 아닌 사용자에게만 표시 */}
            {user && user.id !== group.owner_id && (
              <>
                {/* 가입 신청 버튼 - 가입 가능한 경우에만 표시 */}
                {canJoinGroup(group.id) && (
                  <button
                    onClick={handleJoinGroup}
                    disabled={!!(group.deadline && new Date(group.deadline) < new Date())}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      group.deadline && new Date(group.deadline) < new Date()
                        ? 'bg-gray-600/20 text-gray-400 border-gray-600/30 cursor-not-allowed'
                        : 'bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30'
                    }`}
                  >
                    <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                    <span>{group.deadline && new Date(group.deadline) < new Date() ? '마감됨' : '가입 신청'}</span>
                  </button>
                )}

                {/* 가입 신청 중 표시 */}
                {hasPendingRequest(group.id) && (
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-600/20 text-yellow-400 border border-yellow-600/30">
                    <FontAwesomeIcon icon={faClock} className="mr-2" />
                    <span>가입 신청 중</span>
                  </div>
                )}

                {/* 이미 멤버인 경우 표시 */}
                {isGroupMember(group.id) && (
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-600/30">
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    <span>이미 멤버</span>
                  </div>
                  )}
              </>
            )}
          </div>
        </div>

        {/* 멤버 목록 */}
        {isLoadingMembers ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
          </div>
        ) : (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">멤버 목록</h3>
            <div className="space-y-2">
              {members.map((member: any) => (
                <div key={member.member_id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{member.name}</span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                      {member.gen}기
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      member.role === 'owner' 
                        ? 'bg-yellow-500/20 text-yellow-300' 
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {member.role === 'owner' ? '소유자' : '멤버'}
                    </span>
                  </div>
                  {/* 소유자가 아닌 멤버만 제거 가능 */}
                  {user && user.id === group.owner_id && member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(member.member_id)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      제거
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 가입 신청 목록 */}
        {canViewJoinRequests(group) && (
          <>
            {isLoadingJoinRequests ? (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
              </div>
            ) : (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">가입 신청</h3>
                <div className="space-y-2">
                  {joinRequests.length > 0 ? (
                    joinRequests.map((request: any) => (
                      <div key={request.id} className="flex items-center justify-between p-2 bg-white/10 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{request.name}</span>
                          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                            {request.gen}기
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveMember(request.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                            승인
                          </button>
                          <button
                            onClick={() => handleRejectMember(request.id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                            거절
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 bg-white/5 rounded border border-white/10">
                      <FontAwesomeIcon icon={faUsers} className="mr-2 text-gray-500" />
                      아직 가입 신청이 없습니다
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  );
}
