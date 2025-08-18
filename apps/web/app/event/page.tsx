'use client';

import { useState, useEffect } from 'react';
import { useEvent, useMyAttendance } from '@prometheus-fe/hooks';
import { Event, EventFilter, AttendanceStatus } from '@prometheus-fe/types';
import { useAuthStore } from '@prometheus-fe/stores';
import GlassCard from '../../src/components/GlassCard';

// 이벤트 상세 모달 컴포넌트
function EventDetailModal({ 
  isOpen, 
  onClose, 
  event 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  event: Event | null;
}) {
  const { getMyAttendanceForEvent, checkInAttendance } = useMyAttendance();
  const [myAttendance, setMyAttendance] = useState<any>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      setIsLoadingAttendance(true);
      getMyAttendanceForEvent(event.id)
        .then(attendance => {
          setMyAttendance(attendance);
        })
        .catch(error => {
          console.error('내 출석 정보 조회 실패:', error);
        })
        .finally(() => {
          setIsLoadingAttendance(false);
        });
    }
  }, [isOpen, event, getMyAttendanceForEvent]);

  const handleCheckIn = async () => {
    if (!event) return;
    
    try {
      setIsCheckingIn(true);
      const result = await checkInAttendance(event.id);
      setMyAttendance(result);
      // 성공 메시지 표시
      alert('출석 체크가 완료되었습니다!');
    } catch (error: any) {
      console.error('출석 체크 실패:', error);
      alert(error.message || '출석 체크에 실패했습니다.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const canCheckIn = () => {
    if (!event || myAttendance) return false;
    
    const now = new Date();
    
    // 출석 시간이 설정된 경우 해당 시간을 사용, 아니면 이벤트 시간 사용
    const attendanceStart = event.attendanceStartTime || event.startTime;
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    
    // 출석 가능 시간 내에 있고 아직 출석하지 않은 경우
    return attendanceStart <= now && attendanceEnd >= now;
  };

  const getCheckInMessage = () => {
    if (!event) return '';
    if (myAttendance) return '이미 출석 체크가 완료되었습니다.';
    
    const now = new Date();
    
    // 출석 시간이 설정된 경우 해당 시간을 사용, 아니면 이벤트 시간 사용
    const attendanceStart = event.attendanceStartTime || event.startTime;
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    
    if (attendanceStart > now) {
      const timeDiff = Math.ceil((attendanceStart.getTime() - now.getTime()) / (1000 * 60));
      return `출석 가능 시간까지 ${timeDiff}분 남았습니다.`;
    }
    
    if (attendanceEnd < now) {
      return '출석 가능 시간이 종료되었습니다.';
    }
    
    // 지각 시간 계산
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
      case 'present': return 'text-green-400';
      case 'absent': return 'text-red-400';
      case 'late': return 'text-yellow-400';
      case 'excused': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return '출석';
      case 'absent': return '결석';
      case 'late': return '지각';
      case 'excused': return '사유결석';
      default: return '미확인';
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">이벤트 상세</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* 이벤트 기본 정보 */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-2xl font-bold text-white">{event.title}</h3>
              <span className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full">
                {event.eventType}
              </span>
              {event.isAttendanceRequired && (
                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                  출석필수
                </span>
              )}
            </div>
            
            {event.description && (
              <p className="text-white/80 mb-4 leading-relaxed">{event.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/70 text-sm mb-1">시작 시간</div>
                <div className="text-white font-medium">
                  {event.startTime.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/70 text-sm mb-1">종료 시간</div>
                <div className="text-white font-medium">
                  {event.endTime.toLocaleString()}
                </div>
              </div>
              {event.location && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/70 text-sm mb-1">장소</div>
                  <div className="text-white font-medium">{event.location}</div>
                </div>
              )}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/70 text-sm mb-1">대상 기수</div>
                <div className="text-white font-medium">{event.currentGen}기</div>
              </div>
            </div>
          </div>

          {/* 내 출석 정보 */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-lg font-semibold text-white mb-3">내 출석 정보</h4>
            {isLoadingAttendance ? (
              <div className="text-center py-4 text-white/70">로딩 중...</div>
            ) : myAttendance ? (
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-lg font-semibold ${getStatusColor(myAttendance.status)}`}>
                      {getStatusText(myAttendance.status)}
                    </div>
                    {myAttendance.checkedInAt && (
                      <div className="text-sm text-white/70 mt-1">
                        체크인 시간: {myAttendance.checkedInAt.toLocaleString()}
                      </div>
                    )}
                    {myAttendance.reason && (
                      <div className="text-sm text-white/70 mt-1">
                        사유: {myAttendance.reason}
                      </div>
                    )}
                  </div>
                  {myAttendance.status === 'present' && (
                    <div className="text-green-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 text-center text-white/70">
                  아직 출석 체크가 되지 않았습니다.
                </div>
                <div className="text-center space-y-3">
                  <div className="text-sm text-white/60">
                    {getCheckInMessage()}
                  </div>
                  <button
                    onClick={handleCheckIn}
                    disabled={isCheckingIn || !canCheckIn()}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      isCheckingIn || !canCheckIn()
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isCheckingIn ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>출석 체크 중...</span>
                      </div>
                    ) : (
                      '출석 체크하기'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            닫기
          </button>
        </div>
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
      </div>

      {event.description && (
        <p className="text-white/70 text-sm mb-3 line-clamp-2">{event.description}</p>
      )}

      <div className="space-y-2 text-sm text-white/60">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{event.currentGen}기 대상</span>
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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filter, setFilter] = useState<EventFilter>({});
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'ongoing' | 'past'>('all');

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
    setIsDetailModalOpen(true);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    
    switch (activeTab) {
      case 'upcoming':
        return events.filter(event => event.startTime > now);
      case 'ongoing':
        return events.filter(event => event.startTime <= now && event.endTime >= now);
      case 'past':
        return events.filter(event => event.endTime < now);
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  const getTabCount = (tab: string) => {
    const now = new Date();
    switch (tab) {
      case 'upcoming':
        return events.filter(event => event.startTime > now).length;
      case 'ongoing':
        return events.filter(event => event.startTime <= now && event.endTime >= now).length;
      case 'past':
        return events.filter(event => event.endTime < now).length;
      default:
        return events.length;
    }
  };

  // 메인 이벤트 (가장 최근 이벤트)
  const mainEvent = events.length > 0 ? events[0] : null;
  const isMainEventOngoing = mainEvent && (() => {
    const now = new Date();
    const attendanceStart = mainEvent.attendanceStartTime || mainEvent.startTime;
    const attendanceEnd = mainEvent.attendanceEndTime || mainEvent.endTime;
    return attendanceStart <= now && attendanceEnd >= now;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">프로메테우스 이벤트</h1>
          <p className="text-white/70">다양한 이벤트에 참여해보세요!</p>
        </div>

        {/* 메인 이벤트 */}
        {mainEvent && (
          <GlassCard className="p-6 mb-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-2">메인 이벤트</h2>
              <p className="text-white/70">가장 최근 이벤트</p>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-white">{mainEvent.title}</h3>
                  <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                    {mainEvent.eventType}
                  </span>
                  {mainEvent.isAttendanceRequired && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                      출석필수
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/70">
                    {(() => {
                      const now = new Date();
                      const attendanceStart = mainEvent.attendanceStartTime || mainEvent.startTime;
                      const attendanceEnd = mainEvent.attendanceEndTime || mainEvent.endTime;
                      
                      if (attendanceStart <= now && attendanceEnd >= now) {
                        return <span className="text-green-400">출석 가능</span>;
                      } else if (attendanceStart > now) {
                        return <span className="text-blue-400">예정</span>;
                      } else {
                        return <span className="text-gray-400">종료</span>;
                      }
                    })()}
                  </div>
                </div>
              </div>

              {mainEvent.description && (
                <p className="text-white/70 text-sm mb-3">{mainEvent.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-white/60 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{mainEvent.startTime.toLocaleDateString()} {mainEvent.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                {mainEvent.location && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{mainEvent.location}</span>
                  </div>
                )}
              </div>

              {/* 메인 이벤트 출석 체크 */}
              <div className="text-center">
                <button
                  onClick={() => handleEventClick(mainEvent)}
                  className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors mr-3"
                >
                  상세 보기
                </button>
                {mainEvent.isAttendanceRequired && (
                  <button
                    onClick={() => handleEventClick(mainEvent)}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 hover:bg-green-500/30 transition-colors"
                  >
                    출석 체크
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* 탭 네비게이션 */}
        <GlassCard className="p-4">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: '전체', count: getTabCount('all') },
              { key: 'upcoming', label: '예정', count: getTabCount('upcoming') },
              { key: 'ongoing', label: '진행중', count: getTabCount('ongoing') },
              { key: 'past', label: '종료', count: getTabCount('past') }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-red-500/30 text-red-300 border border-red-500/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
                <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* 이벤트 목록 */}
        {isLoadingEvents ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="text-white/70 mt-4">이벤트를 불러오는 중...</p>
          </div>
        ) : eventListError ? (
          <GlassCard className="p-8 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400">{eventListError}</p>
          </GlassCard>
        ) : filteredEvents.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="text-white/50 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white/70">
              {activeTab === 'all' ? '등록된 이벤트가 없습니다.' : 
               activeTab === 'upcoming' ? '예정된 이벤트가 없습니다.' :
               activeTab === 'ongoing' ? '현재 진행중인 이벤트가 없습니다.' :
               '종료된 이벤트가 없습니다.'}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination.total > pagination.size && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: Math.ceil(pagination.total / pagination.size) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchEvents(page, pagination.size, filter)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === pagination.page
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {/* 이벤트 상세 모달 */}
        <EventDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          event={selectedEvent}
        />
      </div>
    </div>
  );
}
