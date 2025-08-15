'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@prometheus-fe/stores';
import { useGroup } from '@prometheus-fe/hooks';

const CATEGORIES = [
  { value: 'STUDY', label: '스터디 그룹' },
  { value: 'CASUAL', label: '취미 그룹' },
] as const;

export default function AdminGroupPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  const {
    groups,
    selectedGroup,
    members,
    joinRequests,
    isLoadingGroups,
    isLoadingGroup,
    isLoadingMembers,
    isLoadingJoinRequests,
    isCreatingGroup,
    fetchGroups,
    fetchGroup,
    createGroup,
    fetchGroupMembers,
    fetchJoinRequests,
    approveMember,
    rejectMember,
    filterGroupsByCategory,
  } = useGroup();

  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [newGroup, setNewGroup] = useState<any>({
    name: '',
    description: '',
    category: 'STUDY',
    max_members: undefined,
    thumbnail_url: '',
  });

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

  // 초기 그룹 목록 로드
  useEffect(() => {
    if (isMounted && isAuthenticated() && canAccessManager()) {
      loadGroups();
    }
  }, [isMounted, isAuthenticated, canAccessManager]);

  const loadGroups = async () => {
    try {
      setError('');
      await fetchGroups({ page: 1, size: 50 });
    } catch (err) {
      console.error('그룹 목록 로드 실패:', err);
      setError('그룹 목록을 불러오지 못했습니다.');
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      filterGroupsByCategory(category as 'STUDY' | 'CASUAL');
    } else {
      loadGroups();
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroup.name.trim()) {
      setError('그룹 이름을 입력해주세요.');
      return;
    }

    try {
      setError('');
      await createGroup(newGroup);
      setNewGroup({
        name: '',
        description: '',
        category: 'STUDY',
        max_members: undefined,
        thumbnail_url: '',
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('그룹 생성 실패:', err);
      setError('그룹 생성에 실패했습니다.');
    }
  };



  const handleGroupClick = async (groupId: number) => {
    setSelectedGroupId(groupId);
    setShowGroupDetail(true);
    
    try {
      await Promise.all([
        fetchGroup(groupId),
        fetchGroupMembers(groupId),
        fetchJoinRequests(groupId).catch(() => {})
      ]);
    } catch (err) {
      console.error('그룹 상세 정보 로드 실패:', err);
    }
  };

  const handleCloseDetail = () => {
    setShowGroupDetail(false);
    setSelectedGroupId(null);
  };

  const handleApproveMember = async (memberId: string) => {
    if (!selectedGroupId) return;
    
    try {
      await approveMember(selectedGroupId, memberId);
    } catch (err) {
      console.error('멤버 승인 실패:', err);
      setError('멤버 승인에 실패했습니다.');
    }
  };

  const handleRejectMember = async (memberId: string) => {
    if (!selectedGroupId) return;
    
    try {
      await rejectMember(selectedGroupId, memberId);
    } catch (err) {
      console.error('멤버 거절 실패:', err);
      setError('멤버 거절에 실패했습니다.');
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      STUDY: 'bg-blue-100 text-blue-800 border-blue-200',
      CASUAL: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

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
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">그룹 관리</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              총 {groups.length}개의 그룹
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              그룹 만들기
            </button>
          </div>
        </div>

        {/* 그룹 생성 폼 */}
        {showCreateForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">새 그룹 만들기</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    그룹 이름 *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup((prev: any) => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="그룹 이름을 입력하세요"
                    maxLength={200}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <select
                    value={newGroup.category}
                    onChange={(e) => setNewGroup((prev: any) => ({ ...prev, category: e.target.value as 'STUDY' | 'CASUAL' }))}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹 설명
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup((prev: any) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="그룹에 대한 설명을 입력하세요"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 인원
                </label>
                <input
                  type="number"
                  value={newGroup.max_members || ''}
                  onChange={(e) => setNewGroup((prev: any) => ({ 
                    ...prev, 
                    max_members: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="최대 인원 (선택사항)"
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <button
                  type="submit"
                  disabled={isCreatingGroup}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isCreatingGroup ? '생성 중...' : '그룹 만들기'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGroup({
                      name: '',
                      description: '',
                      category: 'STUDY',
                      max_members: undefined,
                      thumbnail_url: '',
                    });
                  }}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 카테고리 필터 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === '' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {CATEGORIES.map(category => (
              <button
                key={category.value}
                onClick={() => handleCategoryFilter(category.value)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === category.value 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {/* 그룹 목록 */}
        {isLoadingGroups ? (
          <div className="py-20 text-center text-gray-500">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group: any) => (
              <div 
                key={group.id} 
                className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleGroupClick(group.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(group.category)}`}>
                    {getCategoryLabel(group.category)}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                    소유자: {group.owner_id}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    멤버: {group.member_count || 0}명
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoadingGroups && groups.length === 0 && (
          <div className="py-20 text-center text-gray-500">
            그룹이 없습니다.
          </div>
        )}

        {/* 그룹 상세 모달 */}
        {showGroupDetail && selectedGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedGroup.name}</h2>
                <button
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(selectedGroup.category)}`}>
                  {getCategoryLabel(selectedGroup.category)}
                </span>
              </div>
              
              {selectedGroup.description && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">설명</h3>
                  <p className="text-gray-600">{selectedGroup.description}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">멤버 ({members.length}명)</h3>
                {isLoadingMembers ? (
                  <div className="text-gray-500">불러오는 중...</div>
                ) : (
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.member_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{member.member_id}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          member.role === 'owner' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role === 'owner' ? '소유자' : '멤버'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 가입 요청 관리 */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">가입 요청 ({joinRequests.length}개)</h3>
                {isLoadingJoinRequests ? (
                  <div className="text-gray-500">불러오는 중...</div>
                ) : joinRequests.length === 0 ? (
                  <div className="text-gray-500">가입 요청이 없습니다.</div>
                ) : (
                  <div className="space-y-2">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{request.member_id}</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleApproveMember(request.member_id)}
                            className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleRejectMember(request.member_id)}
                            className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                          >
                            거절
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
