"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useMember } from '@prometheus-fe/hooks';
import { 
  MemberResponse, 
  MemberSummaryResponse, 
  MemberFilters, 
  MemberListParams, 
  MemberListResponse,
  MemberListRequest,
  MemberCreateRequest,
  MemberUpdateRequest
} from '@prometheus-fe/types';
import MemberModal from '../../../src/components/MemberModal';




export default function AdminMemberPage() {
  const canAccessManager = useAuthStore((s) => s.canAccessManager);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  const [list, setList] = useState<MemberSummaryResponse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(20);
  const [filters, setFilters] = useState<MemberFilters>({
    search: '',
    grant_filter: '',
    gen_filter: '',
    status_filter: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const pages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // useImage 훅 사용
  const { getThumbnailUrl, getDefaultImageUrl } = useImage();
  
  // useMember 훅 사용
  const { 
    getMemberList, 
    getMember,
    deleteMember, 
    createMember, 
    updateMember,
    bulkCreateMembers 
  } = useMember();

  // Excel 업로드 관련 상태
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  // 모달 상태
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(null);

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

  // 멤버 목록 로드
  const loadMembers = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      
      const params: MemberListParams = { page, size, ...filters };
      
      // MemberListRequest로 변환 (gen_filter를 number로 변환)
      const apiParams: Partial<MemberListRequest> = {};
      
      if (params.page !== undefined) apiParams.page = params.page;
      if (params.size !== undefined) apiParams.size = params.size;
      if (params.search && params.search.trim() !== '') apiParams.search = params.search;
      if (params.grant_filter && params.grant_filter !== '') apiParams.grant_filter = params.grant_filter;
      if (params.gen_filter && params.gen_filter !== '') apiParams.gen_filter = parseInt(params.gen_filter);
      if (params.status_filter && params.status_filter !== '') apiParams.status_filter = params.status_filter;
      
      const response: MemberListResponse = await getMemberList(apiParams);
      const members = response.members ?? [];
      setList(members);
      setTotal(response.total ?? members.length);
      setImageErrors({});
    } catch (error) {
      console.error('Failed to load members:', error);
      setError('멤버 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [page, size, filters, getMemberList]);

  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessManager()) return;
    loadMembers();
  }, [isMounted, loadMembers, isAuthenticated, canAccessManager]);

  // 유틸리티 함수들
  const getGrantClass = useCallback((grant: string): string => {
    const classes: Record<string, string> = {
      'Root': 'bg-red-100 text-red-800',
      'Super': 'bg-red-100 text-red-800',
      'Administrator': 'bg-purple-100 text-purple-800',
      'Manager': 'bg-blue-100 text-blue-800',
      'Member': 'bg-green-100 text-green-800'
    };
    return classes[grant] ?? 'bg-gray-100 text-gray-800';
  }, []);

  const handleImageError = useCallback((memberId: string): void => {
    setImageErrors(prev => ({ ...prev, [memberId]: true }));
  }, []);

  const visiblePages = useMemo(() => {
    const pagesArray = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);
    
    for (let i = start; i <= end; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }, [page, pages]);

  // 필터 함수들
  const applyFilters = useCallback((): void => {
    setPage(1);
    loadMembers();
  }, [loadMembers]);

  const clearFilters = useCallback((): void => {
    setFilters({ search: '', grant_filter: '', gen_filter: '', status_filter: '' });
    setPage(1);
  }, []);

  // Excel 관련 함수들
  const downloadExcelTemplate = useCallback((): void => {
    const headers = [
      'name', 'email', 'gen', 'school', 'major', 'student_id', 
      'birthdate', 'phone', 'gender', 'github', 'notion', 'figma', 'kakao_id', 
      'instagram_id', 'mbti', 'self_introduction', 'additional_career', 
      'coffee_chat_enabled', 'active_gens', 'history', 'grant', 'status',
      'profile_image_url', 'activity_start_date'
    ];
    
    const sampleData = [
      '홍길동', 'hong@example.com', '1', '서울대학교', '컴퓨터공학부',
      '2020123456', '2000-01-01', '010-1234-5678', '남성', 'https://github.com/hong', 
      'https://notion.so/hong', 'https://figma.com/hong', 'hong_kakao', 
      'hong_instagram', 'ENFP', '안녕하세요!', '프로젝트 경험', 'true', 
      '1,2,3', '프로젝트A,프로젝트B', 'Member', 'active', 
      'https://example.com/image.jpg', '2023-01-01'
    ];
    
    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'member_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setExcelFile(file);
      setUploadError('');
    } else {
      alert('CSV 파일만 업로드 가능합니다.');
      if (event.target) event.target.value = '';
    }
  }, []);

  const parseExcelFile = useCallback((file: File): Promise<MemberCreateRequest[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const members = [];
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',').map(v => v.trim());
            const member: any = {};
            
            headers.forEach((header, index) => {
              let value: any = values[index] || '';
              
              if (header === 'gen' || header === 'student_id') {
                value = parseInt(value) || 0;
              } else if (header === 'coffee_chat_enabled') {
                value = value.toLowerCase() === 'true';
              } else if (header === 'active_gens') {
                value = value ? value.split(',').map((g: string) => parseInt(g.trim())).filter((g: number) => !isNaN(g)) : [];
              } else if (header === 'history') {
                value = value ? value.split(',').map((h: string) => h.trim()).filter((h: string) => h !== '') : [];
              } else if (header === 'birthdate' || header === 'activity_start_date') {
                if (value && value.trim() !== '') {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    value = date.toISOString().split('T')[0];
                  } else {
                    value = null;
                  }
                } else {
                  value = null;
                }
              }
              
              member[header] = value;
            });
            
            if (member.name && member.email) {
              members.push(member);
            }
          }
          
          resolve(members);
        } catch (error) {
          reject(new Error('CSV 파일 파싱 중 오류가 발생했습니다.'));
        }
      };
      
      reader.onerror = () => reject(new Error('파일 읽기 중 오류가 발생했습니다.'));
      reader.readAsText(file);
    });
  }, []);

  const handleExcelUpload = useCallback(async (): Promise<void> => {
    if (!excelFile) {
      alert('파일을 선택해주세요.');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError('');
      
      const members = await parseExcelFile(excelFile);
      
      if (members.length === 0) {
        alert('유효한 멤버 데이터가 없습니다.');
        return;
      }
      
      if (!confirm(`${members.length}명의 멤버를 추가하시겠습니까?`)) {
        return;
      }
      
      // 대량 멤버 생성
      await bulkCreateMembers({ members });
      
      await loadMembers();
      setExcelFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      alert(`${members.length}명의 멤버가 성공적으로 추가되었습니다.`);
    } catch (error: any) {
      console.error('Excel upload error:', error);
      const errorMessage = error.message || '파일 업로드 중 오류가 발생했습니다.';
      setUploadError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [excelFile, parseExcelFile, bulkCreateMembers, loadMembers]);

  // 모달 관련 함수들
  const viewMember = useCallback(async (member: MemberSummaryResponse): Promise<void> => {
    try {
      // 멤버 상세 정보 조회
      const memberDetail = await getMember(member.id);
      setSelectedMember(memberDetail);
    setShowDetailModal(true);
    } catch (error) {
      console.error('멤버 상세 정보 조회 실패:', error);
      alert('멤버 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, [getMember]);

  const handleModalClose = useCallback((): void => {
    setShowDetailModal(false);
    setSelectedMember(null);
  }, []);

  const handleAddModalClose = useCallback((): void => {
    setShowAddModal(false);
  }, []);

  const handleMemberSubmit = useCallback(async (memberData: MemberCreateRequest | MemberUpdateRequest): Promise<void> => {
    try {
      if (selectedMember) {
        await updateMember(selectedMember.id, memberData as MemberUpdateRequest);
      } else {
        await createMember(memberData as MemberCreateRequest);
      }
      await loadMembers();
      handleModalClose();
      handleAddModalClose();
    } catch (error) {
      console.error('멤버 저장 실패:', error);
      alert('멤버 저장에 실패했습니다.');
    }
  }, [selectedMember, updateMember, createMember, loadMembers, handleModalClose, handleAddModalClose]);

  const handleMemberDelete = useCallback(async (member: MemberResponse): Promise<void> => {
    try {
      await deleteMember(member.id);
      await loadMembers();
      handleModalClose();
    } catch (error) {
      console.error('멤버 삭제 실패:', error);
      alert('멤버 삭제에 실패했습니다.');
    }
  }, [deleteMember, loadMembers, handleModalClose]);

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
    <div className="py-6">
      {/* 기능 버튼들 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={downloadExcelTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel 템플릿
            </button>

            {/* Excel 업로드 섹션 */}
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                파일 선택
              </button>
              {excelFile && (
                <span className="text-sm text-gray-600">
                  {excelFile.name}
                </span>
              )}
              {excelFile && (
                <button
                  onClick={handleExcelUpload}
                  disabled={isUploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  {isUploading ? '업로드 중...' : '대량 추가'}
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              멤버 추가
            </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 검색 */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-white">검색</label>
            <input
              id="search"
              value={filters.search}
              onChange={(e) => setFilters((prev: MemberFilters) => ({ ...prev, search: e.target.value }))}
              type="text"
              placeholder="이름, 이메일, 학번"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* 권한 필터 */}
          <div>
            <label htmlFor="grant" className="block text-sm font-medium text-white">권한</label>
            <select
              id="grant"
              value={filters.grant_filter}
              onChange={(e) => setFilters((prev: MemberFilters) => ({ ...prev, grant_filter: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">전체</option>
              <option value="Root">Root</option>
              <option value="Super">Super</option>
              <option value="Administrator">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="Member">Member</option>
            </select>
          </div>

          {/* 기수 필터 */}
          <div>
            <label htmlFor="gen" className="block text-sm font-medium text-white">기수</label>
            <select
              id="gen"
              value={filters.gen_filter}
              onChange={(e) => setFilters((prev: MemberFilters) => ({ ...prev, gen_filter: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">전체</option>
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}기</option>
              ))}
            </select>
          </div>

          {/* 상태 필터 */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-white">상태</label>
            <select
              id="status"
              value={filters.status_filter}
              onChange={(e) => setFilters((prev: MemberFilters) => ({ ...prev, status_filter: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">전체</option>
              <option value="active">활동기수</option>
              <option value="alumni">알럼나이</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            필터 초기화
          </button>
          <button
            onClick={applyFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            검색
          </button>
        </div>
      </div>

      {/* Excel 업로드 에러 메시지 */}
      {uploadError && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Excel 업로드 오류</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{uploadError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 목록 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : error ? (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">오류 발생</h3>
              <p className="mt-1 text-sm text-gray-300">{error}</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {list.map((member) => (
              <li key={member.id} className="px-4 py-4 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0" onClick={() => viewMember(member)}>
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
                            unoptimized // useImage로 이미 최적화된 이미지이므로
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">{member.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGrantClass(member.grant)}`}>
                          {member.grant}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{member.email}</p>
                      <p className="text-sm text-gray-300">
                        {member.gen}기 · {member.school} {member.major}
                        {member.gender && ` · ${member.gender}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewMember(member);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 */}
        {pages > 1 && (
          <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-t border-white/10">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20"
              >
                이전
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  <span className="font-medium">{(page - 1) * size + 1}</span>
                  에서
                  <span className="font-medium">{Math.min(page * size, total)}</span>
                  까지
                  <span className="font-medium">{total}</span>
                  중
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/30 bg-white/10 text-sm font-medium text-white hover:bg-white/20"
                  >
                    이전
                  </button>
                  {visiblePages.map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === page
                          ? 'z-10 bg-red-500 border-red-500 text-white'
                          : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-white/30 bg-white/10 text-sm font-medium text-white hover:bg-white/20"
                  >
                    다음
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 멤버 추가 모달 */}
      <MemberModal
        isOpen={showAddModal}
        member={null}
        onClose={handleAddModalClose}
        onSubmit={handleMemberSubmit}
      />

      {/* 멤버 상세보기 모달 */}
      <MemberModal
        isOpen={showDetailModal}
        member={selectedMember}
        onClose={handleModalClose}
        onSubmit={handleMemberSubmit}
        onDelete={handleMemberDelete}
      />
    </div>
  );
}
