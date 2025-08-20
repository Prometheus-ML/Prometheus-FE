'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMember } from '@prometheus-fe/hooks';
import { MemberSummaryResponse } from '@prometheus-fe/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faRotateLeft 
} from '@fortawesome/free-solid-svg-icons';

// TabBar 컴포넌트를 SearchMemberBar에 통합
interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabBar: React.FC<TabBarProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '' 
}) => {
  return (
    <div className={`border-b border-white/20 ${className}`}>
      <div className="flex w-full overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// 기존 SearchMemberBar를 MemberSelector로 변경
interface MemberSelectorProps {
  onMemberSelect?: (member: MemberSummaryResponse) => void;
  onMemberDeselect?: () => void;
  placeholder?: string;
  className?: string;
  showSelectedMember?: boolean;
  allowMultiple?: boolean;
  selectedMembers?: MemberSummaryResponse[];
  onMultipleSelect?: (members: MemberSummaryResponse[]) => void;
}

export const MemberSelector: React.FC<MemberSelectorProps> = ({
  onMemberSelect,
  onMemberDeselect,
  placeholder = "멤버를 검색하세요...",
  className = "",
  showSelectedMember = true,
  allowMultiple = false,
  selectedMembers = [],
  onMultipleSelect,
}) => {
  const { members, getMemberList, isLoadingMembers } = useMember();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<MemberSummaryResponse[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberSummaryResponse | null>(null);

  // 검색어 변경 시 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers([]);
      setIsDropdownOpen(false);
      return;
    }

    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.major?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredMembers(filtered);
    setIsDropdownOpen(filtered.length > 0);
  }, [searchTerm, members]);

  // 컴포넌트 마운트 시 멤버 목록 로드
  useEffect(() => {
    getMemberList();
  }, [getMemberList]);

  // 멤버 선택 핸들러
  const handleMemberSelect = useCallback((member: MemberSummaryResponse) => {
    if (allowMultiple) {
      // 다중 선택 모드
      const isAlreadySelected = selectedMembers.some(m => m.id === member.id);
      let newSelectedMembers: MemberSummaryResponse[];
      
      if (isAlreadySelected) {
        // 이미 선택된 멤버라면 제거
        newSelectedMembers = selectedMembers.filter(m => m.id !== member.id);
      } else {
        // 새로운 멤버 추가
        newSelectedMembers = [...selectedMembers, member];
      }
      
      onMultipleSelect?.(newSelectedMembers);
    } else {
      // 단일 선택 모드
      setSelectedMember(member);
      onMemberSelect?.(member);
    }
    
    setSearchTerm('');
    setIsDropdownOpen(false);
  }, [allowMultiple, selectedMembers, onMultipleSelect, onMemberSelect]);

  // 멤버 선택 해제 핸들러
  const handleMemberDeselect = useCallback(() => {
    setSelectedMember(null);
    onMemberDeselect?.();
  }, [onMemberDeselect]);

  // 검색어 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // 검색바 포커스 핸들러
  const handleFocus = () => {
    if (searchTerm.trim() && filteredMembers.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  // 검색바 블러 핸들러
  const handleBlur = () => {
    // 드롭다운 클릭을 위해 약간의 지연
    setTimeout(() => setIsDropdownOpen(false), 200);
  };

  // 선택된 멤버 제거 (다중 선택 모드)
  const removeSelectedMember = (memberId: string) => {
    if (onMultipleSelect) {
      const newSelectedMembers = selectedMembers.filter(m => m.id !== memberId);
      onMultipleSelect(newSelectedMembers);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 검색 입력창 */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoadingMembers}
        />
        {isLoadingMembers && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredMembers.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">
              검색 결과가 없습니다.
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => handleMemberSelect(member)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{member.name}</div>
                      {member.gen !== null && member.gen !== undefined && (
                        <span className="text-xs bg-blue-500/20 text-blue-600 border border-blue-500/30 px-1.5 py-0.5 rounded">
                          {member.gen}기
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.email && `${member.email}`}
                      {member.school && ` • ${member.school}`}
                      {member.major && ` • ${member.major}`}
                    </div>
                  </div>
                  {allowMultiple && selectedMembers.some(m => m.id === member.id) && (
                    <div className="text-blue-500 text-sm">✓ 선택됨</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 선택된 멤버 표시 */}
      {showSelectedMember && (
        <>
          {/* 단일 선택 모드 */}
          {!allowMultiple && selectedMember && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-blue-900">{selectedMember.name}</div>
                    {selectedMember.gen !== null && selectedMember.gen !== undefined && (
                      <span className="text-xs bg-blue-500/30 text-blue-700 border border-blue-500/40 px-1.5 py-0.5 rounded">
                        {selectedMember.gen}기
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-blue-600">
                    {selectedMember.email && `${selectedMember.email}`}
                    {selectedMember.school && ` • ${selectedMember.school}`}
                    {selectedMember.major && ` • ${selectedMember.major}`}
                  </div>
                </div>
                <button
                  onClick={handleMemberDeselect}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  제거
                </button>
              </div>
            </div>
          )}

          {/* 다중 선택 모드 */}
          {allowMultiple && selectedMembers.length > 0 && (
            <div className="mt-2 space-y-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-blue-900">{member.name}</div>
                        {member.gen !== null && member.gen !== undefined && (
                          <span className="text-xs bg-blue-500/30 text-blue-700 border border-blue-500/40 px-1.5 py-0.5 rounded">
                            {member.gen}기
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-blue-600">
                        {member.email && `${member.email}`}
                        {member.school && ` • ${member.school}`}
                        {member.major && ` • ${member.major}`}
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelectedMember(member.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      제거
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// 새로운 SearchBar 컴포넌트 (TabBar 통합)
interface SearchBarProps {
  // 검색어
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  
  // 탭 필터링
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  
  // select 옵션들
  selects: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
  }[];
  
  // 버튼 핸들러
  onSearch?: () => void;
  onReset?: () => void;
  
  // 로딩 상태
  isLoading?: boolean;
  
  // 기타 props
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchTermChange,
  tabs,
  activeTab,
  onTabChange,
  selects,
  onSearch,
  onReset,
  isLoading = false,
  className = "",
  placeholder = "이름, 학교를 검색해보세요",
  disabled = false,
}) => {
  // 검색어 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(e.target.value);
  };

  // 초기화 핸들러
  const handleReset = () => {
    onSearchTermChange('');
    selects.forEach(select => {
      select.onChange('all');
    });
    if (tabs && onTabChange) {
      onTabChange(tabs[0]?.id || '');
    }
    onReset?.();
  };

  // 탭 변경 핸들러 (기존 필터에 추가)
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    onSearch?.();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 탭 필터링 (최상단) */}
      {tabs && activeTab && onTabChange && (
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mb-4"
        />
      )}

      {/* 검색 입력창 (윗줄) */}
      <div className="relative">
        <FontAwesomeIcon 
          icon={faSearch} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e0e0e0] w-4 h-4" 
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full border border-[#404040] rounded-md px-10 py-3 bg-[#1A1A1A] text-[#FFFFFF] placeholder-[#e0e0e0] focus:border-[#c2402a] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Select 필터들 (아랫줄) */}
      <div className="grid grid-cols-12 gap-3">
        {/* Select 필터들 */}
        <div className={`${selects.length > 0 ? 'col-span-10' : 'col-span-12'} flex gap-3`}>
          {selects.map((select, index) => (
            <select
              key={select.id}
              value={select.value}
              onChange={(e) => select.onChange(e.target.value)}
              disabled={disabled}
              className="flex-1 border border-[#404040] rounded-md px-3 py-2 bg-[#1A1A1A] text-[#FFFFFF] focus:border-[#c2402a] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>

        {/* 버튼들 (row-span-2) */}
        {selects.length > 0 && (
          <div className="col-span-2 flex gap-2">
            <button
              onClick={handleReset}
              disabled={disabled}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-[#404040] rounded-md bg-[#1A1A1A] text-[#e0e0e0] hover:bg-[#2A2A2A] hover:border-[#c2402a] focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="초기화"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="w-4 h-4" />
            </button>
            <button
              onClick={handleSearch}
              disabled={disabled || isLoading}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md bg-[#c2402a] text-white hover:bg-[#a03020] focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="검색"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* 로딩 상태 표시 (검색바 아래) */}
      {isLoading && (
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded animate-pulse"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-1/2"></div>
        </div>
      )}
    </div>
  );
};

// TabBar export 추가
export { TabBar };

// 기존 export 유지
export default SearchBar;
