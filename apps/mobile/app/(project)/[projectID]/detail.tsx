'use client';

import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, SafeAreaView, Text, ScrollView, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { useProject, useImage, useMember } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import AddMemberModal from '../../../components/AddMemberModal';
import { Ionicons } from '@expo/vector-icons';

interface Member {
  id: string;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
  member_name?: string | null;
  member_gen?: number | null;
}

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ show, title, message, confirmText, onConfirm, onCancel }: ConfirmModalProps) {
  if (!show) return null;

  return (
    <Modal visible={show} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white/10 border border-white/20 rounded-lg p-6 w-full max-w-sm">
          <Text className="text-lg font-semibold text-white mb-2">{title}</Text>
          <Text className="text-gray-300 mb-4">{message}</Text>
          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity
              onPress={onCancel}
              className="px-4 py-2 rounded-md bg-white/10 border border-white/20 mr-2"
            >
              <Text className="text-white">취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="px-4 py-2 rounded-md bg-red-600"
            >
              <Text className="text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ProjectDetailPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const projectId = params?.projectID as string;

  const {
    selectedProject,
    projectMembers,
    isLoadingProject,
    isLoadingMembers,
    fetchProject,
    fetchProjectMembers,
    deleteProject,
    addProjectMember,
    updateProjectMember,
    removeProjectMember,
    addProjectLike,
    removeProjectLike,
    isProjectLeader,
    isProjectMember,
  } = useProject();

  const { getMember } = useMember();

  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isLikeUpdating, setIsLikeUpdating] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // 실제 인증 상태 사용
  const { canAccessAdministrator, isAuthenticated } = useAuthStore();
  const canManage = canAccessAdministrator(); // Administrator 이상
  const isLeader = isProjectLeader(parseInt(projectId)); // 현재 사용자가 프로젝트 팀장인지
  const isMember = isProjectMember(parseInt(projectId)); // 현재 사용자가 프로젝트 멤버인지
  const isActiveProject = selectedProject?.status === 'active'; // 프로젝트가 active 상태인지
  
  // Administrator 이상이거나, 프로젝트 멤버이면서 active 상태일 때만 수정 가능
  const canEdit = canManage || (isMember && isActiveProject);
  const canEditMembers = canEdit;
  
  // useImage 훅 사용
  const { getThumbnailUrl, getDefaultImageUrl } = useImage();

  const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('ko-KR') : '');

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'paused': return '중지';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-300 border-green-500/30',
      completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      paused: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  // 기수별 색상 반환
  const getGenColor = (gen: number) => {
    if (gen <= 4) return '#6B7280'; // 4기 이하는 이전기수로 회색
    return '#8B0000';
  };

  const isValidUrl = (url?: string | null): boolean => {
    if (!url || url.trim() === '') return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (projectId) {
      Promise.all([loadProject(), loadMembers()]);
    }
  }, [projectId]);

  // 좋아요 토글 처리
  const handleLikeToggle = async () => {
    if (!selectedProject || likeLoading || isLikeUpdating) return;
    
    // 로그인하지 않은 사용자는 좋아요 기능 사용 불가
    if (!isAuthenticated()) {
      Alert.alert('알림', '로그인이 필요한 기능입니다.');
      return;
    }
    
    try {
      setLikeLoading(true);
      setIsLikeUpdating(true);
      
      if (selectedProject.is_liked) {
        await removeProjectLike(selectedProject.id);
      } else {
        await addProjectLike(selectedProject.id);
      }
      
      // 좋아요 상태만 업데이트
      await loadProject();
    } catch (error: any) {
      console.error('좋아요 처리 실패:', error);
      Alert.alert('오류', '좋아요 처리에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    } finally {
      setLikeLoading(false);
      setIsLikeUpdating(false);
    }
  };

  const loadProject = async () => {
    try {
      setError('');
      await fetchProject(parseInt(projectId));
    } catch (e: any) {
      console.error(e);
      setError(e.message || '프로젝트를 불러오지 못했습니다.');
    }
  };

  const loadMembers = async () => {
    try {
      await fetchProjectMembers(parseInt(projectId), { page: 1, size: 100 });
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(parseInt(projectId));
      Alert.alert('성공', '프로젝트가 삭제되었습니다!');
      router.push('/(project)/project');
    } catch (e: any) {
      Alert.alert('오류', '삭제 실패: ' + (e?.message || e.message));
    } finally {
      setConfirmDelete(false);
    }
  };

  const openAddMember = () => {
    setMemberModalMode('add');
    setSelectedMember(null);
    setShowMemberModal(true);
  };

  const openEditMember = (m: Member) => {
    setMemberModalMode('edit');
    setSelectedMember({ ...m });
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
  };

  const submitMember = async (payload: any) => {
    try {
      if (memberModalMode === 'add') {
        await addProjectMember(parseInt(projectId), payload);
      } else {
        await updateProjectMember(parseInt(projectId), payload.member_id, payload);
      }
      await loadMembers();
      setShowMemberModal(false);
      Alert.alert('성공', '멤버가 저장되었습니다!');
    } catch (e: any) {
      Alert.alert('오류', '멤버 저장 실패: ' + (e?.message || e.message));
    }
  };

  const handleRemoveMember = async (m: Member) => {
    Alert.alert(
      '멤버 삭제',
      '정말 이 멤버를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeProjectMember(parseInt(projectId), m.member_id);
              await loadMembers();
              Alert.alert('성공', '멤버가 삭제되었습니다!');
            } catch (e: any) {
              Alert.alert('오류', '멤버 삭제 실패: ' + (e?.message || e.message));
            }
          }
        }
      ]
    );
  };

  // Loading state
  if (isLoadingProject && !error && !isLikeUpdating) {
    return (
      <View className="flex-1 bg-black">
        <View className="px-4 py-6 border-b border-white/20">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 flex items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">프로젝트 상세</Text>
              <Text className="text-sm text-gray-300">프로젝트 정보 및 팀원</Text>
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

  if (error) {
    return (
      <View className="flex-1 bg-black">
        <View className="p-4">
          <View className="bg-red-500/20 border border-red-500/30 rounded-md p-3">
            <Text className="text-red-400 text-center">{error}</Text>
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
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">프로젝트 상세</Text>
              <Text className="text-sm text-gray-300">프로젝트 정보 및 팀원</Text>
            </View>
          </View>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-300 text-lg">프로젝트를 찾을 수 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
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
              <Text className="text-xl font-bold text-white">프로젝트 상세</Text>
              <Text className="text-sm text-gray-300">프로젝트 정보 및 팀원</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* 프로젝트 제목 및 메타 정보 */}
        <View className="py-6">
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl font-semibold text-white flex-1 mr-2">{selectedProject.title}</Text>
            <View 
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: getGenColor(selectedProject.gen) + '20' }}
            >
              <Text 
                className="text-xs font-medium"
                style={{ color: getGenColor(selectedProject.gen) }}
              >
                {selectedProject.gen <= 4 ? '이전기수' : `${selectedProject.gen}기`}
              </Text>
            </View>
            {/* 좋아요 버튼 */}
            <TouchableOpacity
              onPress={handleLikeToggle}
              disabled={likeLoading || !isAuthenticated()}
              className={`ml-2 p-2 ${
                likeLoading || !isAuthenticated() ? 'opacity-50' : ''
              }`}
            >
                              <Ionicons 
                  name={selectedProject.is_liked ? "heart" : "heart-outline"} 
                  size={20}
                  color={selectedProject.is_liked ? '#ff6b6b' : 'white'}
                />
              <Text className="text-white text-xs text-center mt-1">
                {likeLoading ? '...' : (selectedProject.like_count || 0)}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* 프로젝트 링크 아이콘 */}
          <View className="flex-row items-center space-x-4 mb-6">
            {/* GitHub */}
            {selectedProject.github_url ? (
              <TouchableOpacity
                onPress={() => {
                  // React Native에서는 Linking을 사용해야 함
                  console.log('Open GitHub:', selectedProject.github_url);
                }}
                className="p-2"
              >
                <Ionicons name="logo-github" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <View className="p-2 opacity-50">
                <Ionicons name="logo-github" size={24} color="gray" />
              </View>
            )}
            
            {/* Demo */}
            {selectedProject.demo_url ? (
              <TouchableOpacity
                onPress={() => {
                  console.log('Open Demo:', selectedProject.demo_url);
                }}
                className="p-2"
              >
                <Ionicons name="open-outline" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <View className="p-2 opacity-50">
                <Ionicons name="open-outline" size={24} color="gray" />
              </View>
            )}
          </View>
        </View>

        {/* 수정 버튼 */}
        {isMember && (
          <TouchableOpacity
            onPress={() => router.push(`/(project)/${projectId}/edit`)}
            className="bg-white/10 border border-white/20 rounded-lg py-3 mb-6"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="create-outline" size={20} color="white" />
              <Text className="text-white ml-2 font-semibold">수정</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* 이미지가 없을 때 빈 로고 표시 */}
        {!isValidUrl(selectedProject.thumbnail_url) && !isValidUrl(selectedProject.panel_url) && (
          <View className="mb-8 items-center">
            <View className="w-64 h-64 bg-white/10 rounded-lg items-center justify-center">
              <Ionicons name="folder-outline" size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        )}

        {/* 프로젝트 설명 */}
        <View className="mb-8">
          <View className="bg-white/10 border border-white/20 rounded-lg p-6">
            <Text className="text-gray-300 leading-relaxed">{selectedProject.description}</Text>
          </View>
        </View>

        {/* 프로젝트 이미지 섹션 */}
        {(isValidUrl(selectedProject.thumbnail_url) || isValidUrl(selectedProject.panel_url)) && (
          <View className="mb-8">
            {isValidUrl(selectedProject.thumbnail_url) && (
              <View className="mb-6">
                <Image
                  source={{ uri: getThumbnailUrl(selectedProject.thumbnail_url!, 800) }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
              </View>
            )}
            {isValidUrl(selectedProject.panel_url) && (
              <View className="mb-6">
                <Image
                  source={{ uri: getThumbnailUrl(selectedProject.panel_url!, 1000) }}
                  className="w-full h-64 rounded-lg"
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        )}

        {/* 구성원 섹션 */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="people" size={20} color="white" />
              <Text className="text-lg font-semibold text-white ml-2">구성원</Text>
            </View>
            {canEditMembers && (
              <TouchableOpacity
                onPress={openAddMember}
                className="bg-red-600 rounded-lg px-3 py-2"
              >
                <Text className="text-white text-sm font-semibold">멤버 추가</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingMembers ? (
            <View className="items-center py-4">
              <View className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
            </View>
          ) : (
            <View className="space-y-3">
              {projectMembers.map((m) => (
                <View
                  key={m.id}
                  className="bg-white/10 border border-white/20 rounded-lg p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-2">
                        {m.member_gen !== null && m.member_gen !== undefined && (
                          <View 
                            className="px-2 py-1 rounded-full mr-2"
                            style={{ backgroundColor: '#8B000020' }}
                          >
                            <Text 
                              className="text-xs font-medium"
                              style={{ color: '#8B0000' }}
                            >
                              {m.member_gen}기
                            </Text>
                          </View>
                        )}
                        <Text className="text-lg font-semibold text-white">{m.member_name || '알 수 없음'}</Text>
                        <Text className="text-xs text-gray-300 ml-2">
                          / {m.role === 'team_leader' ? '팀장' : m.role === 'team_member' ? '팀원' : m.role || '팀원'}
                        </Text>
                      </View>
                      {m.contribution && (
                        <Text className="text-xs text-gray-300" numberOfLines={2}>
                          {m.contribution}
                        </Text>
                      )}
                    </View>
                    {canEditMembers && (
                      <View className="flex-row space-x-2">
                        <TouchableOpacity
                          onPress={() => openEditMember(m)}
                          className="p-2"
                        >
                          <Ionicons name="create-outline" size={20} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveMember(m)}
                          className="p-2"
                        >
                          <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {projectMembers.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-gray-400">등록된 구성원이 없습니다.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        show={confirmDelete}
        title="프로젝트 삭제"
        message="정말 삭제하시겠습니까?"
        confirmText="삭제"
        onConfirm={handleDeleteProject}
        onCancel={() => setConfirmDelete(false)}
      />

      <AddMemberModal
        show={showMemberModal}
        mode={memberModalMode}
        member={selectedMember}
        onClose={closeMemberModal}
        onSubmit={submitMember}
      />
    </SafeAreaView>
  );
}
