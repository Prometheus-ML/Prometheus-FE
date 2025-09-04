import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@prometheus-fe/stores';
import { useCommunity } from '@prometheus-fe/hooks';

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
      <View className="flex-1 bg-gray-900">
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 w-full">
            <Text className="text-gray-300 text-center text-base">
              로그인이 필요합니다.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 space-y-4">
          {/* 헤더 */}
          <View className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
            <Text className="text-lg font-semibold text-white mb-4">내 게시글</Text>
            
            {/* 게시글 목록 */}
            {isLoadingMemberPosts ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-gray-300 text-center mt-4">
                  로딩 중...
                </Text>
              </View>
            ) : memberPosts.length === 0 ? (
              <View className="py-8">
                <Text className="text-gray-300 text-center text-base">
                  작성한 게시글이 없습니다.
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {memberPosts.map((post) => (
                  <View 
                    key={post.id} 
                    className="p-4 rounded-lg border bg-white/5 border-white/20"
                  >
                    <View className="mb-3">
                      <Text className="font-medium text-white text-base mb-2">
                        {post.title}
                      </Text>
                      <View className="flex-row flex-wrap gap-4">
                        <Text className="text-sm text-gray-400">
                          카테고리: {post.category}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          작성일: {new Date(post.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-4">
                        <Text className="text-gray-300 text-sm" numberOfLines={2}>
                          {post.content}
                        </Text>
                      </View>
                      <View className="flex-row gap-3">
                        <Text className="text-sm text-gray-400">
                          ❤️ {post.like_count || 0}
                        </Text>
                        <Text className="text-sm text-gray-400">
                          💬 {post.comment_count || 0}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
