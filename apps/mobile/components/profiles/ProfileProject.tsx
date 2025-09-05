import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@prometheus-fe/stores';
import { useProject } from '@prometheus-fe/hooks';

export default function ProfileProject() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { fetchMyProjectHistory } = useProject();
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMyProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMyProjectHistory();
      setMyProjects(data.items || []);
    } catch (error) {
      console.error('내 프로젝트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMyProjectHistory]);

  useEffect(() => {
    if (isAuthenticated() && user) {
      loadMyProjects();
    }
  }, [isAuthenticated, user, loadMyProjects]);

  const handleProjectPress = (projectId: number) => {
    router.push(`/project/${projectId}`);
  };

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error('링크를 열 수 없습니다:', url);
      }
    } catch (error) {
      console.error('링크 열기 실패:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '진행중';
      case 'completed':
        return '완료';
      default:
        return '일시정지';
    }
  };

  if (!isAuthenticated()) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 w-full">
          <Text className="text-gray-300 text-center text-base">
            로그인이 필요합니다.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="p-4 space-y-4">
      <View className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
        <Text className="text-lg font-semibold text-white mb-4">내 프로젝트</Text>
        
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-gray-300 text-center mt-4">
              프로젝트를 불러오는 중...
            </Text>
          </View>
        ) : myProjects.length === 0 ? (
          <View className="py-8">
            <Text className="text-gray-300 text-center text-base">
              참여한 프로젝트가 없습니다.
            </Text>
          </View>
        ) : (
          <View className="space-y-4">
            {myProjects.map((projectWithMembers) => {
              const project = projectWithMembers.project;
              return (
                <TouchableOpacity
                  key={project.id}
                  onPress={() => handleProjectPress(project.id)}
                  className="bg-white/10 rounded-lg p-4 active:bg-white/20"
                  activeOpacity={0.8}
                >
                  <View className="mb-3">
                    <Text className="text-white font-medium text-lg mb-2">
                      {project.title}
                    </Text>
                    {project.description && (
                      <Text className="text-gray-300 text-sm mb-3" numberOfLines={2}>
                        {project.description}
                      </Text>
                    )}
                    
                    {/* 키워드 태그들 */}
                    {project.keywords && project.keywords.length > 0 && (
                      <View className="flex-row flex-wrap gap-2 mb-3">
                        {project.keywords.map((keyword: string, index: number) => (
                          <View
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 rounded-full"
                          >
                            <Text className="text-blue-300 text-xs">
                              {keyword}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {/* 기수 및 상태 */}
                    <View className="flex-row items-center gap-4 mb-3">
                      <Text className="text-sm text-gray-400">{project.gen}기</Text>
                      <View className={`px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        <Text className="text-xs">
                          {getStatusText(project.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* 링크들과 상세보기 */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row gap-4">
                      {project.github_url && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleLinkPress(project.github_url);
                          }}
                          className="active:opacity-70"
                        >
                          <Text className="text-blue-400 text-sm">GitHub →</Text>
                        </TouchableOpacity>
                      )}
                      {project.demo_url && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleLinkPress(project.demo_url);
                          }}
                          className="active:opacity-70"
                        >
                          <Text className="text-green-400 text-sm">Demo →</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text className="text-gray-400 text-sm">
                      상세보기 →
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
