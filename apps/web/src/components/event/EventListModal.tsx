'use client';

import { useState, useEffect } from 'react';
import { Event, EventFilter } from '@prometheus-fe/types';
import { useEvent } from '@prometheus-fe/hooks';
import Portal from '@/src/components/Portal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faCheckCircle,
  faKey,
  faCircle,
  faMapMarkerAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

interface EventListModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter?: EventFilter;
}

// 기수별 색상 반환
const getGenColor = (gen: number) => {
  return 'bg-[#8B0000] text-[#ffa282]';
};

// 행사 상태 반환
const getEventStatus = (event: Event) => {
  const isUpcoming = event.startTime > new Date();
  const isOngoing = event.startTime <= new Date() && event.endTime >= new Date();
  const isPast = event.endTime < new Date();

  if (isOngoing) return { text: '진행중', color: 'text-[#3FFF4F]' };
  if (isUpcoming) return { text: '예정', color: 'text-[#F8D061]' };
  return { text: '종료', color: 'text-[#BBBBBB]' };
};

// EventCardSkeleton Component
const EventCardSkeleton = () => (
  <div className="bg-white/10 rounded-lg p-4 border border-white/20 animate-pulse">
    <div className="space-y-3">
      {/* 제목과 기수 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1 mr-2">
          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          <div className="w-48 h-6 bg-gray-600 rounded flex-1"></div>
          <div className="w-16 h-5 bg-gray-600 rounded-full"></div>
        </div>
      </div>

      {/* 행사 타입과 아이콘 */}
      <div className="flex items-center space-x-2">
        <div className="h-5 w-16 bg-gray-600 rounded"></div>
        <div className="w-3 h-3 bg-gray-600 rounded"></div>
        <div className="w-3 h-3 bg-gray-600 rounded"></div>
      </div>

      {/* 설명 */}
      <div className="h-10">
        <div className="w-full h-4 bg-gray-600 rounded mb-2"></div>
        <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
      </div>

      {/* 장소와 날짜 */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-600 rounded"></div>
          <div className="w-24 h-4 bg-gray-600 rounded"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-600 rounded"></div>
          <div className="w-32 h-4 bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function EventListModal({ 
  isOpen, 
  onClose, 
  filter
}: EventListModalProps) {
  const { 
    events, 
    pagination, 
    isLoadingEvents, 
    eventListError,
    fetchEvents
  } = useEvent();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  useEffect(() => {
    if (isOpen) {
      fetchEvents(currentPage, pageSize, filter);
    }
  }, [isOpen, currentPage, pageSize, filter, fetchEvents]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!pagination) return null;
    
    const totalPages = Math.ceil(pagination.total / pageSize);
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 이전 페이지 버튼
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-md text-white hover:bg-white/20 transition-colors"
        >
          이전
        </button>
      );
    }

    // 페이지 번호들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm border rounded-md transition-colors ${
            i === currentPage
              ? 'bg-red-500/20 border-red-500/30 text-red-300'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          }`}
        >
          {i}
        </button>
      );
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-md text-white hover:bg-white/20 transition-colors"
        >
          다음
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        {pages}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0 relative z-10">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

          <div className="inline-block align-middle bg-black/80 backdrop-blur-lg rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle md:max-w-6xl max-w-lg sm:w-full relative border border-white/20 max-h-[90vh] flex flex-col">
            {/* 헤더 */}
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-shrink-0">
              <div className="text-center w-full">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                  <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-kimm-bold text-white mb-2">
                  전체 행사 목록
                </h3>
                <p className="text-sm text-gray-300">
                  모든 행사 목록을 확인하세요
                </p>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="inline-flex justify-center rounded-lg border border-white/30 shadow-sm px-4 py-2 bg-white/10 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
              {/* 행사 목록 */}
              {isLoadingEvents ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <EventCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : eventListError ? (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-center">
                  {eventListError}
                </div>
              ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {events.map((event) => (
                     <div 
                       key={event.id}
                       className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors group"
                     >
                      <div className="space-y-3">
                        {/* 제목과 기수 */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <FontAwesomeIcon icon={faCircle} className={`w-2 h-2 ${getEventStatus(event).color}`} />
                            <h3 className="text-lg font-semibold text-white line-clamp-2">
                              {event.title}
                            </h3>
                            <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex font-semibold items-center gap-1 flex-shrink-0 ${getGenColor(event.currentGen)}`}>
                              {event.currentGen}기
                            </span>
                          </div>
                        </div>

                        {/* 행사 타입과 출석 코드 아이콘 */}
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded">
                            {event.eventType}
                          </span>
                          {event.isAttendanceRequired && (
                            <FontAwesomeIcon 
                              icon={faCheckCircle} 
                              className="w-3 h-3 text-[#5B9E56]" 
                              title="출석 필수"
                            />
                          )}
                          {event.isAttendanceCodeRequired && (
                            <FontAwesomeIcon 
                              icon={faKey} 
                              className="w-3 h-3 text-[#BBBBBB]" 
                              title="출석 코드 필수"
                            />
                          )}
                        </div>

                        {/* 설명 (두 줄 고정) */}
                        <div className="h-10">
                          {event.description ? (
                            <p className="text-gray-300 text-sm line-clamp-2">
                              {event.description}
                            </p>
                          ) : (
                            <div className="h-10"></div>
                          )}
                        </div>

                        {/* 장소와 날짜 */}
                        <div className="space-y-2 text-sm text-white/60">
                          {event.location && (
                            <div className="flex items-center space-x-2">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                            <span>{event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {event.endTime.toLocaleDateString()} {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoadingEvents && !eventListError && events.length === 0 && (
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-white">행사가 없습니다.</h3>
                  </div>
                </div>
              )}

              {/* 페이지네이션 */}
              {!isLoadingEvents && !eventListError && events.length > 0 && renderPagination()}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
