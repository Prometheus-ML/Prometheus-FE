import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@prometheus-fe/stores';
import { useMember, useImage } from '@prometheus-fe/hooks';
import { 
  MemberDetailResponse,
  MemberPublicListItem,
  MemberPrivateListItem
} from '@prometheus-fe/types';
import { Ionicons } from '@expo/vector-icons';
import MemberModal from '../components/members/MemberModal';

// 화면 크기 변화에 대응하는 동적 계산
const [screenData, setScreenData] = useState(() => {
  const { width } = Dimensions.get('window');
  const horizontalPadding = 24 * 2; // 양쪽 패딩
  const cardGap = 6; // 카드 간 간격
  const columns = 3; // 항상 3열
  const availableWidth = width - horizontalPadding - (cardGap * (columns - 1));
  const cardWidth = Math.floor(availableWidth / columns);
  
  return { width, cardWidth, columns };
});

export default function MemberScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getPublicMembers, getPrivateMembers, getMemberDetail, isLoadingMembers, isLoadingMember } = useMember();
  const { getThumbnailUrl } = useImage();

  // 상태 관리
  const [members, setMembers] = useState<(MemberPublicListItem | MemberPrivateListItem)[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalAll, setTotalAll] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(21);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');
  const [appliedGen, setAppliedGen] = useState<string>('all');
  const [appliedStatus, setAppliedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // 모달 상태
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<MemberDetailResponse | null>(null);

  // 계산된 값들
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);
  const isPrivate = useMemo(() => !!user, [user]);
  
  // 현재 기수 계산 (2022년 3월부터 6개월 단위)
  const getCurrentGen = useCallback(() => {
    const startDate = new Date('2022-03-01');
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return Math.floor(monthsDiff / 6) + 1;
  }, []);
  
  // 기수별 옵션 생성
  const genOptions = useMemo(() => {
    const currentGen = getCurrentGen();
    const options = [{ value: 'all', label: '전체 기수' }];
    
    // 최신 기수부터 1기까지 (내림차순)
    for (let i = currentGen; i >= 1; i--) {
      options.push({
        value: i.toString(),
        label: `${i}기`
      });
    }
    
    // 0기(창립멤버) 추가
    options.push({
      value: '0',
      label: '창립멤버'
    });
    
    return options;
  }, [getCurrentGen]);

  // 유틸리티 함수들
  const getFirstLetter = useCallback((name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  }, []);

  const handleImageError = useCallback((memberId: string) => {
    setImageErrors(prev => ({ ...prev, [memberId]: true }));
  }, []);

  // 전체 멤버 수 조회 (필터링과 무관)
  const fetchTotalCount = useCallback(async () => {
    try {
      let params: any = { page: 1, size: 1 }; // 최소한의 데이터만 요청
      let response;
      if (isPrivate) {
        response = await getPrivateMembers(params);
      } else {
        response = await getPublicMembers(params);
      }
      setTotalAll(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch total count:', err);
      setTotalAll(0);
    }
  }, [isPrivate, getPublicMembers, getPrivateMembers]);

  // 사용자 목록 조회
  const fetchMembers = useCallback(async (isSearch = false, isRefresh = false) => {
    try {
      if (isSearch) {
        setIsSearchLoading(true);
      } else if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      let params: any = {
        page: isRefresh ? 1 : page,
        size
      };

      // 검색어 필터 적용
      if (appliedSearchTerm.trim()) {
        params.search = appliedSearchTerm.trim();
      }

      // 기수 필터 적용 (전체가 아닐 때만)
      if (appliedGen !== 'all') {
        params.gen = parseInt(appliedGen);
      }

      // 상태 필터 적용 (전체가 아닐 때만)
      if (appliedStatus !== 'all') {
        params.status = appliedStatus;
      }

      let response;
      if (isPrivate) {
        response = await getPrivateMembers(params);
      } else {
        response = await getPublicMembers(params);
      }

      if (isRefresh) {
        setMembers(response.members || []);
        setPage(1);
      } else {
        setMembers(response.members || []);
      }
      setTotal(response.total || 0);
      setImageErrors({});
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setMembers([]);
      setTotal(0);
    } finally {
      if (isSearch) {
        setIsSearchLoading(false);
      } else if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [page, size, appliedSearchTerm, appliedGen, appliedStatus, isPrivate, getPublicMembers, getPrivateMembers]);

  // 페이지 이동
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  // 카드 클릭 핸들러
  const onCardClick = useCallback(async (member: MemberPublicListItem | MemberPrivateListItem) => {
    if (!isPrivate) return;
    
    // MemberPrivateListItem에만 id가 있음
    if ('id' in member) {
      try {
        const memberDetail = await getMemberDetail(member.id);
        setSelectedMember(memberDetail);
        setShowDetail(true);
      } catch (err) {
        console.error('Failed to get member details:', err);
        Alert.alert('오류', '사용자 정보를 불러오는 중 오류가 발생했습니다.');
      }
    }
  }, [isPrivate, getMemberDetail]);

  // 모달 닫기
  const closeDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedMember(null);
  }, []);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedGen(selectedGen);
    setAppliedStatus(selectedStatus);
    setPage(1);
    fetchMembers(true);
    setShowFilters(false);
  }, [searchTerm, selectedGen, selectedStatus, fetchMembers]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setSearchTerm('');
    setSelectedGen('all');
    setSelectedStatus('all');
    setAppliedSearchTerm('');
    setAppliedGen('all');
    setAppliedStatus('all');
    setPage(1);
    fetchMembers(true);
    setShowFilters(false);
  }, [fetchMembers]);

  // 새로고침 핸들러
  const onRefresh = useCallback(() => {
    fetchMembers(false, true);
    fetchTotalCount();
  }, [fetchMembers, fetchTotalCount]);

  // 화면 크기 변화 감지
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const horizontalPadding = 24 * 2; // 양쪽 패딩
      const cardGap = 6; // 카드 간 간격
      const columns = 3; // 항상 3열
      const availableWidth = window.width - horizontalPadding - (cardGap * (columns - 1));
      const cardWidth = Math.floor(availableWidth / columns);
      
      setScreenData({ width: window.width, cardWidth, columns });
    });

    return () => subscription?.remove();
  }, []);

  // 초기 로딩 시 전체 멤버 수 조회
  useEffect(() => {
    fetchTotalCount();
  }, [fetchTotalCount]);

  // 초기 로딩 및 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    fetchMembers();
  }, [page, appliedSearchTerm, appliedGen, appliedStatus, fetchMembers]);

  // 멤버 카드 컴포넌트
  const MemberCard = ({ member, index }: { member: MemberPublicListItem | MemberPrivateListItem, index: number }) => {
    const memberId = 'id' in member ? member.id : index.toString();
    
    return (
      <TouchableOpacity
        style={{
          width: screenData.cardWidth,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
        onPress={() => onCardClick(member)}
        activeOpacity={isPrivate ? 0.7 : 1}
      >
        <View style={{ alignItems: 'center' }}>
          {/* 프로필 이미지 */}
          <View style={{ marginBottom: 8 }}>
            {member.profile_image_url && !imageErrors[memberId] ? (
              <Image
                source={{ uri: getThumbnailUrl(member.profile_image_url, 128) }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                }}
                onError={() => handleImageError(memberId)}
              />
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#404040',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#e0e0e0', fontSize: 14, fontWeight: '500' }}>
                  {getFirstLetter(member.name)}
                </Text>
              </View>
            )}
          </View>
          
          {/* 이름 */}
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 6, textAlign: 'center' }}>
            {member.name}
          </Text>
          
          {/* 기수와 커피챗 아이콘 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {'gen' in member && member.gen !== undefined && (
              <View
                style={{
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                  borderRadius: 8,
                  backgroundColor: 'status' in member && member.status === 'active' 
                    ? '#8B0000' 
                    : 'rgba(156, 163, 175, 0.2)',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                {'status' in member && member.status === 'active' && (
                  <View
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: '#ffa282',
                    }}
                  />
                )}
                <Text
                  style={{
                    color: 'status' in member && member.status === 'active' 
                      ? '#ffa282' 
                      : '#d1d5db',
                    fontSize: 9,
                    fontWeight: '500',
                  }}
                >
                  {member.gen === 0 ? '창립멤버' : `${member.gen}기`}
                </Text>
              </View>
            )}
            {isPrivate && 'coffee_chat_enabled' in member && member.coffee_chat_enabled && (
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#00654D',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="cafe" size={8} color="white" />
              </View>
            )}
          </View>
          
          {/* 학력사항 */}
          <View style={{ alignItems: 'center' }}>
            {member.school && (
              <Text style={{ color: '#e0e0e0', fontSize: 10, textAlign: 'center', marginBottom: 1 }} numberOfLines={1}>
                {member.school}
              </Text>
            )}
            {member.major && (
              <Text style={{ color: '#e0e0e0', fontSize: 10, textAlign: 'center' }} numberOfLines={1}>
                {member.major}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 스켈레톤 카드 컴포넌트
  const SkeletonCard = () => (
    <View
      style={{
        width: screenData.cardWidth,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#404040',
          marginBottom: 8,
        }}
      />
      <View
        style={{
          width: 60,
          height: 14,
          backgroundColor: '#404040',
          borderRadius: 7,
          marginBottom: 6,
        }}
      />
      <View
        style={{
          width: 80,
          height: 10,
          backgroundColor: '#404040',
          borderRadius: 5,
        }}
      />
    </View>
  );

  // 로딩 상태
  if (isLoading && !appliedSearchTerm && appliedGen === 'all' && appliedStatus === 'all') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        
        {/* 헤더 */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingHorizontal: 24, 
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0, 0, 0, 0.7)'
        }}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/'); // 홈으로 이동
            }
          }} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>멤버</Text>
            <Text style={{ color: '#e0e0e0', fontSize: 14 }}>프로메테우스 멤버 목록</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 

            gap: 6
          }}>
            {Array.from({ length: 9 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      
      {/* 헤더 */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 24, 
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.8)'
      }}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/'); // 홈으로 이동
          }
        }} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>멤버</Text>
          <Text style={{ color: '#e0e0e0', fontSize: 14 }}>프로메테우스 멤버 목록</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#e0e0e0', fontSize: 14 }}>
            전체 <Text style={{ color: '#ffa282', fontWeight: 'bold' }}>{totalAll}</Text>명
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#ffa282"
            colors={['#ffa282']}
          />
        }
      >
        {/* 검색 및 필터 - 로그인 상태에서만 표시 */}
        {isPrivate && (
          <View style={{ marginBottom: 24 }}>
            {/* 검색 바 */}
            <View style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons name="search" size={20} color="#e0e0e0" style={{ marginRight: 12 }} />
              <TextInput
                style={{ 
                  flex: 1, 
                  color: '#FFFFFF', 
                  fontSize: 16,
                  paddingVertical: 0
                }}
                placeholder="이름, 학교를 검색해보세요!"
                placeholderTextColor="#888"
                value={searchTerm}
                onChangeText={setSearchTerm}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity 
                onPress={() => setShowFilters(!showFilters)}
                style={{ marginLeft: 12 }}
              >
                <Ionicons 
                  name="options" 
                  size={20} 
                  color={showFilters ? "#ffa282" : "#e0e0e0"} 
                />
              </TouchableOpacity>
            </View>

            {/* 필터 옵션 */}
            {showFilters && (
              <View style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12
              }}>
                {/* 기수 선택 */}
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  기수
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {genOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setSelectedGen(option.value)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: selectedGen === option.value ? '#8B0000' : 'rgba(255, 255, 255, 0.1)',
                          borderWidth: 1,
                          borderColor: selectedGen === option.value ? '#ffa282' : 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <Text style={{
                          color: selectedGen === option.value ? '#ffa282' : '#e0e0e0',
                          fontSize: 12,
                          fontWeight: '500'
                        }}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* 활동 상태 선택 */}
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                  활동 상태
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                  {[
                    { value: 'all', label: '전체' },
                    { value: 'active', label: '활동중' },
                    { value: 'alumni', label: '알럼나이' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedStatus(option.value)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: selectedStatus === option.value ? '#8B0000' : 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        borderColor: selectedStatus === option.value ? '#ffa282' : 'rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <Text style={{
                        color: selectedStatus === option.value ? '#ffa282' : '#e0e0e0',
                        fontSize: 12,
                        fontWeight: '500'
                      }}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 버튼들 */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={handleReset}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: '#e0e0e0', fontSize: 14, fontWeight: '500' }}>
                      초기화
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSearch}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: '#8B0000',
                      alignItems: 'center'
                    }}
                    disabled={isSearchLoading}
                  >
                    {isSearchLoading ? (
                      <ActivityIndicator size="small" color="#ffa282" />
                    ) : (
                      <Text style={{ color: '#ffa282', fontSize: 14, fontWeight: '600' }}>
                        검색
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        
        {/* 멤버 카드 그리드 */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 

          gap: 6
        }}>
          {members.map((member, index) => (
            <MemberCard 
              key={'id' in member ? member.id : index} 
              member={member} 
              index={index} 
            />
          ))}
        </View>

        {/* 빈 상태 */}
        {!isLoading && !isSearchLoading && members.length === 0 && (
          <View style={{ 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: 60 
          }}>
            <Ionicons name="people-outline" size={48} color="#666" style={{ marginBottom: 16 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '500' }}>
              멤버가 없습니다.
            </Text>
          </View>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginTop: 24,
            gap: 16
          }}>
            <TouchableOpacity
              onPress={prevPage}
              disabled={page === 1}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: page === 1 ? 'rgba(255, 255, 255, 0.1)' : '#8B0000',
                opacity: page === 1 ? 0.5 : 1
              }}
            >
              <Text style={{ color: page === 1 ? '#888' : '#ffa282', fontSize: 14, fontWeight: '500' }}>
                이전
              </Text>
            </TouchableOpacity>
            
            <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
              {page} / {totalPages}
            </Text>
            
            <TouchableOpacity
              onPress={nextPage}
              disabled={page === totalPages}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: page === totalPages ? 'rgba(255, 255, 255, 0.1)' : '#8B0000',
                opacity: page === totalPages ? 0.5 : 1
              }}
            >
              <Text style={{ color: page === totalPages ? '#888' : '#ffa282', fontSize: 14, fontWeight: '500' }}>
                다음
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 프로필 모달 */}
      <MemberModal
        isOpen={showDetail}
        onClose={closeDetail}
        member={selectedMember}
      />
    </View>
  );
}
