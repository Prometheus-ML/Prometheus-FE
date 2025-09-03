'use client';

import Link from 'next/link';
import { useAuthStore } from '@prometheus-fe/stores';
import { useCommunity } from '@prometheus-fe/hooks';
import GlassCard from '../../../src/components/GlassCard';
import { useEffect } from 'react';

export default function PostPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { 
    memberPosts, 
    memberPostsStats, 
    isLoadingMemberPosts, 
    fetchMemberPostsHistory 
  } = useCommunity();

  useEffect(() => {
    if (isAuthenticated() && user?.id) {
      fetchMemberPostsHistory(user.id);
    }
  }, [user?.id]);

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
                className="p-4 rounded-lg border bg-white/5 border-white/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span>카테고리: {post.category}</span>
                      <span>작성일: {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span>❤️ {post.like_count || 0}</span>
                    <span>💬 {post.comment_count || 0}</span>
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
    </div>
  );
}
