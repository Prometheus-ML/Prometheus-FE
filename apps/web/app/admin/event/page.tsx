'use client';

import { useState, useEffect } from 'react';
import { useEvent, useEventDetail, useAttendance, useAttendanceManagement } from '@prometheus-fe/hooks';
import { Event, EventFormData, AttendanceFormData, EventType, AttendanceStatus } from '@prometheus-fe/types';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faUsers, faCalendarAlt, faMapMarkerAlt, faUserGraduate } from '@fortawesome/free-solid-svg-icons';

// 이벤트 생성/수정 모달 컴포넌트
function EventFormModal({ 
  isOpen, 
  onClose, 
  event, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  event?: Event | null;
  onSubmit: (formData: EventFormData) => Promise<void>;
}) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    eventType: '회의' as EventType,
    isAttendanceRequired: true,
    currentGen: 5,
    attendanceStartTime: undefined,
    attendanceEndTime: undefined,
    lateThresholdMinutes: 15,
    meta: {}
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || '',
        eventType: event.eventType,
        isAttendanceRequired: event.isAttendanceRequired,
        currentGen: event.currentGen,
        attendanceStartTime: event.attendanceStartTime,
        attendanceEndTime: event.attendanceEndTime,
        lateThresholdMinutes: event.lateThresholdMinutes,
        meta: event.meta || {}
      });
    } else {
      // 새 이벤트 생성시 기본값 설정
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData({
        title: '',
        description: '',
        startTime: now,
        endTime: oneHourLater,
        location: '',
        eventType: '회의' as EventType,
        isAttendanceRequired: true,
        currentGen: 5,
        attendanceStartTime: undefined,
        attendanceEndTime: undefined,
        lateThresholdMinutes: 15,
        meta: {}
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 [EventFormModal] 폼 제출 시작:', formData);
    try {
      console.log('📝 [EventFormModal] onSubmit 함수 호출 중...');
      await onSubmit(formData);
      console.log('✅ [EventFormModal] 폼 제출 성공');
      onClose();
    } catch (error) {
      console.error('❌ [EventFormModal] 폼 제출 실패:', error);
      // 에러 상세 정보 출력
      if (error && typeof error === 'object') {
        console.error('❌ [EventFormModal] 에러 상세:', {
          message: (error as any).message,
          status: (error as any).status,
          data: (error as any).data,
          stack: (error as any).stack
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {event ? '이벤트 수정' : '새 이벤트 생성'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white/20 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="이벤트 제목"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/20 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
              placeholder="이벤트 설명"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">시작 시간</label>
              <input
                type="datetime-local"
                value={formData.startTime.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                className="w-full px-3 py-2 bg-white/20 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">종료 시간</label>
              <input
                type="datetime-local"
                value={formData.endTime.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value) })}
                className="w-full px-3 py-2 bg-white/20 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">장소</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-white/20 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="이벤트 장소"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">이벤트 타입</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="회의" className="bg-gray-800 text-white">회의</option>
                <option value="세미나" className="bg-gray-800 text-white">세미나</option>
                <option value="워크샵" className="bg-gray-800 text-white">워크샵</option>
                <option value="행사" className="bg-gray-800 text-white">행사</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">기수</label>
              <input
                type="number"
                value={formData.currentGen}
                onChange={(e) => setFormData({ ...formData, currentGen: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/20 text-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="attendanceRequired"
                checked={formData.isAttendanceRequired}
                onChange={(e) => setFormData({ ...formData, isAttendanceRequired: e.target.checked })}
                className="w-4 h-4 text-red-600 bg-white/20 border-white/30 rounded focus:ring-red-500 focus:ring-2"
              />
              <label htmlFor="attendanceRequired" className="text-sm font-medium text-white">
                출석 필수
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              취소
            </button>
            <RedButton type="submit">
              {event ? '수정' : '생성'}
            </RedButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

// 출석 관리 모달 컴포넌트
function AttendanceModal({ 
  isOpen, 
  onClose, 
  eventId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  eventId: number;
}) {
  const { attendances, attendanceStats, isLoading, refreshAttendances } = useAttendance(eventId);
  const { createAttendance, updateAttendance, deleteAttendance, bulkCreateAttendances } = useAttendanceManagement();
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');

  useEffect(() => {
    if (isOpen && eventId) {
      refreshAttendances();
    }
  }, [isOpen, eventId, refreshAttendances]);

  const handleStatusUpdate = async (attendanceId: number, status: AttendanceStatus) => {
    try {
      await updateAttendance(eventId, attendanceId, { status });
      refreshAttendances();
    } catch (error) {
      console.error('출석 상태 업데이트 실패:', error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">출석 관리</h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* 출석 통계 */}
        {attendanceStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{attendanceStats.totalMembers}</div>
              <div className="text-sm text-white/70">총 인원</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{attendanceStats.present}</div>
              <div className="text-sm text-white/70">출석</div>
            </div>
            <div className="bg-red-500/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{attendanceStats.absent}</div>
              <div className="text-sm text-white/70">결석</div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">{attendanceStats.late}</div>
              <div className="text-sm text-white/70">지각</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{Math.round(attendanceStats.attendanceRate * 100)}%</div>
              <div className="text-sm text-white/70">출석률</div>
            </div>
          </div>
        )}

        {/* 출석 목록 */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white mb-3">출석 목록</h3>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
          ) : attendances.length === 0 ? (
            <div className="text-center py-8 text-white/70">출석 기록이 없습니다.</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {attendances.map((attendance) => (
                <div key={attendance.id} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-white font-medium">
                      {attendance.memberName || attendance.memberId}
                    </div>
                    <div className="text-sm text-white/70">
                      ({attendance.memberId})
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={attendance.status}
                      onChange={(e) => handleStatusUpdate(attendance.id, e.target.value as AttendanceStatus)}
                      className={`px-2 py-1 bg-white/20 border border-white/30 rounded text-sm ${getStatusColor(attendance.status)} focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                    >
                      <option value="present" className="bg-gray-800 text-white">출석</option>
                      <option value="absent" className="bg-gray-800 text-white">결석</option>
                      <option value="late" className="bg-gray-800 text-white">지각</option>
                      <option value="excused" className="bg-gray-800 text-white">사유결석</option>
                      <option value="unknown" className="bg-gray-800 text-white">미확인</option>
                    </select>
                    {attendance.checkedInAt && (
                      <div className="text-xs text-white/50">
                        {attendance.checkedInAt.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
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

// 메인 어드민 이벤트 페이지
export default function AdminEventPage() {
  const { 
    events, 
    pagination, 
    isLoadingEvents, 
    eventListError,
    fetchEvents, 
    createEvent, 
    updateEvent, 
    deleteEvent 
  } = useEvent();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents(1, 20);
  }, [fetchEvents]);

  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      console.log('🎯 [AdminEventPage] 이벤트 생성 핸들러 호출:', formData);
      console.log('🎯 [AdminEventPage] createEvent 함수 호출 중...');
      await createEvent(formData);
      console.log('🎯 [AdminEventPage] 이벤트 생성 완료, 목록 새로고침 중...');
      fetchEvents(pagination.page, pagination.size);
    } catch (error) {
      console.error('🎯 [AdminEventPage] 이벤트 생성 실패:', error);
      // 에러 상세 정보 출력
      if (error && typeof error === 'object') {
        console.error('🎯 [AdminEventPage] 에러 상세:', {
          message: (error as any).message,
          status: (error as any).status,
          data: (error as any).data,
          stack: (error as any).stack
        });
      }
      // 에러를 다시 throw하여 상위로 전파
      throw error;
    }
  };

  const handleUpdateEvent = async (formData: EventFormData) => {
    if (!selectedEvent) return;
    try {
      await updateEvent(selectedEvent.id, formData);
      fetchEvents(pagination.page, pagination.size);
    } catch (error) {
      console.error('이벤트 수정 실패:', error);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        console.log(`🗑️ [AdminEventPage] 이벤트 삭제 시작: ID ${eventId}`);
        await deleteEvent(eventId);
        console.log(`✅ [AdminEventPage] 이벤트 삭제 완료: ID ${eventId}`);
        
        // 성공 메시지 표시
        alert('이벤트가 성공적으로 삭제되었습니다.');
        
        // 목록 새로고침
        fetchEvents(pagination.page, pagination.size);
      } catch (error) {
        console.error(`❌ [AdminEventPage] 이벤트 삭제 실패: ID ${eventId}`, error);
        
        // 사용자에게 에러 메시지 표시
        let errorMessage = '이벤트 삭제에 실패했습니다.';
        if (error && typeof error === 'object') {
          if ((error as any).detail) {
            errorMessage = (error as any).detail;
          } else if ((error as any).message) {
            errorMessage = (error as any).message;
          }
        }
        
        alert(`삭제 실패: ${errorMessage}`);
      }
    }
  };

  const openEventModal = (event?: Event) => {
    setSelectedEvent(event || null);
    setIsEventModalOpen(true);
  };

  const openAttendanceModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setIsAttendanceModalOpen(true);
  };

  return (
    <div className="py-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">이벤트 관리</h1>
        <RedButton
          onClick={() => openEventModal()}
          className="inline-flex items-center px-4 py-2 text-sm font-medium"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
          새 이벤트
        </RedButton>
      </div>

      {/* 이벤트 목록 */}
      <GlassCard className="overflow-hidden">
        {isLoadingEvents ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        ) : eventListError ? (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">오류 발생</h3>
              <p className="mt-1 text-sm text-gray-300">{eventListError}</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">이벤트가 없습니다.</h3>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {events.map((event) => (
              <li key={event.id} className="px-4 py-4 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                        {event.eventType}
                      </span>
                      {event.isAttendanceRequired && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                          출석필수
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-gray-300 mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                        {event.startTime.toLocaleString()} ~ {event.endTime.toLocaleString()}
                      </span>
                      {event.location && (
                        <span className="flex items-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                          {event.location}
                        </span>
                      )}
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faUserGraduate} className="mr-1" />
                        {event.currentGen}기
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAttendanceModal(event.id);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                    >
                      <FontAwesomeIcon icon={faUsers} className="mr-1" />
                      출석관리
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEventModal(event);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm px-2 py-1 rounded hover:bg-yellow-500/20 transition-colors"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                      수정
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {/* 페이지네이션 */}
      {pagination.total > 0 && (
        <div className="flex justify-center space-x-2 mt-6">
          {Array.from({ length: Math.ceil(pagination.total / pagination.size) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchEvents(page, pagination.size)}
              className={`px-3 py-1 rounded transition-colors ${
                page === pagination.page
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* 모달들 */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
      />

      {selectedEventId && (
        <AttendanceModal
          isOpen={isAttendanceModalOpen}
          onClose={() => setIsAttendanceModalOpen(false)}
          eventId={selectedEventId}
        />
      )}
    </div>
  );
}
