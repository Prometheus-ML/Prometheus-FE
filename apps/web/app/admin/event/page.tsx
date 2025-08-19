'use client';

import { useState, useEffect } from 'react';
import { useEvent, useEventDetail, useAttendance, useAttendanceManagement } from '@prometheus-fe/hooks';
import { Event, EventFormData, AttendanceFormData, EventType, AttendanceStatus, AttendanceCode } from '@prometheus-fe/types';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import EventModal from '../../../src/components/EventModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faUsers, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faUserGraduate,
  faKey,
  faEye,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

// 이벤트 폼 모달 컴포넌트
function EventFormModal({ 
  isOpen, 
  onClose, 
  event, 
  onSubmit 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  event: Event | null;
  onSubmit: (data: EventFormData) => void;
}) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventType: 'study' as EventType,
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    currentGen: 0,
    isAttendanceRequired: false,
    attendanceStartTime: new Date(),
    attendanceEndTime: new Date(),
    lateThresholdMinutes: 15,
    isAttendanceCodeRequired: false
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        eventType: event.eventType,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || '',
        currentGen: event.currentGen,
        isAttendanceRequired: event.isAttendanceRequired,
        attendanceStartTime: event.attendanceStartTime || event.startTime,
        attendanceEndTime: event.attendanceEndTime || event.endTime,
        lateThresholdMinutes: event.lateThresholdMinutes || 15,
        isAttendanceCodeRequired: event.isAttendanceCodeRequired
      });
    } else {
      setFormData({
        title: '',
        description: '',
        eventType: 'study' as EventType,
        startTime: new Date(),
        endTime: new Date(),
        location: '',
        currentGen: 0,
        isAttendanceRequired: false,
        attendanceStartTime: new Date(),
        attendanceEndTime: new Date(),
        lateThresholdMinutes: 15,
        isAttendanceCodeRequired: false
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {event ? '이벤트 수정' : '새 이벤트 생성'}
          </h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">이벤트 타입</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="study">스터디</option>
                <option value="project">프로젝트</option>
                <option value="hackathon">해커톤</option>
                <option value="seminar">세미나</option>
                <option value="meeting">회의</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">대상 기수</label>
              <input
                type="number"
                value={formData.currentGen}
                onChange={(e) => setFormData({ ...formData, currentGen: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">시작 시간</label>
              <input
                type="datetime-local"
                value={formData.startTime.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">종료 시간</label>
              <input
                type="datetime-local"
                value={formData.endTime.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value) })}
                className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">장소</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAttendanceRequired"
                checked={formData.isAttendanceRequired}
                onChange={(e) => setFormData({ ...formData, isAttendanceRequired: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isAttendanceRequired" className="text-sm text-white">
                출석 필수
              </label>
            </div>

            {formData.isAttendanceRequired && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">출석 시작 시간</label>
                    <input
                      type="datetime-local"
                      value={formData.attendanceStartTime?.toISOString().slice(0, 16) || ''}
                      onChange={(e) => setFormData({ ...formData, attendanceStartTime: new Date(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">출석 종료 시간</label>
                    <input
                      type="datetime-local"
                      value={formData.attendanceEndTime?.toISOString().slice(0, 16) || ''}
                      onChange={(e) => setFormData({ ...formData, attendanceEndTime: new Date(e.target.value) })}
                      className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">지각 기준 (분)</label>
                  <input
                    type="number"
                    value={formData.lateThresholdMinutes}
                    onChange={(e) => setFormData({ ...formData, lateThresholdMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAttendanceCodeRequired"
                    checked={formData.isAttendanceCodeRequired}
                    onChange={(e) => setFormData({ ...formData, isAttendanceCodeRequired: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isAttendanceCodeRequired" className="text-sm text-white">
                    출석 코드 필수
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <RedButton type="submit" className="flex-1">
              {event ? '수정' : '생성'}
            </RedButton>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white hover:bg-white/30 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
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

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents(1, 50);
  }, [fetchEvents]);

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      await createEvent(data);
      setShowEventForm(false);
      fetchEvents(1, 50);
    } catch (error: any) {
      alert(`이벤트 생성 실패: ${error.message}`);
    }
  };

  const handleUpdateEvent = async (data: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      await updateEvent(editingEvent.id, data);
      setShowEventForm(false);
      setEditingEvent(null);
      fetchEvents(1, 50);
    } catch (error: any) {
      alert(`이벤트 수정 실패: ${error.message}`);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('정말 이 이벤트를 삭제하시겠습니까?')) return;
    
    try {
      await deleteEvent(eventId);
      fetchEvents(1, 50);
    } catch (error: any) {
      alert(`이벤트 삭제 실패: ${error.message}`);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventForm(true);
    setShowEventModal(false);
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    if (event.startTime > now) return { text: '예정', color: 'bg-blue-500/20 text-blue-300' };
    if (event.endTime < now) return { text: '종료', color: 'bg-gray-500/20 text-gray-300' };
    return { text: '진행중', color: 'bg-green-500/20 text-green-300' };
  };

  return (
    <div className="min-h-screen font-pretendard">
      {/* 헤더 */}
      <header className="mx-4 px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">이벤트 관리</h1>
            <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 이벤트 관리</p>
          </div>
          <RedButton 
            onClick={() => setShowEventForm(true)}
            className="inline-flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            새 이벤트
          </RedButton>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 이벤트 목록 */}
        {isLoadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <GlassCard key={index} className="p-4 animate-pulse">
                <div className="h-6 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
              </GlassCard>
            ))}
          </div>
        ) : eventListError ? (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-400 text-center">
            {eventListError}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const status = getEventStatus(event);
              return (
                <GlassCard key={event.id} className="p-4 hover:bg-white/15 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                          {event.eventType}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>
                          {status.text}
                        </span>
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
                        {event.hasAttendanceCode && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                            코드생성
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">{event.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-white/60 mb-4">
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
                      <FontAwesomeIcon icon={faUserGraduate} className="w-4 h-4" />
                      <span>{event.currentGen}기 대상</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="inline-flex items-center px-3 py-1 text-sm bg-green-500/20 border border-green-500/30 rounded text-green-300 hover:bg-green-500/30 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
                        수정
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 rounded text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {!isLoadingEvents && !eventListError && events.length === 0 && (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faCalendarAlt} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">이벤트가 없습니다</h3>
            <p className="text-gray-300">새로운 이벤트를 생성해보세요.</p>
          </div>
        )}
      </div>

      {/* 이벤트 상세 모달 */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        event={selectedEvent}
        isAdmin={true}
        onEdit={handleEditEvent}
      />

      {/* 이벤트 폼 모달 */}
      <EventFormModal
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
      />
    </div>
  );
}
