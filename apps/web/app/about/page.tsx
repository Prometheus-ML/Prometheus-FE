'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMember, useImage } from '@prometheus-fe/hooks';
import GlassCard from '../../src/components/GlassCard';
import { MemberPublicListItem } from '@prometheus-fe/types';

export default function AboutPage() {
  const { getPublicMembers } = useMember();
  const { getThumbnailUrl } = useImage();

  // 상태 관리
  const [executiveMembers, setExecutiveMembers] = useState<MemberPublicListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // 유틸리티 함수들
  const getFirstLetter = (name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  };

  const handleImageError = (memberId: string) => {
    setImageErrors(prev => ({ ...prev, [memberId]: true }));
  };

  // 운영진 목록 조회
  const fetchExecutiveMembers = async () => {
    try {
      setIsLoading(true);
      
      const response = await getPublicMembers({
        page: 1,
        size: 50,
        executive: true
      });

      setExecutiveMembers(response.members || []);
      setImageErrors({});
    } catch (err) {
      console.error('Failed to fetch executive members:', err);
      setExecutiveMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchExecutiveMembers();
  }, []);

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          <GlassCard href="/" className="w-10 h-10 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </GlassCard>
          <div>
            <h1 className="text-xl font-semibold text-white">About</h1>
            <p className="text-sm text-gray-300 mt-1">프로메테우스 소개</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* 프로메테우스 소개 */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">프로메테우스 (Prometheus)</h2>
          <div className="text-gray-300 space-y-4">
            <p>
              프로메테우스는 대학생들이 함께 성장하고 혁신적인 프로젝트를 만들어가는 
              대학 연합 IT 동아리입니다.
            </p>
            <p>
              우리는 기술의 발전과 창의적인 아이디어를 통해 사회에 긍정적인 변화를 
              만들어가고자 합니다.
            </p>
            <p>
              다양한 전공의 학생들이 모여 서로의 지식을 공유하고, 실제 프로젝트를 
              통해 실무 경험을 쌓을 수 있는 플랫폼을 제공합니다.
            </p>
          </div>
        </GlassCard>

        {/* 현 운영진 */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">현 운영진</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {executiveMembers.map((member, index) => (
                <GlassCard
                  key={index}
                  className="p-4 text-center"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative mb-3">
                      {member.profile_image_url && !imageErrors[index] ? (
                        <div className="relative w-20 h-20">
                          <Image
                            src={getThumbnailUrl(member.profile_image_url, 160)}
                            alt={member.name}
                            fill
                            className="rounded-full object-cover"
                            onError={() => handleImageError(index.toString())}
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium text-lg">
                          {getFirstLetter(member.name)}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                    
                    <div className="flex flex-wrap gap-1 justify-center mb-2">
                      {member.gen && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {member.gen}기
                        </span>
                      )}
                      {member.school && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {member.school}
                        </span>
                      )}
                      {member.major && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {member.major}
                        </span>
                      )}
                    </div>

                    {member.history && member.history.length > 0 && (
                      <div className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded">
                        <div className="font-medium mb-1">주요 이력:</div>
                        <div className="space-y-0.5">
                          {member.history.slice(0, 2).map((h: string, idx: number) => (
                            <div key={idx}>• {h}</div>
                          ))}
                          {member.history.length > 2 && (
                            <div className="text-gray-400">+{member.history.length - 2}개 더...</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {!isLoading && executiveMembers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-300">운영진 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </GlassCard>

        {/* 연락처 및 링크 */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">연락처</h2>
          <div className="text-gray-300 space-y-2">
            <p>📧 Email: contact@prometheus.com</p>
            <p>📱 Instagram: @prometheus_official</p>
            <p>🌐 Website: https://prometheus.com</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
