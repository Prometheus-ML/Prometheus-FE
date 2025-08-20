'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEvent, useMyAttendance } from '@prometheus-fe/hooks';
import { Event, EventFilter, AttendanceStatus, Attendance } from '@prometheus-fe/types';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';
import EventModal  from '../../src/components/EventModal';
import AttendanceModal from '../../src/components/AttendanceModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faEye, 
  faCheck, 
  faClock, 
  faUsers, 
  faStar, 
  faArrowLeft,
  faList,
  faTimes,
  faCalendar,
  faEdit,
  faTrash,
  faCheckCircle,
  faKey
} from '@fortawesome/free-solid-svg-icons';

// 기수별 색상 반환
const getGenColor = (gen: number) => {
  return 'bg-[#8B0000] text-[#ffa282]';
};

// 이벤트 상태 반환
const getEventStatus = (event: Event) => {
  const isUpcoming = event.startTime > new Date();
  const isOngoing = event.startTime <= new Date() && event.endTime >= new Date();
  const isPast = event.endTime < new Date();

  if (isOngoing) return { text: '진행중', color: 'bg-green-500/20 text-green-300' };
  if (isUpcoming) return { text: '예정', color: 'bg-blue-500/20 text-blue-300' };
  return { text: '종료', color: 'bg-gray-500/20 text-gray-300' };
};

// EventCardSkeleton Component
const EventCardSkeleton = () => (
  <div className="p-4 animate-pulse">
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1 mr-2">
          <div className="w-32 h-6 bg-gray-600 rounded"></div>
          <div className="w-16 h-5 bg-gray-600 rounded"></div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-5 w-16 bg-gray-600 rounded-full"></div>
        <div className="h-5 w-16 bg-gray-600 rounded-full"></div>
      </div>
      <div className="h-10">
        <div className="w-full h-4 bg-gray-600 rounded mb-2"></div>
        <div className="w-3/4 h-4 bg-gray-600 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 bg-gray-600 rounded mt-0.5"></div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-600 rounded w-32"></div>
            <div className="h-4 bg-gray-600 rounded w-32"></div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-600 rounded w-24"></div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-16 bg-gray-600 rounded"></div>
          <div className="h-6 w-20 bg-gray-600 rounded"></div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-12 bg-gray-600 rounded"></div>
      </div>
    </div>
  </div>
);

