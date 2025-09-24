'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useImage, useCoffeeChat, useProject } from '@prometheus-fe/hooks';
import RedButton from '@/src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCoffee,
  faTimes,
  faPaperPlane,
  faCircle,
  faFolder,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import { 
  faGithub,
  faNotion,
  faFigma
} from '@fortawesome/free-brands-svg-icons';
import { MemberDetailResponse, Project } from '@prometheus-fe/types';
import Portal from '@/src/components/Portal';
import { useAuthStore } from '@prometheus-fe/stores';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberDetailResponse | null;
}

export default function ProfileModal({
  isOpen,
  onClose,
  member
}: ProfileModalProps) {
  const [modalImageError, setModalImageError] = useState(false);
  const [showCoffeeChat, setShowCoffeeChat] = useState(false);
  const [coffeeChatMessage, setCoffeeChatMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [userProjects, setUserProjects] = useState<Array<Project & { role?: string }>>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const { getThumbnailUrl } = useImage();
  const { createRequest } = useCoffeeChat();
  const { fetchMemberProjectHistory } = useProject();
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setModalImageError(false);
      setShowCoffeeChat(false);
      setCoffeeChatMessage('');
      if (member?.id) {
        loadUserProjects();
      }
    }
  }, [isOpen, member?.id]);

  const loadUserProjects = async () => {
    if (!member?.id) return;
    
    try {
      setIsLoadingProjects(true);
      const data = await fetchMemberProjectHistory(member.id, { 
        size: 10,
        status: 'completed' // 완료된 프로젝트만 조회 (page.tsx와 동일)
      });
      console.log('사용자 프로젝트 데이터:', data); // 디버깅용
      // items는 ProjectWithMembers[] 타입이므로 project 정보만 추출
      const projects = (data.items || []).map(item => ({
        ...item.project,
        role: item.members.find(m => m.member_id === member.id)?.role || 'team_member'
      }));
      setUserProjects(projects);
    } catch (error) {
      console.error('사용자 프로젝트 로드 실패:', error);
      setUserProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleCoffeeChatToggle = () => {
    setShowCoffeeChat(!showCoffeeChat);
    if (!showCoffeeChat) {
      setCoffeeChatMessage('');
    }
  };

  const handleSendCoffeeChat = async () => {
    if (!member || !coffeeChatMessage.trim()) return;
    
    // 자기 자신에게 요청하는지 확인
    if (user && member.id === user.id) {
      alert('자기 자신에게는 커피챗을 요청할 수 없습니다.');
      return;
    }
    
    try {
      setIsRequesting(true);
      await createRequest({
        recipient_id: member.id,
        message: coffeeChatMessage
      });
      setShowCoffeeChat(false);
      setCoffeeChatMessage('');
    } catch (error) {
      console.error('Failed to send coffee chat:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isOpen || !member) return null;

  const getFirstLetter = (name: string) => (name && name.length ? name.trim().charAt(0) : 'U');

  const getStatusText = (status: string) => {
    switch (status) {
      case 'alumni':
        return '알럼나이';
      case 'active':
        return '활동 중';
      default:
        return status;
    }
  };

  const getProjectStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '진행중';
      case 'completed':
        return '완료';
      case 'paused':
        return '중지';
      default:
        return status;
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Prometheus background */}
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0 relative z-10">
          {/* 배경 오버레이 */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

          {/* 모달 컨텐츠 */}
          <div className="inline-block align-middle bg-black/80 backdrop-blur-lg rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle md:max-w-4xl max-w-lg sm:w-full relative border border-white/20 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-shrink-0 border-b border-white/20">
              <div className="text-center w-full">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                  <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-kimm-bold text-white mb-2">멤버 상세 정보</h3>
                
                <button 
                  onClick={onClose} 
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 font-pretendard">
              <div className="mt-6">
                {/* 프로필 섹션 */}
                <div className="flex items-start gap-6 mb-6">
                  {member.profile_image_url && !modalImageError ? (
                    <div className="relative w-24 h-24">
                      <Image
                        src={getThumbnailUrl(member.profile_image_url, 192)}
                        alt={member.name}
                        fill
                        className="rounded-full object-cover"
                        onError={() => setModalImageError(true)}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
                      {getFirstLetter(member.name)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      
                      {'gen' in member && (
                        <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 ${
                          'status' in member && member.status === 'active' 
                            ? 'bg-[#8B0000] text-[#ffa282]' 
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {'status' in member && member.status === 'active' && (
                            <FontAwesomeIcon icon={faCircle} className="w-1 h-1" />
                          )}
                          {member.gen === 0 ? '창립멤버' : `${member.gen}기`}
                        </span>
                      )}
                      <h3 className="text-2xl font-semibold text-white">{member.name}</h3>
                      {member.coffee_chat_enabled && (
                        <div className="relative">
                          <div 
                            className={`w-8 h-8 bg-[#00654D] rounded-full flex items-center justify-center hover:bg-[#004d3a] transition-all duration-300 cursor-pointer ${
                              showCoffeeChat ? 'rotate-180' : ''
                            }`}
                            onClick={handleCoffeeChatToggle}
                          >
                            <FontAwesomeIcon icon={faCoffee} className="w-4 h-4 text-white" />
                          </div>
                          
                          {/* 커피챗 메시지 입력 영역 */}
                          <div className={`absolute top-full left-0 mt-2 w-80 bg-[#1A1A1A] backdrop-blur-lg rounded-lg border border-[#404040] shadow-xl transition-all duration-300 z-20 ${
                            showCoffeeChat 
                              ? 'opacity-100 scale-100 translate-y-0' 
                              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                          }`}>
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <FontAwesomeIcon icon={faCoffee} className="w-4 h-4 text-[#00654D]" />
                                <span className="text-sm font-medium text-white">커피챗 요청</span>
                              </div>
                              
                              <textarea
                                value={coffeeChatMessage}
                                onChange={(e) => setCoffeeChatMessage(e.target.value)}
                                placeholder="커피챗 요청 메시지를 작성해주세요..."
                                rows={3}
                                maxLength={300}
                                className="w-full bg-[#1A1A1A] border border-[#404040] rounded-md px-3 py-2 text-white placeholder-[#e0e0e0] focus:border-[#c2402a] focus:outline-none resize-none"
                              />
                              
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-[#e0e0e0]">
                                  {coffeeChatMessage.length}/300
                                </span>
                                <RedButton
                                  onClick={handleSendCoffeeChat}
                                  disabled={!coffeeChatMessage.trim() || isRequesting}
                                  className="inline-flex items-center gap-2 text-sm"
                                >
                                  {isRequesting ? (
                                    <>
                                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                      <span>전송 중...</span>
                                    </>
                                  ) : (
                                    <>
                                      <FontAwesomeIcon icon={faPaperPlane} className="w-3 h-3" />
                                      <span>전송</span>
                                    </>
                                  )}
                                </RedButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-1">
                      {member.school} {member.major}
                    </p>
                    <p className="text-xs text-gray-400 underline">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-4 text-sm text-white">
                  {/* 자기소개 */}
                  <div>
                    <span className="font-medium text-gray-300">자기소개</span>
                    <div className="mt-2 p-3 bg-white/10 rounded-lg text-sm whitespace-pre-wrap">
                      {member.self_introduction || ''}
                    </div>
                  </div>
                  
                  {/* 이력 */}
                  <div>
                    <span className="font-medium text-gray-300">이력</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {member.history && member.history.length > 0 ? (
                        member.history.map((h: string, i: number) => (
                          <div key={i} className="px-3 py-1 bg-white/10 rounded-lg text-sm">
                            {h}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-400">
                          없음
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 추가 경력 */}
                  <div>
                    <span className="font-medium text-gray-300">추가 경력</span>
                    <div className="mt-2 p-3 bg-white/10 rounded-lg text-sm whitespace-pre-wrap">
                      {member.additional_career || ''}
                    </div>
                  </div>
                  
                  {/* 링크 */}
                  <div>
                    <span className="font-medium text-gray-300">링크</span>
                    <div className="flex gap-2 mt-2">
                      {member.github ? (
                        <a 
                          href={member.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faGithub as any} className="w-4 h-4" />
                          GitHub
                        </a>
                      ) : (
                        <div className="px-3 py-2 bg-white/5 rounded-lg text-sm flex items-center gap-2 opacity-50 cursor-not-allowed">
                          <FontAwesomeIcon icon={faGithub as any} className="w-4 h-4" />
                          GitHub
                        </div>
                      )}
                      {member.notion ? (
                        <a 
                          href={member.notion} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faNotion as any} className="w-4 h-4" />
                          Notion
                        </a>
                      ) : (
                        <div className="px-3 py-2 bg-white/5 rounded-lg text-sm flex items-center gap-2 opacity-50 cursor-not-allowed">
                          <FontAwesomeIcon icon={faNotion as any} className="w-4 h-4" />
                          Notion
                        </div>
                      )}
                      {member.figma ? (
                        <a 
                          href={member.figma} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faFigma as any} className="w-4 h-4" />
                          Figma
                        </a>
                      ) : (
                        <div className="px-3 py-2 bg-white/5 rounded-lg text-sm flex items-center gap-2 opacity-50 cursor-not-allowed">
                          <FontAwesomeIcon icon={faFigma as any} className="w-4 h-4" />
                          Figma
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 프로젝트 목록 */}
                  <div>
                    <span className="font-medium text-gray-300">참여 프로젝트</span>
                    <div className="mt-2">
                      {isLoadingProjects ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                        </div>
                      ) : userProjects.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                          {userProjects.map((project) => (
                            <Link
                              key={project.id}
                              href={`/project/${project.id}`}
                              className="block p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors border border-white/20 group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-white truncate">
                                      {project.title}
                                    </h4>
                                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 flex-shrink-0 ${
                                      project.gen <= 4 ? 'bg-gray-500/20 text-gray-300' : 'bg-[#8B0000] text-[#ffa282]'
                                    }`}>
                                      {project.gen <= 4 ? '이전기수' : `${project.gen}기`}
                                    </span>
                                  </div>
                                  {project.description && (
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                                      {project.description}
                                    </p>
                                  )}
                                  {/* 키워드 표시 */}
                                  {project.keywords && project.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {project.keywords.slice(0, 3).map((keyword, index) => (
                                        <span
                                          key={index}
                                          className="px-2 py-1 text-xs bg-white/20 text-white rounded-full"
                                        >
                                          #{keyword}
                                        </span>
                                      ))}
                                      {project.keywords.length > 3 && (
                                        <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full">
                                          +{project.keywords.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">
                                      {project.role === 'team_leader' ? '팀장' : '팀원'}
                                    </span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">
                                      {getProjectStatusText(project.status)}
                                    </span>
                                  </div>
                                </div>
                                <FontAwesomeIcon 
                                  icon={faExternalLinkAlt} 
                                  className="w-3 h-3 text-gray-400 ml-2 flex-shrink-0 group-hover:text-white transition-colors" 
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          <FontAwesomeIcon icon={faFolder} className="w-8 h-8 mb-2 opacity-50" />
                          <p>참여한 프로젝트가 없습니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
