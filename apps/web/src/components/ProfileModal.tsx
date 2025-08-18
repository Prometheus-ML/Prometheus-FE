'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useImage, useCoffeeChat } from '@prometheus-fe/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCoffee,
  faTimes,
  faPaperPlane,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import { 
  faGithub,
  faNotion,
  faFigma
} from '@fortawesome/free-brands-svg-icons';
import { MemberDetailResponse } from '@prometheus-fe/types';

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
  const { getThumbnailUrl } = useImage();
  const { requestCoffeeChat } = useCoffeeChat();

  useEffect(() => {
    if (isOpen) {
      setModalImageError(false);
      setShowCoffeeChat(false);
      setCoffeeChatMessage('');
    }
  }, [isOpen]);

  const handleCoffeeChatToggle = () => {
    setShowCoffeeChat(!showCoffeeChat);
    if (!showCoffeeChat) {
      setCoffeeChatMessage('');
    }
  };

  const handleSendCoffeeChat = async () => {
    if (!member || !coffeeChatMessage.trim()) return;
    
    try {
      setIsRequesting(true);
      await requestCoffeeChat(member.id, coffeeChatMessage);
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

  return (
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
                    
                    {member.gen && (
                      <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${
                        member.status === 'active' 
                          ? 'bg-[#8B0000] text-[#ffa282]' 
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {member.status === 'active' && (
                          <FontAwesomeIcon icon={faCircle} className="w-2 h-2" />
                        )}
                        {member.gen}기
                      </span>
                    )}
                    <h3 className="text-2xl font-semibold text-white">{member.name}</h3>
                    {member.coffee_chat_enabled && (
                      <div className="relative">
                        <div 
                          className={`w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center hover:bg-[#c2402a] transition-all duration-300 cursor-pointer ${
                            showCoffeeChat ? 'rotate-180' : ''
                          }`}
                          onClick={handleCoffeeChatToggle}
                        >
                          <FontAwesomeIcon icon={faCoffee} className="w-4 h-4 text-white" />
                        </div>
                        
                        {/* 커피챗 메시지 입력 영역 */}
                        <div className={`absolute top-full left-0 mt-2 w-80 bg-black/90 backdrop-blur-lg rounded-lg border border-white/20 shadow-xl transition-all duration-300 z-20 ${
                          showCoffeeChat 
                            ? 'opacity-100 scale-100 translate-y-0' 
                            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}>
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <FontAwesomeIcon icon={faCoffee} className="w-4 h-4 text-[#FF4500]" />
                              <span className="text-sm font-medium text-white">커피챗 요청</span>
                            </div>
                            
                            <textarea
                              value={coffeeChatMessage}
                              onChange={(e) => setCoffeeChatMessage(e.target.value)}
                              placeholder="커피챗 요청 메시지를 작성해주세요..."
                              rows={3}
                              maxLength={300}
                              className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:border-[#FF4500] focus:outline-none resize-none"
                            />
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-gray-400">
                                {coffeeChatMessage.length}/300
                              </span>
                              <button
                                onClick={handleSendCoffeeChat}
                                disabled={!coffeeChatMessage.trim() || isRequesting}
                                className="flex items-center gap-2 bg-[#FF4500] text-white px-3 py-1.5 rounded-md hover:bg-[#c2402a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
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
                              </button>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
