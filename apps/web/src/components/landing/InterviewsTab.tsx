'use client';

import { useLanding } from '@prometheus-fe/hooks';
import { LandingInterview } from '@prometheus-fe/types';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';

interface InterviewsTabProps {
  isLoading: boolean;
  interviews: LandingInterview[];
  onRefresh: () => void;
}

export default function InterviewsTab({ isLoading, interviews, onRefresh }: InterviewsTabProps) {
  const { deleteAdminInterview } = useLanding();

  return (
    <GlassCard className="overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">인터뷰 목록</h2>
            <RedButton className="inline-flex items-center">
              <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
              인터뷰 추가
            </RedButton>
          </div>
          
          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faStar} className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">인터뷰가 없습니다</h3>
              <p className="text-gray-300">첫 번째 인터뷰를 추가해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {interviews.map((interview) => (
                <GlassCard key={interview.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{interview.member_id}</h3>
                      {interview.gen !== undefined && (
                        <p className="text-sm text-gray-400">{interview.gen}기</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteAdminInterview(interview.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="font-medium">기수:</span> {interview.gen}기</p>
                    <p><span className="font-medium">내용:</span> {interview.content}</p>
                    <p><span className="font-medium">작성일:</span> {new Date(interview.created_at).toLocaleDateString()}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
