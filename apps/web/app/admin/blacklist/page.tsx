"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useMember } from '@prometheus-fe/hooks';
import { MemberSelector } from '../../../src/components/SearchMemberBar';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import { 
  MemberResponse, 
  MemberSummaryResponse, 
  MemberListRequest,
  MemberUpdateRequest
} from '@prometheus-fe/types';


// 권한 레벨 매핑
const GRANT_HIERARCHY = {
  'Member': 1,
  'Administrator': 2,
  'Super': 3,
  'Root': 4,
} as const;

// 블랙리스트 추가 모달 컴포넌트
interface AddBlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memberId: string, reason: string) => void;
  selectedMember: MemberSummaryResponse | null;
  onSelectMember: (member: MemberSummaryResponse) => void;
  onDeselectMember: () => void;
  blacklistReason: string;
  onReasonChange: (reason: string) => void;
  isLoading: boolean;
}

function AddBlacklistModal({
  isOpen,
  onClose,
  onAdd,
  selectedMember,
  onSelectMember,
  onDeselectMember,
  blacklistReason,
  onReasonChange,
  isLoading
}: AddBlacklistModalProps) {
  const { getThumbnailUrl } = useImage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">블랙리스트 추가</h3>
          
          {/* 멤버 검색 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">멤버 검색</label>
            <MemberSelector
              onMemberSelect={onSelectMember}
              onMemberDeselect={onDeselectMember}
              placeholder="멤버 이름으로 검색하세요..."
              showSelectedMember={true}
              className="w-full"
            />
          </div>

          {/* 블랙리스트 사유 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">블랙리스트 사유</label>
            <textarea
              value={blacklistReason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              placeholder="블랙리스트 사유를 입력하세요"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => selectedMember && onAdd(selectedMember.id, blacklistReason)}
              disabled={!selectedMember || !blacklistReason || isLoading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? '처리 중...' : '블랙리스트 추가'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 블랙리스트 사유 수정 모달 컴포넌트
interface EditBlacklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (reason: string) => void;
  member: MemberResponse | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  isLoading: boolean;
}

function EditBlacklistModal({
  isOpen,
  onClose,
  onUpdate,
  member,
  reason,
  onReasonChange,
  isLoading
}: EditBlacklistModalProps) {
  const { getThumbnailUrl } = useImage();

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">블랙리스트 사유 수정</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">멤버</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                {member.profile_image_url ? (
                  <div className="relative h-8 w-8 mr-3">
                    <Image
                      src={getThumbnailUrl(member.profile_image_url, 80)}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-gray-700">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">블랙리스트 사유</label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              placeholder="블랙리스트 사유를 입력하세요"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={() => onUpdate(reason)}
              disabled={!reason || isLoading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? '처리 중...' : '수정'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlacklistPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // 멤버 목록 상태
  const [members, setMembers] = useState<MemberSummaryResponse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // 블랙리스트 추가 모달 상태
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedMemberForBlacklist, setSelectedMemberForBlacklist] = useState<MemberSummaryResponse | null>(null);
  const [blacklistReason, setBlacklistReason] = useState<string>('');

  // 블랙리스트 수정 모달 상태
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<MemberResponse | null>(null);
  const [editBlacklistReason, setEditBlacklistReason] = useState<string>('');

  // API 훅 사용
  const { getMemberList, getMember, updateMember, deleteMember } = useMember();
  const { getThumbnailUrl } = useImage();

  // 권한 체크
  const canManageBlacklist = useMemo(() => {
    if (!user?.grant) return false;
    const currentLevel = GRANT_HIERARCHY[user.grant as keyof typeof GRANT_HIERARCHY] || 0;
    const requiredLevel = GRANT_HIERARCHY['Administrator'] || 3;
    return currentLevel >= requiredLevel;
  }, [user?.grant]);

  const canDeleteMember = useMemo(() => {
    if (!user?.grant) return false;
    const currentLevel = GRANT_HIERARCHY[user.grant as keyof typeof GRANT_HIERARCHY] || 0;
    const requiredLevel = GRANT_HIERARCHY['Super'] || 4;
    return currentLevel >= requiredLevel;
  }, [user?.grant]);

  // 페이지네이션 계산
  const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);
  
  const visiblePages = useMemo(() => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Hydration 완료 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 권한 체크 (hydration 완료 후에만)
  useEffect(() => {
    if (!isMounted) return;

    if (!isAuthenticated()) {
      alert('로그인이 필요합니다.');
      window.location.href = '/auth/login';
      return;
    }

    if (!canAccessManager()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  // 블랙리스트 멤버 목록 로드
  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const params: MemberListRequest = {
        page: currentPage,
        size: pageSize,
        status_filter: 'blacklist' // 항상 blacklist만 조회
      };
      
      const response = await getMemberList(params);
      setMembers(response.members || []);
      setTotal(response.total || 0);
      setImageErrors({});
    } catch (err) {
      console.error('Failed to load blacklist members:', err);
      setError('블랙리스트 멤버 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, getMemberList]);

  // 멤버 선택
  const selectMember = useCallback((member: MemberSummaryResponse) => {
    setSelectedMemberForBlacklist(member);
  }, []);

  // 멤버 선택 해제
  const deselectMember = useCallback(() => {
    setSelectedMemberForBlacklist(null);
  }, []);

  // 블랙리스트 추가
  const addToBlacklist = useCallback(async (memberId: string, reason: string) => {
    if (!canManageBlacklist) {
      alert('블랙리스트 설정은 Administrator 권한 이상이 필요합니다.');
      return;
    }

    if (!confirm(`정말로 이 멤버를 블랙리스트에 추가하시겠습니까?\n사유: ${reason}`)) {
      return;
    }

    try {
      const updateData: MemberUpdateRequest = {
        status: 'blacklist',
        // meta: {
        //   blacklist_reason: reason
        // }
      };
      
      await updateMember(memberId, updateData);
      await loadMembers();
      closeAddModal();
    } catch (err) {
      console.error('Failed to add to blacklist:', err);
      setError('블랙리스트 설정 중 오류가 발생했습니다.');
    }
  }, [canManageBlacklist, updateMember, loadMembers]);

  // 블랙리스트 사유 수정
  const handleEditBlacklistReason = useCallback(async (member: MemberSummaryResponse) => {
    if (!canManageBlacklist) {
      alert('블랙리스트 사유 수정은 Administrator 권한 이상이 필요합니다.');
      return;
    }

    try {
      const memberDetail = await getMember(member.id);
      setEditingMember(memberDetail);
      setEditBlacklistReason(memberDetail.meta?.blacklist_reason || '');
      setShowEditModal(true);
    } catch (err) {
      console.error('Failed to get member details:', err);
      setError('멤버 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, [canManageBlacklist, getMember]);

  // 블랙리스트 사유 업데이트
  const updateBlacklistReason = useCallback(async (reason: string) => {
    if (!editingMember) return;

    try {
      const updateData: MemberUpdateRequest = {
        // meta: {
        //   ...editingMember.meta,
        //   blacklist_reason: reason
        // }
      };
      
      await updateMember(editingMember.id, updateData);
      await loadMembers();
      closeEditModal();
    } catch (err) {
      console.error('Failed to update blacklist reason:', err);
      setError('블랙리스트 사유 수정 중 오류가 발생했습니다.');
    }
  }, [editingMember, updateMember, loadMembers]);

  // 멤버 삭제
  const deleteMemberHandler = useCallback(async (member: MemberSummaryResponse) => {
    if (!canDeleteMember) {
      alert('멤버 삭제는 Super 권한만 가능합니다.');
      return;
    }

    if (!confirm(`정말로 ${member.name}님을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await deleteMember(member.id);
      await loadMembers();
    } catch (err) {
      console.error('Failed to delete member:', err);
      setError('멤버 삭제 중 오류가 발생했습니다.');
    }
  }, [canDeleteMember, deleteMember, loadMembers]);

  // 모달 닫기
  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setSelectedMemberForBlacklist(null);
    setBlacklistReason('');
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingMember(null);
    setEditBlacklistReason('');
  }, []);

  // 페이지 이동
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  // 이미지 로딩 에러 처리
  const handleImageError = useCallback((memberId: string) => {
    setImageErrors(prev => ({ ...prev, [memberId]: true }));
  }, []);

  // 멤버 목록 로드
  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessManager()) return;
    loadMembers();
  }, [isMounted, loadMembers, isAuthenticated, canAccessManager]);

  // 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    if (isMounted && isAuthenticated() && canAccessManager()) {
      loadMembers();
    }
  }, [currentPage, loadMembers]);

  // Hydration이 완료되지 않았거나 권한이 없는 경우
  if (!isMounted || !isAuthenticated() || !canAccessManager()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">
          {!isMounted ? '로딩 중...' : '권한 확인 중...'}
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <GlassCard className="p-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate">
                블랙리스트 관리
              </h2>
              <p className="mt-1 text-sm text-gray-300">
                블랙리스트 멤버를 관리하고 사유를 확인하세요
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <div className="flex space-x-3">
                <RedButton
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center text-sm font-medium"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  블랙리스트 추가
                </RedButton>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 블랙리스트 멤버 목록 */}
        <GlassCard className="overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 className="mt-2 text-sm font-medium text-white">오류 발생</h3>
                <p className="mt-1 text-sm text-gray-300">{error}</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200/20">
              {members.map((member) => (
                <li key={member.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {member.profile_image_url && !imageErrors[member.id] ? (
                          <div className="relative h-10 w-10">
                            <Image
                              src={getThumbnailUrl(member.profile_image_url, 80)}
                              alt={member.name}
                              fill
                              className="rounded-full object-cover"
                              onError={() => handleImageError(member.id)}
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-white">{member.name}</p>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            블랙리스트
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{member.email}</p>
                        <p className="text-sm text-gray-300">
                          {member.gen}기 · {member.school} {member.major}
                        </p>
                        {/* 블랙리스트 사유는 상세 정보에서 가져와야 하므로 여기서는 표시하지 않음 */}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {canManageBlacklist && (
                        <button
                          onClick={() => handleEditBlacklistReason(member)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          사유 수정
                        </button>
                      )}
                      {canDeleteMember && (
                        <button
                          onClick={() => deleteMemberHandler(member)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200/20 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                    에서
                    <span className="font-medium">{Math.min(currentPage * pageSize, total)}</span>
                    까지
                    <span className="font-medium">{total}</span>
                    중
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    {visiblePages.map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* 통계 카드 */}
        <GlassCard className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-300 truncate">블랙리스트 멤버</dt>
                <dd className="text-lg font-medium text-white">{total}</dd>
              </dl>
            </div>
          </div>
        </GlassCard>

        {/* 블랙리스트 추가 모달 */}
        <AddBlacklistModal
          isOpen={showAddModal}
          onClose={closeAddModal}
          onAdd={addToBlacklist}
          selectedMember={selectedMemberForBlacklist}
          onSelectMember={selectMember}
          onDeselectMember={deselectMember}
          blacklistReason={blacklistReason}
          onReasonChange={setBlacklistReason}
          isLoading={isLoading}
        />

        {/* 블랙리스트 사유 수정 모달 */}
        <EditBlacklistModal
          isOpen={showEditModal}
          onClose={closeEditModal}
          onUpdate={updateBlacklistReason}
          member={editingMember}
          reason={editBlacklistReason}
          onReasonChange={setEditBlacklistReason}
          isLoading={isLoading}
        />
      </div>
  );
}
