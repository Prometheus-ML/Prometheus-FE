import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useProject } from '@prometheus-fe/hooks';
import { useImage } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { Project } from '@prometheus-fe/types';

const { width: screenWidth } = Dimensions.get('window');

export default function ProjectPage() {
  const { isAuthenticated } = useAuthStore();
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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // 검색 상태
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState<string>('');
  const [appliedGen, setAppliedGen] = useState<string>('all');
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

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
        status: 'completed' // 완료된 프로젝트만 조회
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
      setImageErrors({});
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setTotal(0);
      Alert.alert('오류', '프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      if (isSearch) {
        setIsSearchLoading(false);
      } else {
        setIsLoading(false);
      }
      setRefreshing(false);
    }
  }, [page, size, appliedSearchTerm, appliedGen, fetchProjects]);

  // 초기 로딩 및 페이지 변경 시 목록 다시 로드
  useEffect(() => {
    fetchProjectList();
  }, [page, appliedSearchTerm, appliedGen, fetchProjectList]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    setAppliedSearchTerm(searchTerm);
    setAppliedGen(selectedGen);
    setPage(1);
    setShowSearchModal(false);
    fetchProjectList(true);
  }, [searchTerm, selectedGen, fetchProjectList]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setSearchTerm('');
    setSelectedGen('all');
    setAppliedSearchTerm('');
    setAppliedGen('all');
    setPage(1);
    setShowSearchModal(false);
    fetchProjectList(true);
  }, [fetchProjectList]);

  // 새로고침 핸들러
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchProjectList();
  }, [fetchProjectList]);

  // 기수별 색상 반환 (멤버 페이지와 동일한 스타일)
  const getGenColor = (gen: number) => {
    if (gen <= 4) return styles.genBadgePrevious; // 4기 이하는 이전기수로 회색
    return styles.genBadgeCurrent;
  };

  // 이미지 에러 처리
  const handleImageError = (projectId: string) => {
    setImageErrors(prev => ({ ...prev, [projectId]: true }));
  };

  // 현재 기수 계산 (2022년 3월부터 6개월 단위)
  const getCurrentGen = useCallback(() => {
    const startDate = new Date('2022-03-01');
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    return Math.floor(monthsDiff / 6) + 1;
  }, []);

  // 기수 옵션 생성 (날짜 기반, 최신 기수부터 역순, 이전기수 맨 뒤)
  const genOptions = [
    { value: 'all', label: '전체 기수' },
    ...Array.from({ length: getCurrentGen() }, (_, i) => {
      const gen = getCurrentGen() - i; // 최신 기수부터 역순으로
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
      style={styles.projectCard}
      onPress={() => {
        // 프로젝트 상세 페이지로 이동 (추후 구현)
        Alert.alert('프로젝트 상세', `${project.title} 상세 페이지로 이동합니다.`);
      }}
    >
      {/* 프로젝트 이미지 */}
      <View style={styles.projectImageContainer}>
        {project.thumbnail_url && !imageErrors[project.id.toString()] ? (
          <Image
            source={{ uri: getThumbnailUrl(project.thumbnail_url, 400) }}
            style={styles.projectImage}
            onError={() => handleImageError(project.id.toString())}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.projectImagePlaceholder}>
            <FontAwesome name="folder" size={32} color="rgba(255, 255, 255, 0.3)" />
          </View>
        )}
      </View>

      {/* 프로젝트 정보 */}
      <View style={styles.projectInfo}>
        {/* 제목과 기수 */}
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle} numberOfLines={2}>
            {project.title}
          </Text>
          <View style={[styles.genBadge, getGenColor(project.gen)]}>
            <Text style={styles.genText}>
              {project.gen <= 4 ? '이전기수' : `${project.gen}기`}
            </Text>
          </View>
        </View>

        {/* 설명 */}
        {project.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description}
          </Text>
        )}

        {/* 키워드 */}
        <View style={styles.keywordsContainer}>
          {project.keywords && project.keywords.length > 0 ? (
            <>
              {project.keywords.slice(0, 3).map((keyword, index) => (
                <View key={index} style={styles.keywordBadge}>
                  <Text style={styles.keywordText}>#{keyword}</Text>
                </View>
              ))}
              {project.keywords.length > 3 && (
                <View style={styles.keywordBadge}>
                  <Text style={styles.keywordText}>+{project.keywords.length - 3}</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.noKeywordsText}>키워드 없음</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // 검색 모달 렌더링
  const renderSearchModal = () => (
    <Modal
      visible={showSearchModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSearchModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>프로젝트 검색</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowSearchModal(false)}
            >
              <FontAwesome name="times" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchForm}>
            <Text style={styles.inputLabel}>검색어</Text>
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="프로젝트명, 키워드를 검색해보세요!"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>기수 선택</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genSelector}>
              {genOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genOption,
                    selectedGen === option.value && styles.genOptionSelected
                  ]}
                  onPress={() => setSelectedGen(option.value)}
                >
                  <Text style={[
                    styles.genOptionText,
                    selectedGen === option.value && styles.genOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.searchButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
              >
                <Text style={styles.resetButtonText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
                disabled={isSearchLoading}
              >
                {isSearchLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.searchButtonText}>검색</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/')}
          >
            <FontAwesome name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>프로젝트</Text>
            <Text style={styles.headerSubtitle}>프로메테우스 프로젝트 목록</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.totalText}>
            전체 <Text style={styles.totalCount}>{total}</Text>개
          </Text>
          {isAuthenticated() && (
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={() => setShowSearchModal(true)}
            >
              <FontAwesome name="search" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 검색 결과 수 */}
      {(appliedSearchTerm || appliedGen !== 'all') && (
        <View style={styles.searchResultContainer}>
          <Text style={styles.searchResultText}>
            검색 결과: {filteredProjects.length}개
          </Text>
        </View>
      )}

      {/* 프로젝트 목록 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Text style={styles.loadingText}>프로젝트를 불러오는 중...</Text>
          </View>
        ) : filteredProjects.length > 0 ? (
          <View style={styles.projectsGrid}>
            {filteredProjects.map((project: Project) => renderProjectCard(project))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="folder" size={48} color="#666" />
            <Text style={styles.emptyTitle}>프로젝트가 없습니다.</Text>
            <Text style={styles.emptySubtitle}>
              {(appliedSearchTerm || appliedGen !== 'all') ? '검색 결과가 없습니다.' : '아직 등록된 프로젝트가 없습니다.'}
            </Text>
          </View>
        )}

        {/* 페이지네이션 (간단한 형태) */}
        {!isLoading && filteredProjects.length > 0 && totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <Text style={[styles.pageButtonText, page === 1 && styles.pageButtonTextDisabled]}>
                이전
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.pageInfo}>
              {page} / {totalPages}
            </Text>
            
            <TouchableOpacity
              style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
              onPress={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <Text style={[styles.pageButtonText, page === totalPages && styles.pageButtonTextDisabled]}>
                다음
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 검색 모달 */}
      {renderSearchModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  headerRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  totalText: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  totalCount: {
    color: '#ffa282',
    fontWeight: 'bold',
  },
  searchIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchResultText: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  projectsGrid: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  projectImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  projectImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  projectInfo: {
    padding: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  genBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    flexShrink: 0,
  },
  genBadgePrevious: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
  },
  genBadgeCurrent: {
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
  },
  genText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffa282',
  },
  projectDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  keywordBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  noKeywordsText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 20,
  },
  pageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: '#666',
  },
  pageInfo: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  genSelector: {
    marginBottom: 24,
  },
  genOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  genOptionSelected: {
    backgroundColor: '#8B0000',
    borderColor: '#c2402a',
  },
  genOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  genOptionTextSelected: {
    fontWeight: '600',
  },
  searchButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#8B0000',
    borderWidth: 1,
    borderColor: '#c2402a',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
