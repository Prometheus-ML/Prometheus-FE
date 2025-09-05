'use client';

import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useProject } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import ProjectForm from '../../../components/projects/ProjectForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';

export default function EditProjectPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const projectId = params?.projectID as string;

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // useProject 훅 사용
  const {
    selectedProject,
    isLoadingProject,
    fetchProject,
    updateProject,
    updateProjectForAdmin,
    isProjectLeader,
    isProjectMember
  } = useProject();
  
  // 권한 확인
  const { canAccessAdministrator } = useAuthStore();
  const canManage = canAccessAdministrator(); // Administrator 이상만 수정 가능
  const isLeader = isProjectLeader(parseInt(projectId)); // 프로젝트 팀장인지 확인
  const isMember = isProjectMember(parseInt(projectId)); // 프로젝트 멤버인지 확인
  const isActiveProject = selectedProject?.status === 'active'; // 프로젝트가 active 상태인지
  
  // Administrator 이상이거나, 프로젝트 멤버이면서 active 상태일 때만 수정 가능
  const canEdit = canManage || (isMember && isActiveProject);

  const loadProject = async () => {
    try {
      setError('');
      await fetchProject(parseInt(projectId));
    } catch (e) {
      console.error('프로젝트 로드 실패:', e);
      setError('프로젝트를 불러오지 못했습니다.');
    }
  };

  const handleSave = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      console.log('Updating project:', formData);
      
      // Admin 권한이 있으면 admin용 API 호출, 아니면 일반 API 호출
      if (canManage) {
        await updateProjectForAdmin(parseInt(projectId), formData);
      } else {
        await updateProject(parseInt(projectId), formData);
      }
      
      Alert.alert('성공', '프로젝트가 수정되었습니다!');
      router.push(`/(project)/${projectId}/detail`);
    } catch (e: any) {
      console.error('프로젝트 수정 실패:', e);
      const errorMessage = e?.message || '프로젝트 수정에 실패했습니다.';
      setError(errorMessage);
      Alert.alert('오류', '저장 실패: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // 권한이 없는 경우 처리
  useEffect(() => {
    if (!canEdit) {
      console.warn('수정 권한이 없습니다.');
    }
  }, [canEdit]);

  // Check permissions
  if (!canEdit) {
    return (
      <View className="flex-1 bg-black">
        <View className="px-4 py-6 border-b border-white/20">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 flex items-center justify-center mr-3"
            >
              <FontAwesomeIcon icon={faArrowLeft} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">프로젝트 수정</Text>
              <Text className="text-sm text-gray-300">프로젝트 정보 수정</Text>
            </View>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-2xl font-bold text-white mb-4 text-center">접근 권한 없음</Text>
          <Text className="text-gray-300 mb-4 text-center">
            {!isMember 
              ? '프로젝트 멤버만 수정할 수 있습니다.' 
              : !isActiveProject 
                ? '완료되거나 중지된 프로젝트는 수정할 수 없습니다.' 
                : '수정 권한이 없습니다.'
            }
          </Text>
          <TouchableOpacity
            onPress={() => router.push(`/(project)/${projectId}/detail`)}
            className="bg-red-600 rounded-lg px-4 py-3"
          >
            <View className="flex-row items-center">
              <FontAwesomeIcon icon={faArrowLeft} color="white" />
              <Text className="text-white ml-2 font-semibold">프로젝트 상세로 돌아가기</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoadingProject) {
    return (
      <View className="flex-1 bg-black">
        <View className="px-4 py-6 border-b border-white/20">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 flex items-center justify-center mr-3"
            >
              <FontAwesomeIcon icon={faArrowLeft} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">프로젝트 수정</Text>
              <Text className="text-sm text-gray-300">프로젝트 정보 수정</Text>
            </View>
          </View>
        </View>
        <View className="flex-1 justify-center items-center">
          <View className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          <Text className="text-white mt-2">로딩 중...</Text>
        </View>
      </View>
    );
  }

  if (error && !selectedProject) {
    return (
      <View className="flex-1 bg-black">
        <View className="px-4 py-6 border-b border-white/20">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 flex items-center justify-center mr-3"
            >
              <FontAwesomeIcon icon={faArrowLeft} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">프로젝트 수정</Text>
              <Text className="text-sm text-gray-300">프로젝트 정보 수정</Text>
            </View>
          </View>
        </View>
        <View className="px-4 py-6">
          <View className="bg-red-500/20 border border-red-500/30 rounded-md p-3 mb-4">
            <Text className="text-red-400 text-center">{error}</Text>
          </View>
          <View className="space-y-2">
            <TouchableOpacity
              onPress={loadProject}
              className="bg-red-600 rounded-lg py-3"
            >
              <Text className="text-white text-center font-semibold">다시 시도</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/(project)/${projectId}/detail`)}
              className="bg-white/10 border border-white/20 rounded-lg py-3"
            >
              <View className="flex-row items-center justify-center">
                <FontAwesomeIcon icon={faArrowLeft} color="white" />
                <Text className="text-white ml-2 font-semibold">프로젝트 상세로 돌아가기</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!selectedProject) {
    return (
      <View className="flex-1 bg-black">
        <View className="px-4 py-6 border-b border-white/20">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 flex items-center justify-center mr-3"
            >
              <FontAwesomeIcon icon={faArrowLeft} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">프로젝트 수정</Text>
              <Text className="text-sm text-gray-300">프로젝트 정보 수정</Text>
            </View>
          </View>
        </View>
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-gray-300 text-lg mb-4 text-center">프로젝트를 찾을 수 없습니다.</Text>
          <TouchableOpacity
            onPress={() => router.push('/(project)/project')}
            className="bg-red-600 rounded-lg px-4 py-3"
          >
            <View className="flex-row items-center">
              <FontAwesomeIcon icon={faArrowLeft} color="white" />
              <Text className="text-white ml-2 font-semibold">프로젝트 목록으로 돌아가기</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* 헤더 */}
      <View className="px-4 py-6 border-b border-white/20">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 flex items-center justify-center mr-3"
          >
            <FontAwesomeIcon icon={faArrowLeft} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-white">프로젝트 수정</Text>
            <Text className="text-sm text-gray-300">프로젝트 정보 수정</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* 에러 메시지 표시 */}
        {error && selectedProject && (
          <View className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md">
            <Text className="text-red-400 text-center">{error}</Text>
          </View>
        )}

        {/* 제출 중 상태 표시 */}
        {isSubmitting && (
          <View className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-md">
            <Text className="text-blue-400 text-center">프로젝트를 수정하는 중...</Text>
          </View>
        )}

        <ProjectForm 
          initial={{
            ...selectedProject,
            description: selectedProject.description || '',
            keywords: selectedProject.keywords || [],
            github_url: selectedProject.github_url || '',
            demo_url: selectedProject.demo_url || '',
            panel_url: selectedProject.panel_url || '',
            thumbnail_url: selectedProject.thumbnail_url || '',
            status: selectedProject.status as 'active' | 'completed' | 'paused',
          }}
          mode="edit"
          showStatus={false}
          onSubmit={handleSave}
        />
      </ScrollView>
    </View>
  );
}
