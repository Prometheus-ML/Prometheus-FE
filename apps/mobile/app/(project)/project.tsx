'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProject } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { Project } from '@prometheus-fe/types';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    allProjects,
    fetchProjects,
  } = useProject();

  const { getThumbnailUrl, getDefaultImageUrl } = useImage();

  // 상태 관리
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [size] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');
  const [appliedGen, setAppliedGen] = useState<string>('all');

  // 계산된 값들
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  // 필터링된 프로젝트 목록
  const filteredProjects = useMemo(() => {
    let filtered = [...allProjects];

    // 검색어 필터 적용
    if (appliedSearchTerm.trim()) {
      const searchLower = appliedSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(project => {
        const titleMatch = project.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = project.description?.toLowerCase().includes(searchLower);
        const keywordMatch = project.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        );
        return titleMatch || descriptionMatch || keywordMatch;
      });
    }

    // 기수 필터 적용 (전체가 아닐 때만)
    if (appliedGen !== 'all') {
      if (appliedGen === 'previous') {
        filtered = filtered.filter(project => project.gen <= 4);
      } else {
        const genNum = parseInt(appliedGen);
        filtered = filtered.filter(project => project.gen === genNum);
      }
    }

    return filtered;
  }, [allProjects, appliedSearchTerm, appliedGen]);

  // 프로젝트 목록 조회
  const fetchProjectList = useCallback(async (isSearch = false) => {
    try {
      if (isSearch) {
        setIsSearchLoading(true);
      } else {
        setIsLoading(true);
      }
      
      let params: any = {
        page,
        size,
        // status 필터 제거: 모든 상태의 프로젝트 조회
      };

      // 검색어 필터 적용
      if (appliedSearchTerm.trim()) {
        params.search = appliedSearchTerm.trim();
      }

      // 기수 필터 적용 (전체가 아닐 때만)
      if (appliedGen !== 'all') {
        if (appliedGen === 'previous') {
          // 이전기수는 4기 이하
          params.gen = '4';
        } else {
          params.gen = parseInt(appliedGen);
        }
      }

      const response = await fetchProjects(params);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setTotal(0);
    } finally {
      if (isSearch) {
        setIsSearchLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [page, size, appliedSearchTerm, appliedGen, fetchProjects]);

  // 초기 로딩 및 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    fetchProjectList();
  }, [page, appliedSearchTerm, appliedGen, fetchProjectList]);

  // 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjectList();
    setRefreshing(false);
  }, [fetchProjectList]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedGen(selectedGen);
    setPage(1);
    fetchProjectList(true);
  }, [searchTerm, selectedGen, fetchProjectList]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setSearchTerm('');
    setSelectedGen('all');
    setAppliedSearchTerm('');
    setAppliedGen('all');
    setPage(1);
    fetchProjectList(true);
  }, [fetchProjectList]);

  // 기수별 색상 반환
  const getGenColor = (gen: number) => {
    if (gen <= 4) return '#9CA3AF'; // 4기 이하는 이전기수로 밝은 회색 (gray-400)
    
    const colors = [
      '#DC2626', // 5기 - 빨간색 (red-600)
      '#2563EB', // 6기 - 파란색 (blue-600)
      '#059669', // 7기 - 초록색 (emerald-600)
      '#7C3AED', // 8기 - 보라색 (violet-600)
      '#EA580C', // 9기 - 주황색 (orange-600)
      '#0891B2', // 10기 - 청록색 (cyan-600)
      '#BE185D', // 11기 - 분홍색 (pink-600)
      '#65A30D', // 12기 - 라임색 (lime-600)
      '#CA8A04', // 13기 - 노란색 (yellow-600)
      '#9333EA', // 14기 - 자주색 (purple-600)
    ];
    
    return colors[(gen - 5) % colors.length] || '#DC2626';
  };

  // 현재 기수 계산 (2022년 3월부터 6개월 단위)
  const getCurrentGen = useCallback(() => {
    const startDate = new Date('2022-03-01');
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return Math.floor(monthsDiff / 6) + 1;
  }, []);

  // 기수 옵션 생성
  const genOptions = [
    { value: 'all', label: '전체 기수' },
    ...Array.from({ length: getCurrentGen() }, (_, i) => {
      const gen = getCurrentGen() - i;
      if (gen > 4) {
        return {
          value: gen.toString(),
          label: `${gen}기`
        };
      }
      return null;
    }).filter((option): option is { value: string; label: string } => option !== null),
    { value: 'previous', label: '이전기수' }
  ];

  // 프로젝트 카드 렌더링
  const renderProjectCard = (project: Project) => (
    <TouchableOpacity
      key={project.id}
      className="bg-white/10 border border-white/20 rounded-lg p-4 mb-4"
      onPress={() => router.push(`/(project)/${project.id}/detail`)}
    >
      {/* 프로젝트 이미지 */}
      <View className="mb-4">
        <View className="w-full h-48 bg-white/10 rounded-lg overflow-hidden">
          {project.thumbnail_url ? (
            <Image
              source={{ uri: getThumbnailUrl(project.thumbnail_url, 400) }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full flex items-center justify-center bg-white/10">
              <Ionicons name="folder-outline" size={48} color="rgba(255,255,255,0.5)" />
            </View>
          )}
        </View>
      </View>

      {/* 프로젝트 정보 */}
      <View className="space-y-3">
        {/* 제목과 기수 */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-lg font-semibold text-white mb-1" numberOfLines={2}>
              {project.title}
            </Text>
            <View 
              className="px-2 py-1 mb-1 rounded-full self-start"
              style={{ backgroundColor: getGenColor(project.gen) + '20' }}
            >
              <Text 
                className="text-xs font-medium"
                style={{ color: getGenColor(project.gen) }}
              >
                {project.gen <= 4 ? '이전기수' : `${project.gen}기`}
              </Text>
            </View>
          </View>
        </View>

        {/* 설명 */}
        {project.description && (
          <Text className="text-gray-300 text-sm mb-2" numberOfLines={2}>
            {project.description}
          </Text>
        )}

        {/* 키워드 */}
        <View className="flex-row flex-wrap">
          {project.keywords && project.keywords.length > 0 ? (
            project.keywords.slice(0, 3).map((keyword, index) => (
              <View
                key={index}
                className="bg-white/20 rounded-lg px-2 py-1 mr-1 mb-1"
              >
                <Text className="text-white text-xs">#{keyword}</Text>
              </View>
            ))
          ) : (
            <Text className="text-gray-500 text-xs">키워드 없음</Text>
          )}
          {project.keywords && project.keywords.length > 3 && (
            <View className="bg-white/20 rounded-full px-2 py-1 mr-1 mb-1">
              <Text className="text-white text-xs">+{project.keywords.length - 3}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // 검색 모달 렌더링
  const renderSearchModal = () => (
    <View className="bg-white/10 border border-white/20 rounded-lg p-4 mb-4">
      <Text className="text-white text-lg font-semibold mb-4">검색 및 필터</Text>
      
      {/* 검색 입력 */}
      <View className="mb-4">
        <Text className="text-white text-sm mb-2">검색어</Text>
        <View className="flex-row items-center bg-white/10 border border-white/20 rounded-lg px-3 py-2">
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="프로젝트명, 키워드를 검색해보세요!"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      {/* 기수 선택 */}
      <View className="mb-4">
        <Text className="text-white text-sm mb-2">기수</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {genOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                className={`px-3 py-2 rounded-xl border ${
                  selectedGen === option.value
                    ? 'bg-red-600 border-red-600'
                    : 'bg-white/10 border-white/20'
                } ${index > 0 ? 'ml-1' : ''}`}
                onPress={() => setSelectedGen(option.value)}
              >
                <Text className={`text-sm ${
                  selectedGen === option.value ? 'text-white' : 'text-gray-300'
                }`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 버튼들 */}
      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="flex-1 bg-red-600 rounded-lg py-3 mr-2"
          onPress={handleSearch}
          disabled={isSearchLoading}
        >
          <Text className="text-white text-center font-semibold">
            {isSearchLoading ? '검색 중...' : '검색'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-white/10 border border-white/20 rounded-lg py-3"
          onPress={handleReset}
        >
          <Text className="text-white text-center font-semibold">초기화</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      {/* 헤더 */}
      <View className="px-4 py-6 border-b border-white/20">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 flex items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">프로젝트</Text>
              <Text className="text-sm text-gray-300">프로메테우스 프로젝트 목록</Text>
            </View>
          </View>
          <View className="text-right">
            <Text className="text-sm text-gray-300">
              전체 <Text className="text-orange-400 font-bold">{total}</Text>개
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 검색 및 필터 - 로그인 상태에서만 표시 */}
        {user && renderSearchModal()}

        {/* 검색 결과 수 */}
        {(appliedSearchTerm || appliedGen !== 'all') && (
          <View className="mb-4">
            <Text className="text-sm text-gray-300">
              검색 결과: {filteredProjects.length}개
            </Text>
          </View>
        )}

        {/* 프로젝트 목록 */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-12">
            <View className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            <Text className="text-white mt-2">로딩 중...</Text>
          </View>
        ) : (
          <View>
            {filteredProjects.map(renderProjectCard)}
          </View>
        )}

        {/* 빈 상태 */}
        {!isLoading && !isSearchLoading && filteredProjects.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <Ionicons name="folder-outline" size={48} color="rgba(255,255,255,0.5)" />
            <Text className="text-white text-lg font-semibold mt-4">프로젝트가 없습니다.</Text>
            <Text className="text-gray-300 text-sm mt-2 text-center">
              {(appliedSearchTerm || appliedGen !== 'all') ? '검색 결과가 없습니다.' : '아직 등록된 프로젝트가 없습니다.'}
            </Text>
          </View>
        )}

        {/* 페이지네이션 */}
        {!isLoading && !isSearchLoading && filteredProjects.length > 0 && totalPages > 1 && (
          <View className="flex-row justify-center items-center py-8">
            <TouchableOpacity
              onPress={() => setPage(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg mr-2 ${
                page === 1 ? 'bg-gray-600' : 'bg-white/10'
              }`}
            >
              <Text className={`text-sm ${
                page === 1 ? 'text-gray-400' : 'text-white'
              }`}>
                이전
              </Text>
            </TouchableOpacity>
            
            <Text className="text-white text-sm mx-4">
              {page} / {totalPages}
            </Text>
            
            <TouchableOpacity
              onPress={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg ml-2 ${
                page === totalPages ? 'bg-gray-600' : 'bg-white/10'
              }`}
            >
              <Text className={`text-sm ${
                page === totalPages ? 'text-gray-400' : 'text-white'
              }`}>
                다음
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}