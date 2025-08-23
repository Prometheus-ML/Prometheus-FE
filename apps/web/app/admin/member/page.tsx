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
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import QueryBar from '../../../src/components/QueryBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUndo, 
  faSearch, 
  faUsers, 
  faPlus, 
  faUpload,
  faCircle,
  faArrowLeft,
  faDownload
} from '@fortawesome/free-solid-svg-icons';

export default function AdminMemberPage() {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  
  // Hydration 완료 상태 관리
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  const [list, setList] = useState<MemberSummaryResponse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(20);
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

  // 검색 상태 (멤버 페이지 방식)
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [selectedGrant, setSelectedGrant] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');
  const [appliedGen, setAppliedGen] = useState<string>('all');
  const [appliedGrant, setAppliedGrant] = useState<string>('all');
  const [appliedStatus, setAppliedStatus] = useState<string>('all');

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

    if (!canAccessAdministrator()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessAdministrator]);

  // 멤버 목록 로드 (멤버 페이지 방식)
  const loadMembers = useCallback(async (isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearchLoading(true);
      } else {
      setIsLoading(true);
      }
      setError('');
      
      let params: any = {
        page,
        size
      };

      // 검색어 필터 적용
      if (appliedSearchTerm.trim()) {
        params.search = appliedSearchTerm.trim();
      }

      // 기수 필터 적용 (전체가 아닐 때만)
      if (appliedGen !== 'all') {
        params.gen_filter = parseInt(appliedGen);
      }

      // 권한 필터 적용 (전체가 아닐 때만)
      if (appliedGrant !== 'all') {
        params.grant_filter = appliedGrant;
      }

      // 상태 필터 적용 (전체가 아닐 때만)
      if (appliedStatus !== 'all') {
        params.status_filter = appliedStatus;
      }
      
      const response: MemberListResponse = await getMemberList(params);
      
      setList(response.members || []);
      setTotal(response.total || 0);
      setImageErrors({});
    } catch (error: any) {
      console.error('Failed to load members:', error);
      setError(error.message || '멤버 목록을 불러오지 못했습니다.');
      setList([]);
      setTotal(0);
    } finally {
      if (isSearch) {
        setIsSearchLoading(false);
      } else {
      setIsLoading(false);
    }
    }
  }, [page, size, appliedSearchTerm, appliedGen, appliedGrant, appliedStatus, getMemberList]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) return;
    loadMembers();
  }, [isMounted, loadMembers, isAuthenticated, canAccessAdministrator]);

  // 검색 핸들러 (멤버 페이지 방식)
  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedGen(selectedGen);
    setAppliedGrant(selectedGrant);
    setAppliedStatus(selectedStatus);
    setPage(1);
    loadMembers(true);
  }, [searchTerm, selectedGen, selectedGrant, selectedStatus, loadMembers]);

  // 초기화 핸들러 (멤버 페이지 방식)
  const handleReset = useCallback(() => {
    setSearchTerm('');
    setSelectedGen('all');
    setSelectedGrant('all');
    setSelectedStatus('all');
    setAppliedSearchTerm('');
    setAppliedGen('all');
    setAppliedGrant('all');
    setAppliedStatus('all');
    setPage(1);
    loadMembers(true);
  }, [loadMembers]);

  // 권한별 색상 반환
  const getGrantColor = (grant: string) => {
    const colors: Record<string, string> = {
      root: 'bg-red-500/20 text-red-300 border-red-500/30',
      super: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      administrator: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      member: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[grant.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // 기수별 색상 반환
  const getGenColor = (gen: number) => {
    if (gen === 0) return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    
    const colors = [
      'bg-red-500/20 text-red-300 border-red-500/30',
      'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'bg-green-500/20 text-green-300 border-green-500/30',
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'bg-lime-500/20 text-lime-300 border-lime-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'bg-teal-500/20 text-teal-300 border-teal-500/30',
      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'bg-sky-500/20 text-sky-300 border-sky-500/30',
    ];
    return colors[(gen - 1) % colors.length];
  };

  // 이미지 에러 처리
  const handleImageError = (memberId: string) => {
    setImageErrors(prev => ({ ...prev, [memberId]: true }));
  };

  // 멤버 삭제
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('정말로 이 멤버를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteMember(memberId);
      await loadMembers();
      alert('멤버가 삭제되었습니다.');
    } catch (error: any) {
      console.error('Failed to delete member:', error);
      alert('멤버 삭제에 실패했습니다: ' + error.message);
    }
  };

  // 멤버 추가/수정
  const handleMemberSubmit = async (data: MemberCreateRequest | MemberUpdateRequest) => {
    try {
      if ('id' in data) {
        // 수정
        await updateMember(data.id as string, data);
        alert('멤버가 수정되었습니다.');
      } else {
        // 추가
        await createMember(data);
        alert('멤버가 추가되었습니다.');
      }
      
      await loadMembers();
      setShowAddModal(false);
      setShowDetailModal(false);
      setSelectedMember(null);
    } catch (error: any) {
      console.error('Failed to save member:', error);
      alert('멤버 저장에 실패했습니다: ' + error.message);
    }
  };

  // Excel 파일 선택
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadError(error.message || 'Excel 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  }, [excelFile, parseExcelFile, bulkCreateMembers, loadMembers]);

  // 멤버 상세 정보 로드
  const handleMemberClick = async (memberId: string) => {
    try {
      const member = await getMember(memberId);
      setSelectedMember(member);
    setShowDetailModal(true);
    } catch (error: any) {
      console.error('Failed to load member details:', error);
      alert('멤버 상세 정보를 불러오지 못했습니다.');
    }
  };

  // 유틸리티 함수들
  const getFirstLetter = useCallback((name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  }, []);

  // 페이지 이동
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const nextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  // Skeleton UI Component
  const SkeletonCard = () => (
    <div className="p-4 flex flex-col items-center animate-pulse">
      <div className="relative mb-3">
        <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
      </div>
      <div className="w-20 h-5 bg-gray-600 rounded mb-2"></div>
      <div className="w-32 h-4 bg-gray-600 rounded"></div>
    </div>
  );

  return (
    <div className="md:max-w-6xl max-w-xl mx-auto min-h-screen font-pretendard">
      {/* 헤더 */}
      <header className="mx-4 px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </button>
        <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">멤버 관리</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 멤버 정보 관리</p>
            </div>
        </div>
        
        <div className="flex items-center space-x-3">
            {/* CSV 다운로드 */}
            <RedButton
              onClick={() => {
                // CSV 다운로드 로직 - MemberCreateRequest의 모든 필드 포함
                const headers = [
                  'name', 'email', 'gen', 'school', 'major', 'student_id', 'birthdate', 
                  'phone', 'gender', 'grant', 'status', 'profile_image_url', 'activity_start_date', 
                  'github', 'notion', 'figma', 'kakao_id', 'instagram_id', 'mbti', 
                  'self_introduction', 'additional_career', 'coffee_chat_enabled', 
                  'active_gens', 'history'
                ];
                
                // 예시 데이터 (첫 번째 행) - MemberCreateRequest의 모든 필드
                const exampleData = [
                  '홍길동',
                  'hong@example.com',
                  '5',
                  '프메대학교',
                  '인공지능학과',
                  '21',
                  '2000-01-01',
                  '010-1234-5678',
                  '남성',
                  'member',
                  'active',
                  'https://example.com/profile.jpg',
                  '2024-03-01',
                  'https://github.com/honggildong',
                  'https://notion.so/honggildong',
                  'https://figma.com/honggildong',
                  'honggildong',
                  'honggildong_ai',
                  'ENFP',
                  '안녕하세요! 저는 AI에 관심이 많은 학생입니다. 다양한 프로젝트를 통해 실력을 키우고 싶습니다.',
                  'AI 스터디 그룹 리더, 웹 개발 프로젝트 참여, 해커톤 수상 경험',
                  'true',
                  '3;4;5',
                  'AI 챗봇 개발;웹 애플리케이션 프로젝트;머신러닝 스터디'
                ];
                
                const csvContent = [
                  headers.join(','),
                  exampleData.map(field => `"${field}"`).join(',')
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `members_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="inline-flex items-center"
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
              CSV 다운로드
            </RedButton>

          {/* Excel 업로드 */}
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <RedButton
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center"
            >
              <FontAwesomeIcon icon={faUpload} className="mr-2 h-4 w-4" />
              CSV 업로드
            </RedButton>
            
            {excelFile && (
              <RedButton
                onClick={handleExcelUpload}
                disabled={isUploading}
                className="inline-flex items-center"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                )}
                {isUploading ? '업로드 중...' : '대량 추가'}
              </RedButton>
            )}
          </div>

          <RedButton
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            멤버 추가
          </RedButton>
        </div>
      </div>
      </header>

      <div className="px-4 py-6">
      {/* 검색 및 필터 */}
        <div className="mb-6 space-y-4">
          <QueryBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selects={[
              {
                id: 'gen',
                value: selectedGen,
                onChange: setSelectedGen,
                options: [
                  { value: 'all', label: '전체 기수' },
                  { value: '0', label: '창립멤버' },
                  ...Array.from({ length: 15 }, (_, i) => i + 1).map(gen => ({
                    value: gen.toString(),
                    label: `${gen}기`
                  }))
                ]
              },
              {
                id: 'grant',
                value: selectedGrant,
                onChange: setSelectedGrant,
                options: [
                  { value: 'all', label: '전체 권한' },
                  { value: 'root', label: 'Root' },
                  { value: 'super', label: 'Super' },
                  { value: 'administrator', label: 'Administrator' },
                  { value: 'member', label: 'Member' }
                ]
              },
              {
                id: 'status',
                value: selectedStatus,
                onChange: setSelectedStatus,
                options: [
                  { value: 'all', label: '전체 상태' },
                  { value: 'active', label: '활동중' },
                  { value: 'alumni', label: '알럼나이' }
                ]
              }
            ]}
            onSearch={handleSearch}
            onReset={handleReset}
            isLoading={isSearchLoading}
              placeholder="이름, 학교를 검색해보세요!"
            />
          </div>

      {/* Excel 업로드 에러 메시지 */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
          {uploadError}
            </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400">
          {error}
        </div>
      )}

      {/* 멤버 목록 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} className="animate-pulse">
                <SkeletonCard />
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((member) => (
              <GlassCard
                key={member.id} 
                className="relative p-4 text-center transition-transform duration-200 hover:scale-105 cursor-pointer"
                onClick={() => handleMemberClick(member.id)}
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                      {member.profile_image_url && !imageErrors[member.id] ? (
                      <div className="relative w-16 h-16">
                          <Image
                          src={getThumbnailUrl(member.profile_image_url, 128)}
                            alt={member.name}
                          fill
                          className="rounded-full object-cover"
                            onError={() => handleImageError(member.id)}
                          unoptimized
                          />
                      </div>
                      ) : (
                      <div className="w-16 h-16 rounded-full bg-[#404040] flex items-center justify-center text-[#e0e0e0] font-medium">
                        {getFirstLetter(member.name)}
                        </div>
                      )}
                    </div>
                  
                  {/* 이름 */}
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">{member.name}</h3>
                  
                  {/* 권한과 기수 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 ${getGrantColor(member.grant)}`}>
                          {member.grant}
                        </span>
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 ${getGenColor(member.gen)}`}>
                      {member.gen === 0 ? '창립멤버' : `${member.gen}기`}
                      </span>
                      </div>
                  
                  {/* 학력사항 */}
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {member.school && (
                      <span className="px-0.5 py-0.5 text-[#e0e0e0] text-xs rounded-full">
                        {member.school}
                      </span>
                    )}
                    {member.major && (
                      <span className="py-0.5 text-[#e0e0e0] text-xs rounded-full">
                        {member.major}
                      </span>
                    )}
                  </div>

                  {/* 삭제 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMember(member.id);
                      }}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                    >
                      삭제
                    </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {!isLoading && !isSearchLoading && list.length === 0 && (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">멤버가 없습니다.</h3>
                  </div>
                </div>
        )}

        {/* 페이지네이션 */}
        {pages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <RedButton onClick={prevPage} disabled={page === 1} className="px-3 py-1 text-sm disabled:opacity-50">
              이전
            </RedButton>
            <span className="text-sm text-[#FFFFFF]">
              {page} / {pages}
            </span>
            <RedButton onClick={nextPage} disabled={page === pages} className="px-3 py-1 text-sm disabled:opacity-50">
              다음
            </RedButton>
          </div>
        )}
      </div>

      {/* 모달들 */}
      <MemberModal
        isOpen={showAddModal}
        member={null}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleMemberSubmit}
      />

      <MemberModal
        isOpen={showDetailModal}
        member={selectedMember}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMember(null);
        }}
        onSubmit={handleMemberSubmit}
        onDelete={selectedMember ? () => handleDeleteMember(selectedMember.id) : undefined}
      />
    </div>
  );
}
