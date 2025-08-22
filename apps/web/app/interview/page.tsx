'use client';

import { useState, useEffect } from 'react';
import { useLanding } from '@prometheus-fe/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function InterviewPage() {
  const { interviews, getInterviews, isLoadingInterviews } = useLanding();
  const [currentGen, setCurrentGen] = useState<number>(1);
  const [availableGens, setAvailableGens] = useState<number[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        await getInterviews({ page: 1, size: 100 });
      } catch (error) {
        console.error('인터뷰 조회 실패:', error);
      }
    };

    fetchInterviews();
  }, [getInterviews]);

  // 사용 가능한 기수 추출
  useEffect(() => {
    if (interviews.length > 0) {
      const gens = [...new Set(interviews.map(interview => interview.gen).filter(gen => gen !== undefined))].sort((a, b) => a - b);
      setAvailableGens(gens);
      if (gens.length > 0 && !gens.includes(currentGen)) {
        setCurrentGen(gens[0]);
      }
    }
  }, [interviews, currentGen]);

  // 현재 기수의 인터뷰만 필터링
  const currentGenInterviews = interviews.filter(interview => interview.gen === currentGen);

  const handlePrevGen = () => {
    const currentIndex = availableGens.indexOf(currentGen);
    if (currentIndex > 0) {
      setCurrentGen(availableGens[currentIndex - 1]);
    }
  };

  const handleNextGen = () => {
    const currentIndex = availableGens.indexOf(currentGen);
    if (currentIndex < availableGens.length - 1) {
      setCurrentGen(availableGens[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen text-white w-full bg-black font-pretendard">
      <div className="pt-16 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-kimm-bold mb-4 bg-gradient-to-r from-[#8B0000] via-[#c2402a] to-[#ffa282] bg-clip-text text-transparent">
              INTERVIEW
            </h1>
            <p className="text-xl text-[#e0e0e0]">
              프로메테우스 활동 인터뷰
            </p>
          </div>

          {/* 기수별 페이지네이션 */}
          {availableGens.length > 0 && (
            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={handlePrevGen}
                disabled={availableGens.indexOf(currentGen) === 0}
                className="flex items-center px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
                {availableGens.indexOf(currentGen) > 0 ? `${availableGens[availableGens.indexOf(currentGen) - 1]}기 후기` : ''}
              </button>
              
              <div className="mx-6 px-6 py-2 bg-[#8B0000] text-[#ffa282] rounded-lg">
                {currentGen}기 후기
              </div>
              
              <button
                onClick={handleNextGen}
                disabled={availableGens.indexOf(currentGen) === availableGens.length - 1}
                className="flex items-center px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {availableGens.indexOf(currentGen) < availableGens.length - 1 ? `${availableGens[availableGens.indexOf(currentGen) + 1]}기 후기` : ''}
                <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
              </button>
            </div>
          )}
          
          {isLoadingInterviews ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : currentGenInterviews.length > 0 ? (
            <div className="space-y-8 mt-12">
              {currentGenInterviews.map((interview, index) => (
                <div 
                  key={interview.id} 
                  className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="bg-white/10 border border-white/20 rounded-lg p-6 max-w-2xl hover:bg-white/20 transition-colors duration-300">
                    <div className="flex items-center mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">
                            {interview.member_name || '알 수 없음'}
                          </h3>
                          {interview.member_gen != undefined && (
                            <span className={`px-1.5 py-0.5 text-xs rounded-full flex font-semibold items-center bg-[#8B0000] text-[#ffa282]`}>
                              {interview.member_gen}기
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      &quot;{interview.content}&quot;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">아직 인터뷰가 없습니다</h3>
              <p className="text-gray-400 text-lg">
                {currentGen}기 활동 인터뷰를 작성해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
