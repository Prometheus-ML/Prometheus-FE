'use client';

import React, { useState, useEffect } from 'react';
import { useEvent } from '@prometheus-fe/hooks';
import { Event, EventType, Attendance, AttendanceStatus } from '@prometheus-fe/types';

// 이벤트 타입 옵션
const EVENT_TYPE_OPTIONS = [
  { value: 'meeting', label: '회의' },
  { value: 'study', label: '스터디' },
  { value: 'project', label: '프로젝트' },
  { value: 'workshop', label: '워크샵' },
  { value: 'seminar', label: '세미나' },
  { value: 'conference', label: '컨퍼런스' },
  { value: 'social', label: '친목회' },
  { value: 'other', label: '기타' }
];

// 출석 상태 옵션
const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', label: '출석', color: 'bg-green-100 text-green-800' },
  { value: 'absent', label: '결석', color: 'bg-red-100 text-red-800' },
  { value: 'late', label: '지각', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'excused', label: '사유결석', color: 'bg-blue-100 text-blue-800' }
];

export default function AdminEventPage() {
  const {
    events,
    selectedEvent,
    attendances,
    total,
    isLoadingEvents,
    isLoadingEvent,
    isLoadingAttendances,
    getEventList,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchAttendances,
    createAttendance,
    createBulkAttendance,
    updateAttendance,
    deleteAttendance,
    handleEventSelect,
    handleEventDeselect
  } = useEvent();

  // 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    current_gen: '',
    event_type: '',
    is_attendance_required: '',
    start_date: '',
    end_date: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<Event | null>(null);

  // 폼 데이터
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'meeting',
    current_gen: 1,
    start_time: '',
    end_time: '',
    location: '',
    is_attendance_required: true,
    meta: {}
  });

  // 출석 폼 데이터
  const [attendanceForm, setAttendanceForm] = useState({
    member_id: '',
    status: 'present' as AttendanceStatus,
    reason: ''
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadEvents();
  }, [currentPage, pageSize, filters]);

  // 이벤트 목록 로드
  const loadEvents = async () => {
    try {
      await getEventList({
        page: currentPage,
        size: pageSize,
        ...getTransformedFilters()
      });
    } catch (error) {
      console.error('이벤트 목록 로드 실패:', error);
    }
  };

  // 이벤트 선택
  const handleEventClick = async (event: Event) => {
    try {
      await getEvent(event.id);
      handleEventSelect(event);
    } catch (error) {
      console.error('이벤트 상세 조회 실패:', error);
    }
  };

  // 이벤트 생성
  const handleCreateEvent = async () => {
    try {
      await createEvent(eventForm);
      setShowCreateModal(false);
      resetEventForm();
      loadEvents();
    } catch (error) {
      console.error('이벤트 생성 실패:', error);
    }
  };

  // 이벤트 수정
  const handleUpdateEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      await updateEvent(selectedEvent.id, eventForm);
      setShowEditModal(false);
      resetEventForm();
      loadEvents();
    } catch (error) {
      console.error('이벤트 수정 실패:', error);
    }
  };

  // 이벤트 삭제
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteEvent(eventToDelete.id);
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      loadEvents();
    } catch (error) {
      console.error('이벤트 삭제 실패:', error);
    }
  };

  // 출석 관리 모달 열기
  const openAttendanceModal = async (event: Event) => {
    setSelectedEventForAttendance(event);
    try {
      await fetchAttendances(event.id);
      setShowAttendanceModal(true);
    } catch (error) {
      console.error('출석 목록 로드 실패:', error);
    }
  };

  // 출석 체크
  const handleCreateAttendance = async () => {
    if (!selectedEventForAttendance) return;
    
    try {
      await createAttendance(selectedEventForAttendance.id, attendanceForm);
      setAttendanceForm({ member_id: '', status: 'present', reason: '' });
      await fetchAttendances(selectedEventForAttendance.id);
    } catch (error) {
      console.error('출석 체크 실패:', error);
    }
  };

  // 폼 초기화
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      event_type: 'meeting',
      current_gen: 1,
      start_time: '',
      end_time: '',
      location: '',
      is_attendance_required: true,
      meta: {}
    });
  };

  // 편집 모달 열기
  const openEditModal = (event: Event) => {
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      current_gen: event.current_gen,
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.location || '',
      is_attendance_required: event.is_attendance_required,
      meta: event.meta || {}
    });
    handleEventSelect(event);
    setShowEditModal(true);
  };

  // 필터 적용
  const applyFilters = () => {
    setCurrentPage(1);
    loadEvents();
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      current_gen: '',
      event_type: '',
      is_attendance_required: '',
      start_date: '',
      end_date: ''
    });
    setCurrentPage(1);
  };

  // 필터 값 변환 함수
  const getTransformedFilters = () => {
    const transformed: any = { ...filters };
    
    // 빈 문자열을 undefined로 변환하여 백엔드에서 처리하지 않도록 함
    if (transformed.current_gen === '') transformed.current_gen = undefined;
    if (transformed.event_type === '') transformed.event_type = undefined;
    if (transformed.is_attendance_required === '') transformed.is_attendance_required = undefined;
    if (transformed.start_date === '') transformed.start_date = undefined;
    if (transformed.end_date === '') transformed.end_date = undefined;
    
    // 숫자 필드 변환
    if (transformed.current_gen !== undefined) {
      transformed.current_gen = parseInt(transformed.current_gen as string);
    }
    
    return transformed;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">이벤트 관리</h1>
          <p className="text-gray-600 mt-2">동아리 이벤트를 생성하고 관리할 수 있습니다.</p>
        </div>

        {/* 필터 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기수</label>
              <input
                type="number"
                value={filters.current_gen}
                onChange={(e) => setFilters({ ...filters, current_gen: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="기수 입력"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이벤트 타입</label>
              <select
                value={filters.event_type}
                onChange={(e) => setFilters({ ...filters, event_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                {EVENT_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출석 필수</label>
              <select
                value={filters.is_attendance_required}
                onChange={(e) => setFilters({ ...filters, is_attendance_required: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="true">출석 필수</option>
                <option value="false">출석 필수 아님</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작 날짜</label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료 날짜</label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              필터 적용
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              필터 초기화
            </button>
          </div>
        </div>

        {/* 이벤트 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                이벤트 목록 ({total}개)
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                새 이벤트
              </button>
            </div>
          </div>

          {isLoadingEvents ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">이벤트 목록을 불러오는 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출석 필수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일시</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">장소</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        {/* EventSummary에는 description이 없으므로 제거 */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {EVENT_TYPE_OPTIONS.find(opt => opt.value === event.event_type)?.label || event.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.current_gen}기
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.is_attendance_required ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {event.is_attendance_required ? '필수' : '선택'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.start_time).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEventClick(event as Event)}
                            className="text-blue-600 hover:text-blue-900"
                            title="상세보기"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(event as Event)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="수정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openAttendanceModal(event as Event)}
                            className="text-green-600 hover:text-green-900"
                            title="출석 관리"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEventToDelete(event as Event);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="삭제"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          {total > pageSize && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} / {total}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * pageSize >= total}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 선택된 이벤트 상세 정보 */}
        {selectedEvent && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">선택된 이벤트 상세</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>제목:</strong> {selectedEvent.title}</p>
                <p><strong>설명:</strong> {selectedEvent.description || '-'}</p>
                <p><strong>타입:</strong> {EVENT_TYPE_OPTIONS.find(opt => opt.value === selectedEvent.event_type)?.label}</p>
                <p><strong>기수:</strong> {selectedEvent.current_gen}기</p>
                <p><strong>출석 필수:</strong> {selectedEvent.is_attendance_required ? '예' : '아니오'}</p>
              </div>
              <div>
                <p><strong>시작:</strong> {new Date(selectedEvent.start_time).toLocaleString()}</p>
                <p><strong>종료:</strong> {new Date(selectedEvent.end_time).toLocaleString()}</p>
                <p><strong>장소:</strong> {selectedEvent.location || '-'}</p>
                <p><strong>메타데이터:</strong> {JSON.stringify(selectedEvent.meta || {})}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 이벤트 생성 모달 */}
      {showCreateModal && (
        <EventModal
          title="새 이벤트 생성"
          eventForm={eventForm}
          setEventForm={setEventForm}
          onSubmit={handleCreateEvent}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* 이벤트 수정 모달 */}
      {showEditModal && (
        <EventModal
          title="이벤트 수정"
          eventForm={eventForm}
          setEventForm={setEventForm}
          onSubmit={handleUpdateEvent}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* 출석 관리 모달 */}
      {showAttendanceModal && selectedEventForAttendance && (
        <AttendanceModal
          event={selectedEventForAttendance}
          attendances={attendances}
          attendanceForm={attendanceForm}
          setAttendanceForm={setAttendanceForm}
          onCreateAttendance={handleCreateAttendance}
          onClose={() => setShowAttendanceModal(false)}
          isLoading={isLoadingAttendances}
        />
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <DeleteConfirmModal
          event={eventToDelete}
          onConfirm={handleDeleteEvent}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

// 이벤트 모달 컴포넌트
function EventModal({ title, eventForm, setEventForm, onSubmit, onClose }: {
  title: string;
  eventForm: any;
  setEventForm: (form: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이벤트 타입 *</label>
              <select
                value={eventForm.event_type}
                onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {EVENT_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기수 *</label>
              <input
                type="number"
                value={eventForm.current_gen}
                onChange={(e) => setEventForm({ ...eventForm, current_gen: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_attendance_required"
              checked={eventForm.is_attendance_required}
              onChange={(e) => setEventForm({ ...eventForm, is_attendance_required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_attendance_required" className="ml-2 block text-sm text-gray-900">
              출석 필수
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간 *</label>
              <input
                type="datetime-local"
                value={eventForm.start_time}
                onChange={(e) => setEventForm({ ...eventForm, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간 *</label>
              <input
                type="datetime-local"
                value={eventForm.end_time}
                onChange={(e) => setEventForm({ ...eventForm, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">장소</label>
            <input
              type="text"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {title.includes('생성') ? '생성' : '수정'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 출석 관리 모달 컴포넌트
function AttendanceModal({ event, attendances, attendanceForm, setAttendanceForm, onCreateAttendance, onClose, isLoading }: {
  event: Event;
  attendances: Attendance[];
  attendanceForm: any;
  setAttendanceForm: (form: any) => void;
  onCreateAttendance: () => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          출석 관리 - {event.title}
        </h2>

        {/* 출석 체크 폼 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">출석 체크</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">멤버 ID</label>
              <input
                type="text"
                value={attendanceForm.member_id}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, member_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출석 상태</label>
              <select
                value={attendanceForm.status}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value as AttendanceStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ATTENDANCE_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">사유</label>
              <input
                type="text"
                value={attendanceForm.reason}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="결석 사유"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={onCreateAttendance}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                출석 체크
              </button>
            </div>
          </div>
        </div>

        {/* 출석 목록 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">출석 목록</h3>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">출석 목록을 불러오는 중...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">멤버 ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사유</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크인 시간</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((attendance) => (
                    <tr key={attendance.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendance.member_id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.member_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ATTENDANCE_STATUS_OPTIONS.find(opt => opt.value === attendance.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {ATTENDANCE_STATUS_OPTIONS.find(opt => opt.value === attendance.status)?.label || attendance.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.reason || '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.checked_in_at ? new Date(attendance.checked_in_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// 삭제 확인 모달 컴포넌트
function DeleteConfirmModal({ event, onConfirm, onClose }: {
  event: Event | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">이벤트 삭제</h2>
        <p className="text-gray-600 mb-6">
          <strong>&ldquo;{event.title}&rdquo;</strong> 이벤트를 삭제하시겠습니까?<br />
          이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
