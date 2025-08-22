'use client';

import { useState, useEffect } from 'react';
import Navigation from '../../src/components/Navigation';
import { useLanding } from '@prometheus-fe/hooks';

export default function InterviewPage() {
  const { interviews, getInterviews, isLoadingInterviews } = useLanding();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        await getInterviews({ page: 1, size: 20 });
      } catch (error) {
        console.error('인터뷰 조회 실패:', error);
      }
    };

    fetchInterviews();
  }, [getInterviews]);

  return (
    <div className="min-h-screen text-white w-full bg-black">
      <Navigation />
      
      <div className="pt-20 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-kimm-bold mb-4 bg-gradient-to-r from-[#8B0000] via-[#c2402a] to-[#ffa282] bg-clip-text text-transparent">
              INTERVIEW
            </h1>
            <p className="text-xl text-[#e0e0e0]">
              프로메테우스 활동 인터뷰
            </p>
          </div>
          
          {isLoadingInterviews ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {interviews.map((interview) => (
                <div key={interview.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">
                        {interview.member_id.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{interview.member_id}</h3>
                      {interview.gen !== undefined && (
                        <p className="text-sm text-gray-400">{interview.gen}기</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-400">
                            {interview.member_name} ({interview.member_gen}기)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-4">
                    &quot;{interview.content}&quot;
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(interview.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                      활동인터뷰
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">아직 인터뷰가 없습니다</h3>
              <p className="text-gray-400 text-lg">
                프로메테우스 활동 인터뷰를 작성해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
