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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12); // 한 페이지당 12개 (3x4 그리드)

  useEffect(() => {
    fetchEvents(currentPage, pageSize);
  }, [fetchEvents, currentPage, pageSize]);

  const handleCreateEvent = async (data: EventFormData) => {
    try {
      await createEvent(data);
      setIsEditing(false);
      setEditingEvent(null);
      setShowEventModal(false); // 모달 닫기
      fetchEvents(currentPage, pageSize);
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
      setShowEventModal(false); // 모달 닫기
      fetchEvents(currentPage, pageSize);
    } catch (error: any) {
      alert(`이벤트 수정 실패: ${error.message}`);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('정말 이 이벤트를 삭제하시겠습니까?')) return;
    
    try {
      await deleteEvent(eventId);
      fetchEvents(currentPage, pageSize);
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
               <p className="text-sm text-[#e0e0e0]">
                 전체 <span className="text-[#ffa282] font-bold">{pagination?.total || events.length}</span>개
                 {pagination && Math.ceil((pagination.total || events.length) / pageSize) > 1 && (
                   <span className="ml-2 text-gray-400">
                     ({currentPage}/{Math.ceil((pagination.total || events.length) / pageSize)} 페이지)
                   </span>
                 )}
               </p>
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

         {/* 페이지네이션 */}
         {!isLoadingEvents && !eventListError && events.length > 0 && renderPagination()}

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
            onSave={isEditing ? (editingEvent ? handleUpdateEvent : handleCreateEvent) : undefined}
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
