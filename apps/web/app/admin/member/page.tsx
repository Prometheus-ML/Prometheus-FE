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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faSearch, faUsers, faPlus, faUpload } from '@fortawesome/free-solid-svg-icons';

export default function AdminMemberPage() {
  const canAccessAdministrator = useAuthStore((s) => s.canAccessAdministrator);
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
  const [appliedFilters, setAppliedFilters] = useState<MemberFilters>({
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

    if (!canAccessAdministrator()) {
      alert('관리자가 아닙니다.');
      window.location.href = '/';
      return;
    }
  }, [isMounted, isAuthenticated, canAccessAdministrator]);

  // 멤버 목록 로드
  const loadMembers = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      
      const params: MemberListParams = { page, size, ...appliedFilters };
      
      const response: MemberListResponse = await getMemberList(params);
      
      setList(response.members || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Failed to load members:', error);
      setError(error.message || '멤버 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [page, size, appliedFilters, getMemberList]);

  // 페이지 변경 시 데이터 로드
  useEffect(() => {
    if (!isMounted || !isAuthenticated() || !canAccessAdministrator()) return;
    loadMembers();
  }, [isMounted, loadMembers, isAuthenticated, canAccessAdministrator]);

  // 검색 및 필터 적용
  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    setPage(1); // 첫 페이지로 이동
  }, [filters]);

  // 필터 초기화
  const clearFilters = useCallback(() => {
    const emptyFilters: MemberFilters = {
      search: '',
      grant_filter: '',
      gen_filter: '',
      status_filter: ''
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
  }, []);

  // 권한별 색상 반환
  const getGrantColor = (grant: string) => {
    const colors: Record<string, string> = {
      Root: 'bg-red-500/20 text-red-300 border-red-500/30',
      Super: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      Administrator: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      Manager: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      Member: 'bg-green-500/20 text-green-300 border-green-500/30',
    };
    return colors[grant] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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

  return (
    <div className="py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            멤버 관리
          </h1>
          <p className="text-sm text-gray-300 mt-1">프로메테우스 멤버 정보 관리</p>
        </div>
        
        <div className="flex items-center space-x-3">
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

      {/* 검색 및 필터 */}
      <GlassCard className="p-6 mb-6">
        <div className="flex gap-4 items-end">
          {/* 검색 */}
          <div className="flex-1">
            <input
              id="search"
              value={filters.search}
              onChange={(e) => setFilters((prev: MemberFilters) => ({ ...prev, search: e.target.value }))}
              type="text"
              placeholder="이름, 학교를 검색해보세요!"
              className="block w-full px-3 py-2 text-sm text-black placeholder-gray-300 focus:outline-none bg-white/20 border border-white/30 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* 권한 필터 */}
          <div className="flex-1">
            <select
              id="grant"
              value={filters.grant_filter}
              onChange={(e) => setFilters((prev: MemberFilters) => ({ ...prev, grant_filter: e.target.value }))}
              className="block w-full px-3 py-2 text-sm bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="" className="bg-gray-800 text-white">권한</option>
              <option value="Root" className="bg-gray-800 text-white">Root</option>
              <option value="Super" className="bg-gray-800 text-white">Super</option>
              <option value="Administrator" className="bg-gray-800 text-white">Administrator</option>

              <option value="Member" className="bg-gray-800 text-white">Member</option>
            </select>
          </div>

          {/* 기수 필터 */}
          <div className="flex-1">
            <select
              id="gen"
              value={filters.gen_filter}
              onChange={(e) => setFilters((prev: MemberFilters) => ({ ...prev, gen_filter: e.target.value }))}
              className="block w-full px-3 py-2 text-sm bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="" className="bg-gray-800 text-white">기수</option>
              <option value="0" className="bg-gray-800 text-white">0기</option>
              {Array.from({ length: 15 }, (_, i) => (
                <option key={i + 1} value={i + 1} className="bg-gray-800 text-white">{i + 1}기</option>
              ))}
            </select>
          </div>

          {/* 상태 필터 */}
          <div className="flex-1">
            <select
              id="status"
              value={filters.status_filter}
              onChange={(e) => setFilters((prev: MemberFilters) => ({ ...prev, status_filter: e.target.value }))}
              className="block w-full px-3 py-2 text-sm bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="" className="bg-gray-800 text-white">상태</option>
              <option value="active" className="bg-gray-800 text-white">활동기수</option>
              <option value="alumni" className="bg-gray-800 text-white">알럼나이</option>
            </select>
          </div>

          {/* 필터 초기화 버튼 */}
          <RedButton onClick={clearFilters} className="inline-flex items-center">
            <FontAwesomeIcon icon={faUndo} className="mr-2 h-4 w-4" />
            초기화
          </RedButton>

          {/* 검색 버튼 */}
          <RedButton onClick={applyFilters} className="inline-flex items-center">
            <FontAwesomeIcon icon={faSearch} className="mr-2 h-4 w-4" />
            검색
          </RedButton>
        </div>
      </GlassCard>

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
          <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        ) : (
        <GlassCard className="overflow-hidden">
          <ul className="divide-y divide-white/10">
            {list.map((member) => (
              <li 
                key={member.id} 
                className="px-4 py-4 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                onClick={() => handleMemberClick(member.id)}
              >
                <div className="flex items-center space-x-4">
                  {/* 프로필 이미지 */}
                    <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                      {member.profile_image_url && !imageErrors[member.id] ? (
                          <Image
                          src={getThumbnailUrl(member.profile_image_url, 48)}
                            alt={member.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                            onError={() => handleImageError(member.id)}
                          />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10">
                          <FontAwesomeIcon icon={faUsers} className="text-white/50 text-lg" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 멤버 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {member.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getGrantColor(member.grant)}`}>
                          {member.grant}
                        </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getGenColor(member.gen)}`}>
                        {member.gen}기
                      </span>
                      </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p className="truncate">{member.email}</p>
                      <p className="truncate">{member.school} {member.major}</p>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMember(member.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
        )}

        {/* 페이지네이션 */}
        {pages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((pageNum) => (
            <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        pageNum === page
                  ? 'bg-red-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {pageNum}
            </button>
          ))}
          </div>
        )}

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
