'use client';

import { useState, useEffect } from 'react';
import { useEvent, useEventDetail, useAttendance, useAttendanceManagement } from '@prometheus-fe/hooks';
import { Event, EventFormData, AttendanceFormData, EventType, AttendanceStatus } from '@prometheus-fe/types';
import GlassCard from '../../../src/components/GlassCard';

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
        meta: {}
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {event ? '이벤트 수정' : '새 이벤트 생성'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">제목 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400"
              placeholder="이벤트 제목을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400 h-24 resize-none"
              placeholder="이벤트 설명을 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">시작 시간 *</label>
              <input
                type="datetime-local"
                value={formData.startTime.toISOString().slice(0, 16)}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: new Date(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">종료 시간 *</label>
              <input
                type="datetime-local"
                value={formData.endTime.toISOString().slice(0, 16)}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: new Date(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">장소</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-red-400"
              placeholder="장소를 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">이벤트 타입 *</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as EventType }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
                required
              >
                <option value="회의">회의</option>
                <option value="데모데이">데모데이</option>
                <option value="홈커밍데이">홈커밍데이</option>
                <option value="스터디">스터디</option>
                <option value="워크샵">워크샵</option>
                <option value="세미나">세미나</option>
                <option value="네트워킹">네트워킹</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">기수 *</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.currentGen}
                onChange={(e) => setFormData(prev => ({ ...prev, currentGen: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-red-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={formData.isAttendanceRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, isAttendanceRequired: e.target.checked }))}
                className="rounded border-white/20 bg-white/10 text-red-500 focus:ring-red-400"
              />
              <span>출석 필수</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
            >
              {event ? '수정' : '생성'}
            </button>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">출석 관리</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-red-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
            <div className="text-center py-8 text-white">로딩 중...</div>
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
                      className={`px-2 py-1 bg-white/10 border border-white/20 rounded text-sm ${getStatusColor(attendance.status)} focus:outline-none focus:border-red-400`}
                    >
                      <option value="present">출석</option>
                      <option value="absent">결석</option>
                      <option value="late">지각</option>
                      <option value="excused">사유결석</option>
                      <option value="unknown">미확인</option>
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
      await createEvent(formData);
      fetchEvents(pagination.page, pagination.size);
    } catch (error) {
      console.error('이벤트 생성 실패:', error);
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
        await deleteEvent(eventId);
        fetchEvents(pagination.page, pagination.size);
      } catch (error) {
        console.error('이벤트 삭제 실패:', error);
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">이벤트 관리</h1>
        <button
          onClick={() => openEventModal()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>새 이벤트</span>
        </button>
      </div>

      {/* 이벤트 목록 */}
      <GlassCard className="p-6">
        {isLoadingEvents ? (
          <div className="text-center py-8 text-white">로딩 중...</div>
        ) : eventListError ? (
          <div className="text-center py-8 text-red-400">{eventListError}</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-white/70">이벤트가 없습니다.</div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white/5 rounded-lg p-4">
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
                      <p className="text-white/70 mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-white/50">
                      <span>📅 {event.startTime.toLocaleString()} ~ {event.endTime.toLocaleString()}</span>
                      {event.location && <span>📍 {event.location}</span>}
                      <span>👥 {event.currentGen}기</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openAttendanceModal(event.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors"
                    >
                      출석관리
                    </button>
                    <button
                      onClick={() => openEventModal(event)}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* 페이지네이션 */}
      {pagination.total > 0 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: Math.ceil(pagination.total / pagination.size) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchEvents(page, pagination.size)}
              className={`px-3 py-1 rounded ${
                page === pagination.page
                  ? 'bg-red-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              } transition-colors`}
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
