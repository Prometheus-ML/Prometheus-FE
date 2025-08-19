'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEvent, useMyAttendance } from '@prometheus-fe/hooks';
import { Event, EventFilter, AttendanceStatus, Attendance } from '@prometheus-fe/types';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';
import EventModal from '../../src/components/EventModal';

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
  faTimes
} from '@fortawesome/free-solid-svg-icons';

// 내 출석 목록 모달 컴포넌트
function MyAttendanceListModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { myAttendances, isLoading, fetchMyAttendances } = useMyAttendance();

  useEffect(() => {
    if (isOpen) {
      fetchMyAttendances();
    }
  }, [isOpen, fetchMyAttendances]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'late':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'absent':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'excused':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return '출석';
      case 'late':
        return '지각';
      case 'absent':
        return '결석';
      case 'excused':
        return '사유결석';
      default:
        return '미정';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">내 출석 목록</h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="md:max-w-4xl max-w-lg mx-auto flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        ) : myAttendances.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faList} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">출석 기록이 없습니다</h3>
            <p className="text-gray-300">아직 참여한 이벤트가 없거나 출석 체크를 하지 않았습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myAttendances.map((attendance) => (
              <div key={attendance.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(attendance.status)}`}>
                      {getStatusText(attendance.status)}
                    </span>
                    <span className="text-white font-medium">
                      {attendance.memberName}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {attendance.checkedInAt && (
                      <span>
                        출석 시간: {new Date(attendance.checkedInAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-300">
                  <div className="flex items-center space-x-2 mb-1">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                    <span>이벤트 ID: {attendance.eventId}</span>
                  </div>
                  {attendance.reason && (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                      <span>사유: {attendance.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// 이벤트 카드 컴포넌트
function EventCard({ 
  event, 
  onClick 
}: { 
  event: Event; 
  onClick: () => void;
}) {
  const isUpcoming = event.startTime > new Date();
  const isOngoing = event.startTime <= new Date() && event.endTime >= new Date();
  const isPast = event.endTime < new Date();

  const getEventStatus = () => {
    if (isOngoing) return { text: '진행중', color: 'bg-green-500/20 text-green-300' };
    if (isUpcoming) return { text: '예정', color: 'bg-blue-500/20 text-blue-300' };
    return { text: '종료', color: 'bg-gray-500/20 text-gray-300' };
  };

  const status = getEventStatus();

  return (
    <GlassCard 
      className="p-4 hover:bg-white/15 cursor-pointer transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">{event.title}</h3>
          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
            {event.eventType}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
            {status.text}
          </span>
        </div>
        {event.isAttendanceRequired && (
          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
            출석필수
          </span>
        )}
        {event.isAttendanceCodeRequired && (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
            코드필수
          </span>
        )}
      </div>

      {event.description && (
        <p className="text-white/70 text-sm mb-3 line-clamp-2">{event.description}</p>
      )}

      <div className="space-y-2 text-sm text-white/60">
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
          <span>
            {event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {event.location && (
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
          <span>{event.currentGen}기 대상</span>
        </div>
      </div>
    </GlassCard>
  );
}

// 이벤트 카드 스켈레톤 컴포넌트
function EventCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden border border-white/20">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="h-6 bg-white/10 rounded mb-2 animate-pulse"></div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="h-5 w-16 bg-white/10 rounded-full animate-pulse"></div>
              <div className="h-5 w-20 bg-white/10 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="h-4 bg-white/10 rounded mb-3 animate-pulse"></div>
        <div className="h-4 bg-white/10 rounded mb-3 animate-pulse w-3/4"></div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="h-4 bg-white/10 rounded w-16 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-16 bg-white/10 rounded animate-pulse"></div>
            <div className="h-6 w-12 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// 메인 이벤트 스켈레톤 컴포넌트
function MainEventSkeleton() {
  return (
    <GlassCard className="p-6 mb-6 border border-white/20">
      <div className="text-center mb-4">
        <div className="h-6 bg-white/10 rounded mb-2 animate-pulse mx-auto w-32"></div>
        <div className="h-4 bg-white/10 rounded animate-pulse mx-auto w-48"></div>
      </div>
      
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-6 bg-white/10 rounded w-40 animate-pulse"></div>
            <div className="h-5 w-16 bg-white/10 rounded-full animate-pulse"></div>
            <div className="h-5 w-20 bg-white/10 rounded-full animate-pulse"></div>
          </div>
          <div className="h-4 bg-white/10 rounded w-16 animate-pulse"></div>
        </div>

        <div className="h-4 bg-white/10 rounded mb-3 animate-pulse"></div>
        <div className="h-4 bg-white/10 rounded mb-3 animate-pulse w-3/4"></div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-32 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 bg-white/10 rounded w-24 animate-pulse"></div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// 메인 유저 이벤트 페이지
export default function EventPage() {
  const { 
    events, 
    pagination, 
    isLoadingEvents, 
    eventListError,
    fetchEvents 
  } = useEvent();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filter, setFilter] = useState<EventFilter>({});
  const [showMyAttendanceList, setShowMyAttendanceList] = useState(false);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // 사용자의 기수로 필터링
    const initialFilter: EventFilter = {};
    if (user?.gen) {
      initialFilter.gen = user.gen;
    }
    setFilter(initialFilter);
    fetchEvents(1, 20, initialFilter);
  }, [fetchEvents, user]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // 현재 출석 기간에 포함된 이벤트들 (메인 이벤트)
  const getCurrentAttendanceEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const attendanceStart = event.attendanceStartTime || event.startTime;
      const attendanceEnd = event.attendanceEndTime || event.endTime;
      return attendanceStart <= now && attendanceEnd >= now;
    });
  };

  const currentAttendanceEvents = getCurrentAttendanceEvents();

  return (
    <div className="md:max-w-4xl max-w-lg mx-auto min-h-screen font-pretendard">
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
            <div className="text-right">
              <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{events.length}</span>개</p>
            </div>
            <RedButton 
              onClick={() => setShowMyAttendanceList(true)}
              className="inline-flex items-center"
            >
              <FontAwesomeIcon icon={faList} className="mr-2 h-4 w-4" />
              내 출석 목록
            </RedButton>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">

        {/* 현재 출석 가능한 이벤트들 */}
        {isLoadingEvents ? (
          <MainEventSkeleton />
        ) : currentAttendanceEvents.length > 0 ? (
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faStar} className="mr-2 text-yellow-400" />
                현재 출석 가능한 이벤트
              </h2>
              <p className="text-white/70">지금 출석 체크할 수 있는 이벤트</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentAttendanceEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                />
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
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : eventListError ? (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-center">
            {eventListError}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
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

        {/* 이벤트 상세 모달 */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          event={selectedEvent}
          isAdmin={false}
        />

        {/* 내 출석 목록 모달 */}
        <MyAttendanceListModal
          isOpen={showMyAttendanceList}
          onClose={() => setShowMyAttendanceList(false)}
        />
      </div>
    </div>
  );
}
