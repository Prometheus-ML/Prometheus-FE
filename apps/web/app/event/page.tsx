'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEvent, useMyAttendance } from '@prometheus-fe/hooks';
import { Event, EventFilter, AttendanceStatus, MyAttendance } from '@prometheus-fe/types';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import EventModal from '@/src/components/event/EventModal';
import EventListModal from '@/src/components/event/EventListModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faCheck, 
  faTimes,
  faKey,
  faComment,
  faList,
  faClock, 
  faArrowLeft,
  faCircle,
  faMapMarkerAlt,
  faExclamationTriangle,
  faEllipsisH
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
  <GlassCard className="p-4 border border-white/20 animate-pulse">
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
      
      {/* 출석 체크 섹션 */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <div className="space-y-3">
          {/* 출석 코드 입력란 */}
          <div className="h-10 bg-gray-600 rounded"></div>
          {/* 출석하기 버튼 */}
          <div className="h-10 bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  </GlassCard>
);

// 메인 유저 행사 페이지
export default function EventPage() {
  const { 
    events, 
    attendableEvents,
    myAttendances,
    fetchEvents,
    fetchAttendableEvents,
    fetchMyAttendances,
    isLoadingAttendableEvents,
    isLoadingMyAttendances
  } = useEvent();

  const { checkInAttendance } = useMyAttendance();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventListModal, setShowEventListModal] = useState(false);
  const [filter, setFilter] = useState<EventFilter>({});
  const [selectedAttendanceEvent, setSelectedAttendanceEvent] = useState<Event | null>(null);

  // 출석 관련 상태
  const [myAttendance, setMyAttendance] = useState<any>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // 사용자의 기수로 필터링
    const initialFilter: EventFilter = {};
    if (user?.gen) {
      initialFilter.gen = user.gen;
    }
    setFilter(initialFilter);
    fetchAttendableEvents(1, 10, initialFilter);
    fetchMyAttendances();
  }, [fetchAttendableEvents, fetchMyAttendances, user]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // 출석 가능 여부 확인
  const canCheckIn = (event: Event) => {
    if (myAttendance) return false;
    
    const now = new Date();
    const attendanceStart = event.attendanceStartTime || event.startTime;
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    
    return attendanceStart <= now && attendanceEnd >= now;
  };

  // 출석 체크
  const handleCheckIn = async (event: Event) => {
    try {
      setIsCheckingIn(true);
      setAttendanceError(null);
      
      const data = event.isAttendanceCodeRequired && attendanceCode ? { attendanceCode } : undefined;
      await checkInAttendance(event.id, data);
      
      setAttendanceCode('');
      alert('출석 체크가 완료되었습니다!');
      
      // 출석 목록 새로고침
      fetchMyAttendances();
    } catch (error: any) {
      setAttendanceError(error.message || '출석 체크에 실패했습니다.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-500 text-green-100';
      case 'late':
        return 'bg-yellow-500 text-yellow-100';
      case 'absent':
        return 'bg-red-500 text-red-100';
      case 'excused':
        return 'bg-blue-500 text-blue-100';
      case 'not_attended':
        return 'bg-gray-500 text-gray-100';
      default:
        return 'bg-gray-500 text-gray-100';
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

  // 출석 가능한 행사와 이전 출석 목록 분리
  const now = new Date();
  const attendableEventsList = attendableEvents.filter(event => {
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    return attendanceEnd >= now;
  });

  const pastEventsList = myAttendances.filter(attendance => {
    // not_attended 상태가 아닌 출석 기록만 표시
    return attendance.status !== 'not_attended';
  });

  // 각 출석 가능한 행사에 대한 내 출석 상태 확인
  const getMyAttendanceForEvent = (eventId: number) => {
    return myAttendances.find(attendance => attendance.eventId === eventId);
  };

  // 출석 기록에서 이벤트 상세 정보 가져오기
  const handleAttendanceCardClick = async (attendance: MyAttendance) => {
    // 현재 로드된 이벤트 목록에서 해당 이벤트 찾기
    let eventDetail = events.find(event => event.id === attendance.eventId);
    
    if (!eventDetail) {
      // 이벤트가 로드되지 않은 경우, 전체 이벤트 목록에서 찾기
      eventDetail = attendableEvents.find(event => event.id === attendance.eventId);
    }
    
    if (eventDetail) {
      setSelectedAttendanceEvent(eventDetail);
      setShowEventModal(true);
    } else {
      // 여전히 찾을 수 없는 경우, API에서 직접 조회
      console.log('이벤트 상세 정보를 가져올 수 없습니다:', attendance.eventId);
    }
  };

  return (
    <div className="md:max-w-6xl max-w-lg mx-auto min-h-screen font-pretendard">
      {/* 헤더 */}
      <header className="mx-4 px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/my" className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">출석하기</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">내 출석 목록</p>
            </div>
          </div>
          <RedButton
            onClick={() => setShowEventListModal(true)}
            className="flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faList} className="w-4 h-4" />
            <span>전체 행사 목록</span>
          </RedButton>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 출석 가능한 행사 */}
          <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faCheck} className="mr-2 w-5 h-5" />
            출석 가능한 행사
              </h2>
          <p className="text-white/70 mb-4">지금 출석 체크할 수 있는 행사</p>
          
          {isLoadingAttendableEvents ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <EventCardSkeleton key={index} />
              ))}
            </div>
          ) : attendableEventsList.length === 0 ? (
            <div className="text-center py-8 bg-white/10 rounded-lg border border-white/20">
              <div className="mx-auto h-12 w-12 bg-gray-600 rounded-full mb-4 animate-pulse"></div>
              <h3 className="text-lg font-medium text-white mb-2">출석 가능한 행사가 없습니다</h3>
              <p className="text-gray-300">현재 출석 체크할 수 있는 행사가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendableEventsList.map((event) => (
                <GlassCard 
                  key={event.id}
                  className="overflow-hidden hover:bg-white/20 transition-colors border border-white/20"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      {/* 왼쪽: 상태, 제목, 기수, 타입 */}
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
                          <span>{event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                        </div>
                      </div>
                    </div>

                                         {/* 출석 체크 섹션 */}
                     <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                       {(() => {
                         const myAttendance = getMyAttendanceForEvent(event.id);
                         
                         if (myAttendance && myAttendance.status !== 'not_attended') {
                           // 이미 출석 처리된 경우
                           return (
                             <div className="text-center">
                               <div className="flex items-center justify-center space-x-2 mb-2">
                                 <FontAwesomeIcon icon={faCheck} className="text-green-300 w-4 h-4" />
                                 <span className="text-green-300 font-medium">출석 처리 완료</span>
                               </div>
                               <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(myAttendance.status)}`}>
                                 {getStatusText(myAttendance.status)}
                               </span>
                             </div>
                           );
                         }
                         
                         // 출석 체크가 필요한 경우
                         return (
                           <>
                             {event.isAttendanceCodeRequired && !event.hasAttendanceCode ? (
                               // 출석 코드가 필수인데 생성되지 않은 경우
                               <div className="text-center py-4">
                                 <div className="flex items-center justify-center space-x-2 mb-2">
                                   <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-300 w-4 h-4" />
                                   <span className="text-yellow-300 font-medium">출석 코드 생성이 아직 안됐습니다</span>
                                 </div>
                                 <p className="text-gray-300 text-sm">관리자가 출석 코드를 생성한 후 출석 체크가 가능합니다.</p>
                               </div>
                             ) : event.isAttendanceCodeRequired && event.hasAttendanceCode && (
                               <div className="mb-3">
                                 <label className="block text-sm font-medium text-white mb-2">
                                   <FontAwesomeIcon icon={faKey} className="mr-1 w-4 h-4" />
                                   출석 코드
                                 </label>
                                 <input
                                   type="text"
                                   value={attendanceCode}
                                   onChange={(e) => setAttendanceCode(e.target.value)}
                                   placeholder="출석 코드를 입력하세요"
                                   className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                 />
                               </div>
                             )}
                             
                             {attendanceError && (
                               <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-3">
                                 <div className="flex items-center space-x-2">
                                   <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-300 w-4 h-4" />
                                   <span className="text-red-300 text-sm">{attendanceError}</span>
                                 </div>
                               </div>
                             )}
                             
                             <button
                               onClick={() => handleCheckIn(event)}
                               disabled={isCheckingIn || (event.isAttendanceCodeRequired && event.hasAttendanceCode && !attendanceCode.trim()) || (event.isAttendanceCodeRequired && !event.hasAttendanceCode)}
                               className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                             >
                               {isCheckingIn ? (
                                 <div className="flex items-center">
                                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                   출석 체크 중...
                                 </div>
                               ) : (
                                 <div className="flex items-center">
                                   <FontAwesomeIcon icon={faCheck} className="mr-2 w-4 h-4" />
                                   출석하기
                                 </div>
                               )}
                             </button>
                           </>
                         );
                       })()}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
          </div>

        {/* 이전 출석 목록 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-2 w-5 h-5" />
            이전 출석 목록
          </h2>
          <p className="text-white/70 mb-4">이전에 참여한 행사들의 출석 기록</p>
          
          {isLoadingMyAttendances ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4 border border-white/20 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-20 h-6 bg-gray-600 rounded"></div>
                      <div className="w-32 h-6 bg-gray-600 rounded"></div>
                      <div className="w-16 h-5 bg-gray-600 rounded-full"></div>
                      <div className="w-12 h-5 bg-gray-600 rounded"></div>
                    </div>
                    <div className="w-32 h-4 bg-gray-600 rounded"></div>
                  </div>
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
              ))}
            </div>
          ) : pastEventsList.length === 0 ? (
            <div className="text-center py-8 bg-white/10 rounded-lg border border-white/20">
              <div className="mx-auto h-12 w-12 bg-gray-600 rounded-full mb-4 animate-pulse"></div>
              <h3 className="text-lg font-medium text-white mb-2">출석 기록이 없습니다</h3>
              <p className="text-gray-300">아직 참여한 이벤트가 없거나 출석 체크를 하지 않았습니다.</p>
            </div>
          ) : (
                         <div className="space-y-4">
               {pastEventsList.map((attendance) => (
                 <div 
                   key={attendance.id} 
                   className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-colors group"
                 >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(attendance.status)}`}>
                        {getStatusText(attendance.status)}
                      </span>
                      <span className="text-white font-medium">
                        {attendance.eventTitle}
                      </span>
                       <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex font-semibold items-center gap-1 flex-shrink-0 ${getGenColor(attendance.eventGen)}`}>
                         {attendance.eventGen}기
                       </span>
                       <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded">
                         {attendance.eventType || '기타'}
                       </span>
                     </div>
                     <div className="text-sm text-gray-300">
                       <FontAwesomeIcon 
                         icon={faEllipsisH} 
                         className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors cursor-pointer" 
                         title="상세보기"
                         onClick={() => handleAttendanceCardClick(attendance)}
                       />
                    </div>
                  </div>
                  
                                       <div className="text-sm text-gray-300 space-y-2">
                      {/* 장소와 이벤트 시간 */}
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                        <span>{attendance.eventLocation || '장소 미정'}</span>
                        <span className="text-gray-500">|</span>
                      <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                        <span>
                          {attendance.eventStartTime && attendance.eventEndTime 
                            ? `${attendance.eventStartTime.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ${attendance.eventStartTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${attendance.eventEndTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}`
                            : '시간 미정'
                          }
                        </span>
                    </div>
                      
                      {/* 출석 시간 */}
                    {attendance.checkedInAt && (
                        <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                          <span>
                            출석: {new Date(attendance.checkedInAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                      </div>
                    )}
                      
                      {/* 사유 */}
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

        {/* 행사 상세 모달 */}
        <EventModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
            setSelectedAttendanceEvent(null);
          }}
          event={selectedEvent || selectedAttendanceEvent}
        />

        {/* 전체 행사 목록 모달 */}
        <EventListModal
          isOpen={showEventListModal}
          onClose={() => setShowEventListModal(false)}
          filter={filter}
        />
      </div>
    </div>
  );
}
