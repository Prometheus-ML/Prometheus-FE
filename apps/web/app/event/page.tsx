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

export default function EventPage() {
  const {
    events,
    selectedEvent,
    total,
    isLoadingEvents,
    isLoadingEvent,
    getPublicEventList,
    getPublicEvent,
    getMyAttendanceForEvent,
    handleEventSelect,
    handleEventDeselect
  } = useEvent();

  // 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filters, setFilters] = useState({
    current_gen: '',
    event_type: '',
    is_attendance_required: '',
    start_date: '',
    end_date: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [myAttendance, setMyAttendance] = useState<Attendance | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    loadEvents();
  }, [currentPage, pageSize, filters]);

  // 이벤트 목록 로드
  const loadEvents = async () => {
    try {
      await getPublicEventList({
        page: currentPage,
        size: pageSize,
        ...getTransformedFilters()
      });
    } catch (error) {
      console.error('이벤트 목록 로드 실패:', error);
    }
  };

  // 이벤트 상세 조회
  const handleEventClick = async (event: Event) => {
    try {
      await getPublicEvent(event.id);
      handleEventSelect(event);
      setShowEventDetail(true);
      
      // 내 출석 정보 조회
      try {
        const attendance = await getMyAttendanceForEvent(event.id);
        setMyAttendance(attendance);
      } catch (error) {
        setMyAttendance(null);
      }
    } catch (error) {
      console.error('이벤트 상세 조회 실패:', error);
    }
  };

  // 이벤트 상세 모달 닫기
  const closeEventDetail = () => {
    setShowEventDetail(false);
    handleEventDeselect();
    setMyAttendance(null);
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
    
    // 빈 문자열을 undefined로 변환
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

  // 이벤트 상태 확인
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    if (now < startTime) return { status: 'upcoming', label: '예정', color: 'bg-blue-100 text-blue-800' };
    if (now >= startTime && now <= endTime) return { status: 'ongoing', label: '진행중', color: 'bg-green-100 text-green-800' };
    return { status: 'ended', label: '종료', color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">이벤트</h1>
              <p className="text-gray-600 mt-2">동아리 이벤트를 확인하고 참여하세요.</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 보기 방식 선택 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h2 className="text-lg font-semibold text-gray-900">
              이벤트 목록 ({total}개)
            </h2>
          </div>

          {isLoadingEvents ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">이벤트 목록을 불러오는 중...</p>
            </div>
          ) : viewMode === 'grid' ? (
            // 그리드 뷰
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const eventStatus = getEventStatus(event as Event);
                  return (
                    <div
                      key={event.id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEventClick(event as Event)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${eventStatus.color}`}>
                          {eventStatus.label}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {EVENT_TYPE_OPTIONS.find(opt => opt.value === event.event_type)?.label || event.event_type}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(event.start_time).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{event.current_gen}기</span>
                          {event.is_attendance_required && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              출석 필수
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // 리스트 뷰
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일시</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">장소</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출석 필수</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => {
                    const eventStatus = getEventStatus(event as Event);
                    return (
                      <tr 
                        key={event.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleEventClick(event as Event)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {EVENT_TYPE_OPTIONS.find(opt => opt.value === event.event_type)?.label || event.event_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${eventStatus.color}`}>
                            {eventStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.current_gen}기
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>{new Date(event.start_time).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.location || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.is_attendance_required ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {event.is_attendance_required ? '필수' : '선택'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
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
      </div>

      {/* 이벤트 상세 모달 */}
      {showEventDetail && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          myAttendance={myAttendance}
          onClose={closeEventDetail}
        />
      )}
    </div>
  );
}

// 이벤트 상세 모달 컴포넌트
function EventDetailModal({ event, myAttendance, onClose }: {
  event: Event;
  myAttendance: Attendance | null;
  onClose: () => void;
}) {
  const eventStatus = getEventStatus(event);
  
  function getEventStatus(event: Event) {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = new Date(event.end_time);
    
    if (now < startTime) return { status: 'upcoming', label: '예정', color: 'bg-blue-100 text-blue-800' };
    if (now >= startTime && now <= endTime) return { status: 'ongoing', label: '진행중', color: 'bg-green-100 text-green-800' };
    return { status: 'ended', label: '종료', color: 'bg-gray-100 text-gray-800' };
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${eventStatus.color}`}>
                {eventStatus.label}
              </span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {EVENT_TYPE_OPTIONS.find(opt => opt.value === event.event_type)?.label || event.event_type}
              </span>
              {event.is_attendance_required && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  출석 필수
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 이벤트 정보 */}
        <div className="space-y-4 mb-6">
          {event.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">설명</h3>
              <p className="text-gray-900">{event.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">일시</h3>
              <div className="text-gray-900">
                <div className="flex items-center mb-1">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(event.start_time).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(event.start_time).toLocaleTimeString()} - {new Date(event.end_time).toLocaleTimeString()}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">장소</h3>
              <div className="text-gray-900">
                {event.location ? (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">기수</h3>
            <p className="text-gray-900">{event.current_gen}기</p>
          </div>
        </div>

        {/* 내 출석 정보 */}
        {event.is_attendance_required && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">출석 정보</h3>
            {myAttendance ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">출석 상태</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      ATTENDANCE_STATUS_OPTIONS.find(opt => opt.value === myAttendance.status)?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {ATTENDANCE_STATUS_OPTIONS.find(opt => opt.value === myAttendance.status)?.label || myAttendance.status}
                    </span>
                  </div>
                  {myAttendance.checked_in_at && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">체크인 시간</p>
                      <p className="text-sm text-gray-900">{new Date(myAttendance.checked_in_at).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {myAttendance.reason && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">사유</p>
                    <p className="text-sm text-gray-900">{myAttendance.reason}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">아직 출석 체크가 되지 않았습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* 닫기 버튼 */}
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
