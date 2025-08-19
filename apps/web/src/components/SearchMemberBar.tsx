'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMember } from '@prometheus-fe/hooks';
import { MemberSummaryResponse } from '@prometheus-fe/types';

interface SearchMemberBarProps {
  onMemberSelect?: (member: MemberSummaryResponse) => void;
  onMemberDeselect?: () => void;
  placeholder?: string;
  className?: string;
  showSelectedMember?: boolean;
  allowMultiple?: boolean;
  selectedMembers?: MemberSummaryResponse[];
  onMultipleSelect?: (members: MemberSummaryResponse[]) => void;
}

export const SearchMemberBar: React.FC<SearchMemberBarProps> = ({
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

export default SearchMemberBar;
