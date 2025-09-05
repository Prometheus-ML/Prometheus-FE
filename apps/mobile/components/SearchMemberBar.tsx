'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useMember } from '@prometheus-fe/hooks';
import { MemberSummaryResponse } from '@prometheus-fe/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

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
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
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

  // 멤버 아이템 렌더링
  const renderMemberItem = ({ item }: { item: MemberSummaryResponse }) => (
    <TouchableOpacity
      onPress={() => handleMemberSelect(item)}
      className="px-4 py-3 border-b border-white/10"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-medium text-white text-base">{item.name}</Text>
            {item.gen !== null && item.gen !== undefined && (
              <View className="ml-2 px-2 py-1 rounded" style={{ backgroundColor: '#3B82F620' }}>
                <Text className="text-xs text-blue-400">
                  {item.gen}기
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-300">
            {item.email && `${item.email}`}
            {item.school && ` • ${item.school}`}
            {item.major && ` • ${item.major}`}
          </Text>
        </View>
        {allowMultiple && selectedMembers.some(m => m.id === item.id) && (
          <Text className="text-blue-400 text-sm">✓ 선택됨</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className={`relative ${className}`}>
      {/* 검색 입력창 */}
      <View className="relative">
        <View className="flex-row items-center bg-white/10 border border-white/20 rounded-lg px-4 py-3">
          <FontAwesomeIcon 
            icon={faSearch} 
            color="rgba(255,255,255,0.5)" 
          />
          <TextInput
            className="flex-1 text-white ml-3"
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchTerm}
            onChangeText={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!isLoadingMembers}
          />
          {isLoadingMembers && (
            <View className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          )}
        </View>
      </View>

      {/* 검색 결과 드롭다운 */}
      {isDropdownOpen && (
        <View className="absolute z-10 w-full mt-1 bg-white/10 border border-white/20 rounded-lg max-h-60">
          {filteredMembers.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-gray-400 text-sm text-center">검색 결과가 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMembers}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          )}
        </View>
      )}

      {/* 선택된 멤버 표시 */}
      {showSelectedMember && (
        <>
          {/* 단일 선택 모드 */}
          {!allowMultiple && selectedMember && (
            <View className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-medium text-blue-200 text-base">{selectedMember.name}</Text>
                    {selectedMember.gen !== null && selectedMember.gen !== undefined && (
                      <View className="ml-2 px-2 py-1 rounded" style={{ backgroundColor: '#3B82F640' }}>
                        <Text className="text-xs text-blue-300">
                          {selectedMember.gen}기
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-blue-300">
                    {selectedMember.email && `${selectedMember.email}`}
                    {selectedMember.school && ` • ${selectedMember.school}`}
                    {selectedMember.major && ` • ${selectedMember.major}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleMemberDeselect}
                  className="p-2"
                >
                  <FontAwesomeIcon icon={faTimes} color="#60A5FA" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 다중 선택 모드 */}
          {allowMultiple && selectedMembers.length > 0 && (
            <View className="mt-3 space-y-2">
              {selectedMembers.map((member) => (
                <View
                  key={member.id}
                  className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="font-medium text-blue-200 text-base">{member.name}</Text>
                        {member.gen !== null && member.gen !== undefined && (
                          <View className="ml-2 px-2 py-1 rounded" style={{ backgroundColor: '#3B82F640' }}>
                            <Text className="text-xs text-blue-300">
                              {member.gen}기
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-blue-300">
                        {member.email && `${member.email}`}
                        {member.school && ` • ${member.school}`}
                        {member.major && ` • ${member.major}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeSelectedMember(member.id)}
                      className="p-2"
                    >
                      <FontAwesomeIcon icon={faTimes} color="#60A5FA" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

// 멤버 검색 전용 컴포넌트
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
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
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

  // 멤버 아이템 렌더링
  const renderMemberItem = ({ item }: { item: MemberSummaryResponse }) => (
    <TouchableOpacity
      onPress={() => handleMemberSelect(item)}
      className="px-4 py-3 border-b border-white/10"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-medium text-white text-base">{item.name}</Text>
            {item.gen !== null && item.gen !== undefined && (
              <View className="ml-2 px-2 py-1 rounded" style={{ backgroundColor: '#3B82F620' }}>
                <Text className="text-xs text-blue-400">
                  {item.gen}기
                </Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-300">
            {item.email && `${item.email}`}
            {item.school && ` • ${item.school}`}
            {item.major && ` • ${item.major}`}
          </Text>
        </View>
        {allowMultiple && selectedMembers.some(m => m.id === item.id) && (
          <Text className="text-blue-400 text-sm">✓ 선택됨</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className={`relative ${className}`}>
      {/* 검색 입력창 */}
      <View className="relative">
        <View className="flex-row items-center bg-white/10 border border-white/20 rounded-lg px-4 py-3">
          <FontAwesomeIcon 
            icon={faSearch} 
            color="rgba(255,255,255,0.5)" 
          />
          <TextInput
            className="flex-1 text-white ml-3"
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchTerm}
            onChangeText={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!isLoadingMembers}
          />
          {isLoadingMembers && (
            <View className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          )}
        </View>
      </View>

      {/* 검색 결과 드롭다운 */}
      {isDropdownOpen && (
        <View className="absolute z-10 w-full mt-1 bg-white/10 border border-white/20 rounded-lg max-h-60">
          {filteredMembers.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-gray-400 text-sm text-center">검색 결과가 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredMembers}
              renderItem={renderMemberItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              maxToRenderPerBatch={10}
              windowSize={10}
            />
          )}
        </View>
      )}

      {/* 선택된 멤버 표시 */}
      {showSelectedMember && (
        <>
          {/* 단일 선택 모드 */}
          {!allowMultiple && selectedMember && (
            <View className="mt-3 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-medium text-blue-200 text-base">{selectedMember.name}</Text>
                    {selectedMember.gen !== null && selectedMember.gen !== undefined && (
                      <View className="ml-2 px-2 py-1 rounded" style={{ backgroundColor: '#3B82F640' }}>
                        <Text className="text-xs text-blue-300">
                          {selectedMember.gen}기
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm text-blue-300">
                    {selectedMember.email && `${selectedMember.email}`}
                    {selectedMember.school && ` • ${selectedMember.school}`}
                    {selectedMember.major && ` • ${selectedMember.major}`}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleMemberDeselect}
                  className="p-2"
                >
                  <FontAwesomeIcon icon={faTimes} color="#60A5FA" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 다중 선택 모드 */}
          {allowMultiple && selectedMembers.length > 0 && (
            <View className="mt-3 space-y-2">
              {selectedMembers.map((member) => (
                <View
                  key={member.id}
                  className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="font-medium text-blue-200 text-base">{member.name}</Text>
                        {member.gen !== null && member.gen !== undefined && (
                          <View className="ml-2 px-2 py-1 rounded" style={{ backgroundColor: '#3B82F640' }}>
                            <Text className="text-xs text-blue-300">
                              {member.gen}기
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-blue-300">
                        {member.email && `${member.email}`}
                        {member.school && ` • ${member.school}`}
                        {member.major && ` • ${member.major}`}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeSelectedMember(member.id)}
                      className="p-2"
                    >
                      <FontAwesomeIcon icon={faTimes} color="#60A5FA" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

// 기본 export
export default SearchMemberBar;