// 메인 유저 이벤트 페이지
export default function EventPage() {
  const { 
    events, 
    attendableEvents,
    pagination, 
    attendablePagination,
    isLoadingEvents, 
    isLoadingAttendableEvents,
    eventListError,
    attendableEventListError,
    fetchEvents,
    fetchAttendableEvents
  } = useEvent();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filter, setFilter] = useState<EventFilter>({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // 한 페이지당 12개 (3x4 그리드)

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // 사용자의 기수로 필터링
    const initialFilter: EventFilter = {};
    if (user?.gen) {
      initialFilter.gen = user.gen;
    }
    setFilter(initialFilter);
    fetchEvents(currentPage, pageSize, initialFilter);
    fetchAttendableEvents(1, 10, initialFilter); // 출석 가능한 이벤트는 최대 10개만
  }, [fetchEvents, fetchAttendableEvents, user, currentPage, pageSize]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

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

  return (
    <div className="md:max-w-6xl max-w-lg mx-auto min-h-screen font-pretendard">
      {/* 헤더 */}
      <header className="mx-4 px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">이벤트</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 이벤트 목록</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RedButton 
              onClick={() => setShowAttendanceModal(true)}
              className="inline-flex items-center p-2"
            >
              <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
            </RedButton>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 현재 출석 가능한 이벤트들 */}
        {isLoadingAttendableEvents ? (
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-400" />
                현재 출석 가능한 이벤트
              </h2>
              <p className="text-white/70">지금 출석 체크할 수 있는 이벤트</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <GlassCard key={index} className="overflow-hidden">
                  <EventCardSkeleton />
                </GlassCard>
              ))}
            </div>
          </div>
        ) : attendableEvents.length > 0 ? (
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-400" />
                현재 출석 가능한 이벤트
              </h2>
              <p className="text-white/70">지금 출석 체크할 수 있는 이벤트</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendableEvents.map((event) => (
                <GlassCard 
                  key={event.id}
                  className="overflow-hidden hover:bg-white/20 transition-colors border border-white/20 cursor-pointer group"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="p-4">
                    <div className="space-y-3">
                      {/* 제목과 기수 */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <h3 className="text-lg font-semibold text-white line-clamp-2">
                            {event.title}
                          </h3>
                          <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex font-semibold items-center gap-1 flex-shrink-0 ${getGenColor(event.currentGen)}`}>
                            {event.currentGen}기
                          </span>
                        </div>
                      </div>

                      {/* 이벤트 타입과 상태 */}
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                          {event.eventType}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getEventStatus(event).color}`}>
                          {getEventStatus(event).text}
                        </span>
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

                      {/* 날짜와 장소 */}
                      <div className="space-y-2 text-sm text-white/60">
                        <div className="flex items-start space-x-2">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mt-0.5" />
                          <div>
                            <div>{event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -</div>
                            <div>{event.endTime.toLocaleDateString()} {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {/* 아이콘들 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {event.isAttendanceRequired && (
                            <FontAwesomeIcon 
                              icon={faCheckCircle} 
                              className="w-4 h-4 text-green-400" 
                              title="출석 필수"
                            />
                          )}
                          {event.isAttendanceCodeRequired && (
                            <FontAwesomeIcon 
                              icon={faKey} 
                              className="w-4 h-4 text-blue-400" 
                              title="출석 코드 필수"
                            />
                          )}
                          {event.hasAttendanceCode && (
                            <FontAwesomeIcon 
                              icon={faStar} 
                              className="w-4 h-4 text-yellow-400" 
                              title="출석 코드 존재"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ) : null}

        {/* 전체 이벤트 목록 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">전체 이벤트 목록</h2>
        </div>

        {/* 이벤트 목록 */}
        {isLoadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} className="overflow-hidden">
                <EventCardSkeleton />
              </GlassCard>
            ))}
          </div>
        ) : eventListError ? (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-center">
            {eventListError}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <GlassCard 
                key={event.id}
                className="overflow-hidden hover:bg-white/20 transition-colors border border-white/20 cursor-pointer group"
                onClick={() => handleEventClick(event)}
              >
                <div className="p-4">
                  <div className="space-y-3">
                    {/* 제목과 기수 */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <h3 className="text-lg font-semibold text-white line-clamp-2">
                          {event.title}
                        </h3>
                        <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex font-semibold items-center gap-1 flex-shrink-0 ${getGenColor(event.currentGen)}`}>
                          {event.currentGen}기
                        </span>
                      </div>
                    </div>

                    {/* 이벤트 타입과 상태 */}
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                        {event.eventType}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getEventStatus(event).color}`}>
                        {getEventStatus(event).text}
                      </span>
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

                    {/* 날짜와 장소 */}
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex items-start space-x-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mt-0.5" />
                        <div>
                          <div>{event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -</div>
                          <div>{event.endTime.toLocaleDateString()} {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* 아이콘들 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {event.isAttendanceRequired && (
                          <FontAwesomeIcon 
                            icon={faCheckCircle} 
                            className="w-4 h-4 text-green-400" 
                            title="출석 필수"
                          />
                        )}
                        {event.isAttendanceCodeRequired && (
                          <FontAwesomeIcon 
                            icon={faKey} 
                            className="w-4 h-4 text-blue-400" 
                            title="출석 코드 필수"
                          />
                        )}
                        {event.hasAttendanceCode && (
                          <FontAwesomeIcon 
                            icon={faStar} 
                            className="w-4 h-4 text-yellow-400" 
                            title="출석 코드 존재"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {!isLoadingEvents && !eventListError && events.length === 0 && (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">이벤트가 없습니다.</h3>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoadingEvents && !eventListError && events.length > 0 && renderPagination()}

        {/* 이벤트 상세 모달 */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          event={selectedEvent}
        />

        {/* 내 출석 목록 모달 */}
        <AttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          event={null}
          isAdmin={false}
        />
      </div>
    </div>
  );
}
