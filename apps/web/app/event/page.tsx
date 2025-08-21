'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEvent, useMyAttendance, useAttendanceCodeManagement, useAttendance, useAttendanceManagement } from '@prometheus-fe/hooks';
import { Event, EventFilter, AttendanceStatus, Attendance } from '@prometheus-fe/types';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';
import EventModal  from '../../src/components/EventModal';
import { MemberSelector } from '../../src/components/SearchMemberBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faCheck, 
  faTimes,
  faKey,
  faQrcode,
  faComment,
  faUsers,
  faExclamationTriangle,
  faList,
  faPlus,
  faTrash,
  faEye, 
  faClock, 
  faStar, 
  faArrowLeft,
  faCalendar,
  faEdit,
  faCheckCircle,
  faCircle,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

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
  <div className="p-4 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 mr-4">
        {/* 제목과 날짜 (한 줄) */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-48 h-6 bg-gray-600 rounded flex-1 mr-4"></div>
          <div className="w-32 h-4 bg-gray-600 rounded"></div>
        </div>
        
        {/* 타입과 상태 */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="h-5 w-16 bg-gray-600 rounded-full"></div>
          <div className="h-5 w-16 bg-gray-600 rounded-full"></div>
        </div>
        
        {/* 위치 */}
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-600 rounded"></div>
          <div className="w-24 h-4 bg-gray-600 rounded"></div>
        </div>
      </div>
      
      {/* 오른쪽: 아이콘들 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-4 h-4 bg-gray-600 rounded"></div>
        <div className="w-4 h-4 bg-gray-600 rounded"></div>
        <div className="w-4 h-4 bg-gray-600 rounded"></div>
      </div>
    </div>
  </div>
);

// 메인 유저 행사 페이지
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
    fetchAttendableEvents,
    participants, 
    isLoadingParticipants, 
    addParticipants, 
    removeParticipants, 
    fetchParticipants,
    setExcusedAbsence,
    updateExcusedAbsenceReason,
    myAttendances,
    fetchMyAttendances
  } = useEvent();

  const { getMyAttendanceForEvent, checkInAttendance } = useMyAttendance();
  const { generateAttendanceCode, deleteAttendanceCode, getAttendanceCode, isGenerating: isLoadingCode } = useAttendanceCodeManagement();
  const { attendances, isLoading: isLoadingAttendances, fetchAttendances } = useAttendance();
  const { updateAttendance, isUpdating: isUpdatingAttendance } = useAttendanceManagement();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filter, setFilter] = useState<EventFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // 한 페이지당 12개 (3x4 그리드)

  // 출석 관리 상태
  const [myAttendance, setMyAttendance] = useState<any>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentAttendanceCode, setCurrentAttendanceCode] = useState<string>('');
  const [editingAttendance, setEditingAttendance] = useState<{id: number, status: AttendanceStatus} | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [editingExcusedAbsence, setEditingExcusedAbsence] = useState<{memberId: string, reason: string} | null>(null);
  const [editingAttendanceReason, setEditingAttendanceReason] = useState<string>('');
  const [showRemoveButton, setShowRemoveButton] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // 사용자의 기수로 필터링
    const initialFilter: EventFilter = {};
    if (user?.gen) {
      initialFilter.gen = user.gen;
    }
    setFilter(initialFilter);
    fetchEvents(currentPage, pageSize, initialFilter);
    fetchAttendableEvents(1, 10, initialFilter); // 출석 가능한 행사는 최대 10개만
    fetchMyAttendances(); // 내 출석 목록 가져오기
  }, [fetchEvents, fetchAttendableEvents, fetchMyAttendances, user, currentPage, pageSize]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 출석 관리 함수들
  const canCheckIn = (event: Event) => {
    if (myAttendance) return false;
    
    const now = new Date();
    const attendanceStart = event.attendanceStartTime || event.startTime;
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    
    return attendanceStart <= now && attendanceEnd >= now;
  };

  const getCheckInMessage = (event: Event) => {
    if (myAttendance) return '이미 출석 체크가 완료되었습니다.';
    
    const now = new Date();
    const attendanceStart = event.attendanceStartTime || event.startTime;
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    
    if (attendanceStart > now) {
      const timeDiff = Math.ceil((attendanceStart.getTime() - now.getTime()) / (1000 * 60));
      return `출석 가능 시간까지 ${timeDiff}분 남았습니다.`;
    }
    
    if (attendanceEnd < now) {
      return '출석 가능 시간이 종료되었습니다.';
    }
    
    const lateThreshold = event.lateThresholdMinutes || 15;
    const lateDeadline = new Date(attendanceStart.getTime() + lateThreshold * 60 * 1000);
    
    if (now <= lateDeadline) {
      return '출석 체크가 가능합니다.';
    } else {
      return '지각 처리됩니다. 출석 체크가 가능합니다.';
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-500/20 text-green-300';
      case 'late':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'absent':
        return 'bg-red-500/20 text-red-300';
      case 'excused':
        return 'bg-blue-500/20 text-blue-300';
      case 'not_attended':
        return 'bg-gray-500/20 text-gray-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
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
      case 'not_attended':
        return '미출석';
      default:
        return '미정';
    }
  };

  const handleGenerateCode = async (eventId: number) => {
    try {
      await generateAttendanceCode(eventId);
      alert('출석 코드가 생성되었습니다.');
      fetchAttendances(eventId);
      fetchAttendanceCode(eventId);
    } catch (error: any) {
      alert(`출석 코드 생성 실패: ${error.message}`);
    }
  };

  const handleDeleteCode = async (eventId: number) => {
    if (!confirm('정말 출석 코드를 삭제하시겠습니까?')) return;
    
    try {
      await deleteAttendanceCode(eventId);
      alert('출석 코드가 삭제되었습니다.');
      fetchAttendances(eventId);
      fetchAttendanceCode(eventId);
    } catch (error: any) {
      alert(`출석 코드 삭제 실패: ${error.message}`);
    }
  };

  const fetchAttendanceCode = async (eventId: number) => {
    try {
      const codeData = await getAttendanceCode(eventId);
      setCurrentAttendanceCode(codeData.attendanceCode);
    } catch (error: any) {
      setCurrentAttendanceCode('');
    }
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
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">행사</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 행사 목록</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 현재 출석 가능한 행사들 */}
        {isLoadingAttendableEvents ? (
          <div className="mb-8">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center">
                현재 출석 가능한 행사
              </h2>
              <p className="text-white/70">지금 출석 체크할 수 있는 행사</p>
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
                현재 출석 가능한 행사
              </h2>
              <p className="text-white/70">지금 출석 체크할 수 있는 행사</p>
            </div>
            
            <div className="space-y-4">
              {attendableEvents.map((event) => (
                <GlassCard 
                  key={event.id}
                  className="overflow-hidden hover:bg-white/20 transition-colors border border-white/20 cursor-pointer group"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      {/* 왼쪽: 상태, 제목, 기수, 타입, 아이콘들 */}
                      <div className="flex items-center space-x-3 flex-1">
                        <FontAwesomeIcon icon={faCircle} className={`w-2 h-2 ${getEventStatus(event).color}`} />
                        <h3 className="text-lg font-semibold text-white">
                          {event.title}
                        </h3>
                        <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex font-semibold items-center gap-1 flex-shrink-0 ${getGenColor(event.currentGen)}`}>
                          {event.currentGen}기
                        </span>
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
                      
                      {/* 오른쪽: 장소와 날짜 */}
                      <div className="flex items-center space-x-2 text-sm text-white/60">
                        {event.location && (
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.location && (
                          <span className="text-gray-500 text-xs">|</span>
                        )}
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-1" />
                          <span>{event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {event.endTime.toLocaleDateString()} {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ) : null}

        {/* 내 출석 목록 */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">내 출석 목록</h2>
          {myAttendances.length === 0 ? (
            <div className="text-center py-8 bg-white/10 rounded-lg border border-white/20">
              <FontAwesomeIcon icon={faList} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">출석 기록이 없습니다</h3>
              <p className="text-gray-300">아직 참여한 이벤트가 없거나 출석 체크를 하지 않았습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAttendances.map((attendance) => (
                <div key={attendance.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(attendance.status)}`}>
                        {getStatusText(attendance.status)}
                      </span>
                      <span className="text-white font-medium">
                        {attendance.eventTitle}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <div className="flex items-center space-x-2 mb-1">
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                      <span>{attendance.eventTitle} ({attendance.eventGen}기)</span>
                    </div>
                    {attendance.checkedInAt && (
                      <div className="flex items-center space-x-2 mb-1">
                        <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                        <span>출석 시간: {new Date(attendance.checkedInAt).toLocaleString()}</span>
                      </div>
                    )}
                    {attendance.reason && (
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
                        <span>사유: {attendance.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 전체 행사 목록 */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">전체 행사 목록</h2>
        </div>

        {/* 행사 목록 */}
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
              <h3 className="mt-2 text-sm font-medium text-white">행사가 없습니다.</h3>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoadingEvents && !eventListError && events.length > 0 && renderPagination()}

        {/* 행사 상세 모달 */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          event={selectedEvent}
        />
      </div>
    </div>
  );
}
