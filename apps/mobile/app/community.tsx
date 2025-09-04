import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useCommunity } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage } from '@prometheus-fe/hooks';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'free', label: '자유게시판' },
  { value: 'activity', label: '활동' },
  { value: 'career', label: '진로' },
  { value: 'promotion', label: '홍보' },
  { value: 'announcement', label: '공지사항' },
] as const;

export default function CommunityPage() {
  const {
    posts,
    totalPosts,
    isLoadingPosts,
    isCreatingPost,
    fetchPosts,
    createPost,
    deletePost,
  } = useCommunity();

  const { user } = useAuthStore();
  const { getThumbnailUrl } = useImage();

  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedCategory, setAppliedCategory] = useState('all');
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // 게시글 목록 조회
  const fetchPostsData = useCallback(async (params?: any) => {
    try {
      setIsSearchLoading(true);
      setError('');
      let queryParams: any = { page: 1, size: 20, ...params };
      
      if (appliedSearchTerm.trim()) {
        queryParams.search = appliedSearchTerm.trim();
      }
      if (appliedCategory !== 'all') {
        queryParams.category = appliedCategory;
      }
      
      await fetchPosts(queryParams);
    } catch (err) {
      console.error('게시글 목록 로드 실패:', err);
      setError('게시글 목록을 불러오지 못했습니다.');
    } finally {
      setIsSearchLoading(false);
    }
  }, [appliedSearchTerm, appliedCategory, fetchPosts]);

  // 초기 로딩
  useEffect(() => {
    fetchPostsData();
  }, [fetchPostsData]);

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPostsData();
    setRefreshing(false);
  }, [fetchPostsData]);

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setAppliedCategory(category);
    setCurrentPage(1);
    fetchPostsData({ category: category === 'all' ? '' : category });
  };

  // 검색
  const handleSearch = () => {
    setAppliedSearchTerm(searchTerm);
    setCurrentPage(1);
    fetchPostsData({ 
      search: searchTerm.trim(),
      category: activeCategory === 'all' ? '' : activeCategory
    });
  };

  // 검색 초기화
  const handleReset = () => {
    setSearchTerm('');
    setAppliedSearchTerm('');
    setActiveCategory('all');
    setAppliedCategory('all');
    setCurrentPage(1);
    fetchPostsData();
  };

  // 게시글 클릭
  const handlePostPress = (post: any) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  // 게시글 삭제
  const handleDeletePost = async (postId: number) => {
    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(postId);
              fetchPostsData();
            } catch (err) {
              console.error('게시글 삭제 실패:', err);
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  // 카테고리 라벨
  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now.getTime() - postDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분전`;
    } else if (diffInHours < 24 && now.toDateString() === postDate.toDateString()) {
      return postDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (diffInDays < 365) {
      return postDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
    } else {
      return `${Math.floor(diffInDays / 365)}년 전`;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      {/* 헤더 */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
              커뮤니티
            </Text>
            <Text style={{ color: '#e0e0e0', fontSize: 12 }}>
              프로메테우스 커뮤니티 게시판
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {user && (
            <TouchableOpacity
              onPress={() => setShowCreateForm(true)}
              style={{
                backgroundColor: '#8B0000',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Text style={{ color: '#e0e0e0', fontSize: 12 }}>
            전체 <Text style={{ color: '#ffa282', fontWeight: 'bold' }}>{totalPosts}</Text>개
          </Text>
        </View>
      </View>

      {/* 검색 및 필터 */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        {/* 검색바 */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          gap: 8,
        }}>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            paddingHorizontal: 12,
          }}>
            <Ionicons name="search" size={20} color="#888" />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="제목을 검색하세요!"
              placeholderTextColor="#888"
              style={{
                flex: 1,
                color: '#FFFFFF',
                paddingVertical: 12,
                paddingHorizontal: 8,
                fontSize: 16,
              }}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          
          <TouchableOpacity
            onPress={handleSearch}
            disabled={isSearchLoading}
            style={{
              backgroundColor: '#8B0000',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            {isSearchLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>검색</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleReset}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 카테고리 탭 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.value}
              onPress={() => handleCategoryChange(category.value)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeCategory === category.value ? '#8B0000' : 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderColor: activeCategory === category.value ? '#c2402a' : 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <Text style={{
                color: activeCategory === category.value ? '#ffa282' : '#FFFFFF',
                fontSize: 14,
                fontWeight: activeCategory === category.value ? '600' : '400',
              }}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 에러 메시지 */}
      {error && (
        <View style={{
          marginHorizontal: 16,
          marginBottom: 12,
          padding: 12,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(239, 68, 68, 0.3)',
        }}>
          <Text style={{ color: '#fca5a5', fontSize: 14 }}>{error}</Text>
        </View>
      )}

      {/* 게시글 목록 */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
      >
        {isLoadingPosts && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B0000" />
            <Text style={{ color: '#888', marginTop: 12 }}>게시글을 불러오는 중...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Ionicons name="chatbubbles-outline" size={48} color="#444" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 16 }}>
              게시글이 없습니다
            </Text>
            <Text style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
              {(appliedSearchTerm || appliedCategory !== 'all') 
                ? '검색 결과가 없습니다.' 
                : '아직 등록된 게시글이 없습니다.'
              }
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {posts.map((post: any) => (
              <TouchableOpacity
                key={post.id}
                onPress={() => handlePostPress(post)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    {/* 카테고리와 제목 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                      <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: 'rgba(156, 163, 175, 0.2)',
                        borderWidth: 1,
                        borderColor: 'rgba(156, 163, 175, 0.3)',
                      }}>
                        <Text style={{ color: '#d1d5db', fontSize: 10 }}>
                          {getCategoryLabel(post.category)}
                        </Text>
                      </View>
                      
                      {post.images && post.images.length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="image" size={12} color="#60a5fa" />
                          <Text style={{ color: '#60a5fa', fontSize: 10, marginLeft: 2 }}>
                            {post.images.length}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '600',
                      marginBottom: 8,
                      lineHeight: 22,
                    }} numberOfLines={2}>
                      {post.title}
                    </Text>

                    {/* 작성자 정보 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: '#d1d5db', fontSize: 12 }}>
                        {post.author_gen}기 {post.author_name}
                      </Text>
                      <View style={{ width: 2, height: 2, backgroundColor: '#666', borderRadius: 1 }} />
                      <Text style={{ color: '#888', fontSize: 12 }}>
                        {formatDate(post.created_at)}
                      </Text>
                      <View style={{ width: 2, height: 2, backgroundColor: '#666', borderRadius: 1 }} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="heart" size={12} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>
                          {post.like_count || 0}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="chatbubble" size={12} color="#888" />
                        <Text style={{ color: '#888', fontSize: 12 }}>
                          {post.comment_count || 0}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* 삭제 버튼 */}
                  {user && user.id === post.author_id && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post.id);
                      }}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 게시글 작성 모달 */}
      <PostCreateModal
        visible={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={async (postData) => {
          try {
            await createPost(postData);
            setShowCreateForm(false);
            fetchPostsData();
          } catch (err) {
            console.error('게시글 생성 실패:', err);
            Alert.alert('오류', '게시글 작성에 실패했습니다.');
          }
        }}
        isSubmitting={isCreatingPost}
      />

      {/* 게시글 상세 모달 */}
      <PostDetailModal
        visible={showPostModal}
        post={selectedPost}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPost(null);
          fetchPostsData(); // 모달 닫을 때 목록 새로고침
        }}
      />
    </SafeAreaView>
  );
}

// 게시글 작성 모달 컴포넌트
function PostCreateModal({ visible, onClose, onSubmit, isSubmitting }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [postData, setPostData] = useState({
    category: 'free',
    title: '',
    content: '',
    images: [] as string[],
  });

  const { uploadImage, isUploading, uploadError, getThumbnailUrl } = useImage();

  const handleSubmit = async () => {
    if (!postData.title.trim() || !postData.content.trim()) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    await onSubmit(postData);
    setPostData({ category: 'free', title: '', content: '', images: [] });
  };

  const handleImageUpload = async () => {
    // React Native에서는 ImagePicker를 사용해야 하지만
    // 여기서는 간단히 구현
    Alert.alert('이미지 업로드', '이미지 업로드 기능은 추후 구현됩니다.');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        {/* 헤더 */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: '#888', fontSize: 16 }}>취소</Text>
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
            새 게시글
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || !postData.title.trim() || !postData.content.trim()}
            style={{
              backgroundColor: isSubmitting || !postData.title.trim() || !postData.content.trim() 
                ? '#444' : '#8B0000',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Text style={{ 
              color: isSubmitting || !postData.title.trim() || !postData.content.trim() 
                ? '#888' : '#FFFFFF', 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              {isSubmitting ? '작성 중...' : '작성'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {/* 카테고리 선택 */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              카테고리
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.slice(1).map((category) => (
                <TouchableOpacity
                  key={category.value}
                  onPress={() => setPostData(prev => ({ ...prev, category: category.value }))}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: postData.category === category.value ? '#8B0000' : 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: postData.category === category.value ? '#c2402a' : 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Text style={{
                    color: postData.category === category.value ? '#ffa282' : '#FFFFFF',
                    fontSize: 14,
                    fontWeight: postData.category === category.value ? '600' : '400',
                  }}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 제목 입력 */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              제목
            </Text>
            <TextInput
              value={postData.title}
              onChangeText={(text) => setPostData(prev => ({ ...prev, title: text }))}
              placeholder="게시글 제목을 입력하세요"
              placeholderTextColor="#888"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: '#FFFFFF',
                fontSize: 16,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
              maxLength={200}
            />
          </View>

          {/* 내용 입력 */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
              내용
            </Text>
            <TextInput
              value={postData.content}
              onChangeText={(text) => setPostData(prev => ({ ...prev, content: text }))}
              placeholder="게시글 내용을 입력하세요"
              placeholderTextColor="#888"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: '#FFFFFF',
                fontSize: 16,
                minHeight: 120,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />
          </View>

          {/* 이미지 업로드 (추후 구현) */}
          <TouchableOpacity
            onPress={handleImageUpload}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              paddingVertical: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderStyle: 'dashed',
            }}
          >
            <Ionicons name="image" size={24} color="#888" />
            <Text style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
              이미지 첨부 (추후 지원)
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// 게시글 상세 모달 컴포넌트
function PostDetailModal({ visible, post, onClose }: {
  visible: boolean;
  post: any;
  onClose: () => void;
}) {
  const { 
    selectedPost,
    comments,
    isLoadingPost,
    isLoadingComments,
    isCreatingComment,
    fetchPost,
    createComment,
    deleteComment,
    toggleLike,
  } = useCommunity();
  
  const { user } = useAuthStore();
  const { getThumbnailUrl } = useImage();
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (visible && post) {
      fetchPost(post.id);
    }
  }, [visible, post, fetchPost]);

  const handleCreateComment = async () => {
    if (!newComment.trim() || !post) return;

    try {
      await createComment(post.id, { content: newComment });
      setNewComment('');
      fetchPost(post.id); // 댓글 목록 새로고침
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!post) return;

    Alert.alert(
      '댓글 삭제',
      '정말로 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment(post.id, commentId);
              fetchPost(post.id);
            } catch (err) {
              console.error('댓글 삭제 실패:', err);
              Alert.alert('오류', '댓글 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleToggleLike = async () => {
    if (!post || !user) return;

    try {
      await toggleLike(post.id);
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      Alert.alert('오류', '좋아요 처리에 실패했습니다.');
    }
  };

  if (!post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        {/* 헤더 */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
            게시글 상세
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {isLoadingPost ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B0000" />
          </View>
        ) : selectedPost ? (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            {/* 게시글 정보 */}
            <View style={{ marginBottom: 24 }}>
              {/* 제목과 카테고리 */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
                  {selectedPost.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: 'rgba(156, 163, 175, 0.2)',
                    borderWidth: 1,
                    borderColor: 'rgba(156, 163, 175, 0.3)',
                  }}>
                    <Text style={{ color: '#d1d5db', fontSize: 12 }}>
                      {CATEGORIES.find(c => c.value === selectedPost.category)?.label || selectedPost.category}
                    </Text>
                  </View>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: '#8B0000',
                  }}>
                    <Text style={{ color: '#ffa282', fontSize: 12 }}>
                      {selectedPost.author_gen}기
                    </Text>
                  </View>
                </View>
              </View>

              {/* 작성자 정보 */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ color: '#d1d5db', fontSize: 14 }}>
                    {selectedPost.author_name}
                  </Text>
                  <Text style={{ color: '#888', fontSize: 12 }}>
                    {new Date(selectedPost.created_at).toLocaleString('ko-KR')}
                  </Text>
                </View>
                
                {/* 좋아요 버튼 */}
                {user && (
                  <TouchableOpacity
                    onPress={handleToggleLike}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <Ionicons 
                      name={selectedPost.is_liked ? "heart" : "heart-outline"} 
                      size={16} 
                      color={selectedPost.is_liked ? "#ef4444" : "#FFFFFF"} 
                    />
                    <Text style={{ color: '#FFFFFF', fontSize: 14 }}>
                      {selectedPost.like_count || 0}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* 내용 */}
              <Text style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 24 }}>
                {selectedPost.content}
              </Text>

              {/* 이미지들 */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                    첨부된 이미지 ({selectedPost.images.length}개)
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {selectedPost.images.map((imageUrl: string, index: number) => (
                      <TouchableOpacity key={index}>
                        <Image
                          source={{ uri: getThumbnailUrl(imageUrl, 200) }}
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* 댓글 섹션 */}
            <View style={{
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.2)',
              paddingTop: 16,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                댓글 ({comments.length})
              </Text>

              {/* 댓글 작성 */}
              {user && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  gap: 8,
                  marginBottom: 16,
                }}>
                  <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="댓글을 입력하세요..."
                    placeholderTextColor="#888"
                    multiline
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      color: '#FFFFFF',
                      fontSize: 14,
                      maxHeight: 80,
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  <TouchableOpacity
                    onPress={handleCreateComment}
                    disabled={isCreatingComment || !newComment.trim()}
                    style={{
                      backgroundColor: isCreatingComment || !newComment.trim() ? '#444' : '#8B0000',
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    {isCreatingComment ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons name="send" size={16} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* 댓글 목록 */}
              {isLoadingComments ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#8B0000" />
                  <Text style={{ color: '#888', marginTop: 8 }}>댓글을 불러오는 중...</Text>
                </View>
              ) : comments.length === 0 ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#888', fontSize: 14 }}>아직 댓글이 없습니다.</Text>
                  {!user && (
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                      댓글을 작성하려면 로그인이 필요합니다.
                    </Text>
                  )}
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {comments.map((comment: any) => (
                    <View
                      key={comment.id}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                            {comment.author_gen}기 {comment.author_name}
                          </Text>
                          <Text style={{ color: '#888', fontSize: 12 }}>
                            {new Date(comment.created_at).toLocaleString('ko-KR')}
                          </Text>
                        </View>
                        {user && user.id === comment.author_id && (
                          <TouchableOpacity
                            onPress={() => handleDeleteComment(comment.id)}
                            style={{ padding: 4 }}
                          >
                            <Ionicons name="trash" size={14} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 20 }}>
                        {comment.content}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 16 }}>게시글을 찾을 수 없습니다.</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
