'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanding } from '@prometheus-fe/hooks';

export default function AboutPage() {
  const { histories, getHistories, isLoadingHistories } = useLanding();

  // 히스토리 타임라인 렌더링을 위한 함수
  const renderHistoryTimeline = () => {
    // histories가 배열이 아닌 경우 빈 배열로 처리
    if (!Array.isArray(histories)) {
      return (
        <div className="text-center py-16">
          <p className="text-gray-400">히스토리 데이터를 불러올 수 없습니다.</p>
        </div>
      );
    }

    // 히스토리 데이터를 타임라인 형태로 변환
    const historyItems = histories.map((history) => ({
      id: `history-${history.id}`,
      title: history.title,
      desc: [], // 히스토리는 설명이 없으므로 빈 배열
      date: new Date(history.date),
      gen: history.gen
    }));

    // 날짜순으로 정렬 (최신순)
    historyItems.sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
      <div className="space-y-8">
        {historyItems.map((item) => (
          <div key={item.id} className="flex items-start space-x-6">
            <div className="flex-shrink-0 w-24 text-center">
              <div className="w-3 h-3 bg-[#B91C1C] rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-400">
                {item.date.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex-1 bg-white/10 rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                {item.gen && (
                  <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-300 rounded">
                    {item.gen}기
                  </span>
                )}
              </div>
              {item.desc.map((desc, idx) => (
                <p key={idx} className="text-sm text-gray-300">{desc}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 초기 로드
  useEffect(() => {
    getHistories();
  }, [getHistories]);

  return (
    <div className="text-white bg-black">
             {/* Think Ahead Section */}
       <div className="relative w-screen overflow-hidden">
         <Image
           src="/images/landing4.png"
           alt="think ahead"
           width={1920}
           height={1080}
           className="object-cover w-full h-screen"
         />
         
         <div className="absolute w-full transform -translate-x-1/2 -translate-y-1/2 top-[60%] left-[50%] text-center font-semibold">
           <p className="text-xl font-kimm-bold md:text-4xl lg:text-7xl md:mb-1 lg:mb-3">Think Ahead, </p>
           <p className="text-xl font-kimm-bold md:text-4xl lg:text-7xl">Challenge<span className="text-[#B91C1C]"> On</span> !</p>
         </div>
       </div>

       {/* Prometheus Description Section */}
       <div className="relative w-screen overflow-hidden -mt-[20vh] mb-16 md:mb-64">
         <Image
           src="/images/landing5.png"
           alt="prometheus description"
           width={1920}
           height={1080}
           className="object-cover w-full h-screen"
         />
         
         <div className="absolute w-full transform -translate-x-1/2 -translate-y-1/2 top-[50%] left-[50%] text-center">
           <Image
             src="/icons/logo.png"
             alt="logo2"
             width={200}
             height={200}
             className="object-cover mx-auto w-[20%] lg:w-[15%] mb-2 md:mb-6 lg:mb-8"
           />
           <p className="text-xl md:text-3xl lg:text-5xl font-kimm-bold mb-6 md:mb-16 lg:mb-24">PROMETHEUS</p>
           <p className="text-xs md:text-lg lg:text-2xl tracking-wide mb-1 md:mb-2 lg:mb-3">
             <span className="font-semibold">프로메테우스</span>는 먼저 생각하는 사람, <span className="font-semibold">선구자</span>를 의미합니다.
           </p>
           <p className="text-xs md:text-lg lg:text-2xl tracking-wide mb-3 md:mb-3 lg:mb-4">
             선구자들의 가치 있는 도전을 통해 더 나은 세상을 만들어가고자 합니다.
           </p>
         </div>
       </div>

      <div className="mx-auto max-w-6xl flex-row items-center pt-40 pb-24">
                 {/* Our Vision */}
         <div className="mb-48">
           <p className="mx-auto text-center font-semibold font-kimm-bold text-lg md:text-3xl lg:text-5xl mb-10 md:mb-24 lg:mb-32">Our Vision</p>
           <Image
             src="/images/vision.png"
             alt="vision"
             width={1200}
             height={600}
             className="object-cover w-[90%] mx-auto mb-2 md:mb-6 lg:mb-8"
           />
         </div>

        {/* Our History */}
        <div className="mb-48">
          <p className="mx-auto text-center font-semibold font-kimm-bold text-lg md:text-3xl lg:text-5xl mb-10 md:mb-24 lg:mb-32">Our History</p>
          <div className="w-[90%] mx-auto">
            {isLoadingHistories ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-red-200 border-t-red-600 rounded-full"></div>
              </div>
                         ) : (
               renderHistoryTimeline()
             )}
          </div>
        </div>
      </div>
    </div>
  );
}