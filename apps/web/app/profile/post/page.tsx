'use client';

import { useAuthStore } from '@prometheus-fe/stores';
import { useCommunity } from '@prometheus-fe/hooks';
import GlassCard from '../../../src/components/GlassCard';
import PostModal from '../../../src/components/PostModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComments } from '@fortawesome/free-solid-svg-icons';

import { useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'free', label: '자유게시판' },
  { value: 'activity', label: '활동' },
  { value: 'career', label: '진로' },
  { value: 'promotion', label: '홍보' },
  { value: 'announcement', label: '공지사항' },
] as const;

const getCategoryLabel = (category: string) => {
  return CATEGORIES.find(c => c.value === category)?.label || category;
};

export default function PostPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { 
    memberPosts, 
    memberPostsStats, 
    isLoadingMemberPosts, 
    fetchMemberPostsHistory 
  } = useCommunity();

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated() && user?.id) {
      fetchMemberPostsHistory(user.id);
    }
  }, [user?.id]);

  const handlePostClick = (postId: number) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  if (!isAuthenticated()) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-6">
          <div className="text-gray-300 text-center py-8">
            로그인이 필요합니다.
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">내 게시글</h2>

        {/* 게시글 목록 */}
        {isLoadingMemberPosts ? (
          <div className="text-gray-300 text-center py-8">
            로딩 중...
          </div>
        ) : memberPosts.length === 0 ? (
          <div className="text-gray-300 text-center py-8">
            작성한 게시글이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {memberPosts.map((post) => (
              <div 
                key={post.id} 
                className="p-4 rounded-lg border bg-white/5 border-white/20 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handlePostClick(post.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span>카테고리: {getCategoryLabel(post.category)}</span>
                      <span>작성일: {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faHeart} className="w-3 h-3" />
                      {post.like_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faComments} className="w-3 h-3" />
                      {post.comment_count || 0}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm line-clamp-2">
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* 게시글 상세 모달 */}
      <PostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        postId={selectedPostId}
      />
    </div>
  );
}
