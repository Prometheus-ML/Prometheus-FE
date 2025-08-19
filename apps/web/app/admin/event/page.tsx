'use client';

import { useState, useEffect } from 'react';
import { useEvent, useEventDetail, useAttendance, useAttendanceCodeManagement, useAttendanceManagement } from '@prometheus-fe/hooks';
import { Event, EventFormData, AttendanceFormData, EventType, AttendanceStatus, AttendanceCode } from '@prometheus-fe/types';
import GlassCard from '../../../src/components/GlassCard';
import RedButton from '../../../src/components/RedButton';
import EventModal from '../../../src/components/EventModal';
import AttendanceModal from '../../../src/components/AttendanceModal';
import Portal from '../../../src/components/Portal';
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
  faTimes,
  faQrcode,
  faComment,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import EventCard from '../../../src/components/EventCard';
import EventCardSkeleton from '../../../src/components/EventCardSkeleton';

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

  const [showEventModal, setShowEventModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchEvents(1, 50);
  }, [fetchEvents]);

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      await createEvent(data);
      setIsEditing(false);
      setEditingEvent(null);
      fetchEvents(1, 50);
    } catch (error: any) {
      alert(`이벤트 생성 실패: ${error.message}`);
    }
  };

  const handleUpdateEvent = async (data: EventFormData) => {
    if (!editingEvent) return;
    
    try {
      await updateEvent(editingEvent.id, data);
      setIsEditing(false);
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
    setSelectedEvent(event);
    setEditingEvent(event);
    setIsEditing(true);
    setShowEventModal(true);
  };

  const handleAttendanceManage = (event: Event) => {
    setSelectedEvent(event);
    setShowAttendanceModal(true);
  };

  const handleCardClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };  

  const getEventStatus = (event: Event) => {
    const now = new Date();
    if (event.startTime > now) return { text: '예정', color: 'bg-blue-500/20 text-blue-300' };
    if (event.endTime < now) return { text: '종료', color: 'bg-gray-500/20 text-gray-300' };
    return { text: '진행중', color: 'bg-green-500/20 text-green-300' };
  };

  return (
    <div className="md:max-w-4xl max-w-lg mx-auto min-h-screen font-pretendard">
      {/* 헤더 */}
      <header className="mx-4 px-6 py-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="w-10 h-10 flex items-center justify-center text-[#FFFFFF] hover:text-[#e0e0e0] transition-colors">
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-kimm-bold text-[#FFFFFF]">이벤트 관리</h1>
              <p className="text-sm font-pretendard text-[#e0e0e0]">프로메테우스 이벤트 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-[#e0e0e0]">전체 <span className="text-[#ffa282] font-bold">{events.length}</span>개</p>
            </div>
            <RedButton 
              onClick={() => {
                setSelectedEvent(null);
                setEditingEvent(null);
                setIsEditing(true);
                setShowEventModal(true);
              }}
              className="inline-flex items-center"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
              새 이벤트
            </RedButton>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* 이벤트 목록 */}
        {isLoadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        ) : eventListError ? (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-center">
            {eventListError}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                onAttendanceManage={handleAttendanceManage}
                isAdmin={true}
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

        {/* 모달들 */}
        <Portal>
          <EventModal
            isOpen={showEventModal}
            onClose={() => {
              setShowEventModal(false);
              setSelectedEvent(null);
              setEditingEvent(null);
              setIsEditing(false);
            }}
            event={isEditing ? editingEvent : selectedEvent}
            isAdmin={true}
            onEdit={handleEditEvent}
            onSave={isEditing ? handleUpdateEvent : handleCreateEvent}
            isEditing={isEditing}
          />

          <AttendanceModal
            isOpen={showAttendanceModal}
            onClose={() => {
              setShowAttendanceModal(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
            isAdmin={true}
          />
        </Portal>
      </div>
    </div>
  );
}
