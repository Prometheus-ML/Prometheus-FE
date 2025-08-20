'use client';

import { useState, useEffect } from 'react';
import type { Event, EventFormData, EventType, MyAttendance } from '@prometheus-fe/types';
import { useMyAttendance } from '@prometheus-fe/hooks';
import GlassCard from './GlassCard';
import RedButton from './RedButton';
import Portal from './Portal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faUserGraduate,
  faTimes,
  faKey,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

// EventModal 컴포넌트
interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  isAdmin?: boolean;
  onEdit?: (event: Event) => void;
  onSave?: (data: EventFormData) => void;
  isEditing?: boolean;
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  isAdmin = false,
  onEdit,
  onSave,
  isEditing = false,
}: EventModalProps) {
  const [activeTab, setActiveTab] = useState('detail');
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

  const [validationError, setValidationError] = useState<string | null>(null);
  
  // 출석 관련 상태
  const { getMyAttendanceForEvent, checkInAttendance } = useMyAttendance();
  const [myAttendance, setMyAttendance] = useState<MyAttendance | null>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // EventForm 데이터 초기화
  useEffect(() => {
    if (event && isEditing) {
      // 기존 이벤트 수정 모드
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
    } else if (!event && isEditing) {
      // 새 이벤트 생성 모드
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
  }, [event, isEditing, isOpen]);

  // 실시간 시간 조건 검증
  useEffect(() => {
    if (isEditing) {
      const error = validateTimeConstraints();
      setValidationError(error);
    }
  }, [formData, isEditing]);

  // 출석 정보 조회
  useEffect(() => {
    if (isOpen && event && !isAdmin && !isEditing) {
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
  }, [isOpen, event, isAdmin, isEditing, getMyAttendanceForEvent]);

  const formatDateForInput = (date: Date) => {
    // 로컬 시간대를 고려하여 YYYY-MM-DDTHH:mm 형식으로 변환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 시간 조건 검증 함수
  const validateTimeConstraints = () => {
    const { startTime, endTime, isAttendanceRequired, attendanceStartTime, attendanceEndTime, lateThresholdMinutes } = formData;
    
    // 기본 시간 조건: 시작 시간 <= 종료 시간
    if (startTime >= endTime) {
      return '시작 시간은 종료 시간보다 빨라야 합니다.';
    }

    // 출석이 필수인 경우에만 출석 시간 조건 검증
    if (isAttendanceRequired) {
      if (!attendanceStartTime || !attendanceEndTime) {
        return '출석 시작 시간과 종료 시간을 모두 설정해주세요.';
      }

      // 시작 시간 <= 출석 시작 시간
      if (startTime > attendanceStartTime) {
        return '출석 시작 시간은 이벤트 시작 시간보다 빨라야 합니다.';
      }

      // 출석 시작 시간 <= 출석 종료 시간
      if (attendanceStartTime >= attendanceEndTime) {
        return '출석 시작 시간은 출석 종료 시간보다 빨라야 합니다.';
      }

      // 출석 시작 시간 + 지각시간 <= 출석 종료 시간
      const lateThreshold = new Date(attendanceStartTime.getTime() + (lateThresholdMinutes * 60 * 1000));
      if (lateThreshold > attendanceEndTime) {
        return '출석 시작 시간 + 지각 기준 시간이 출석 종료 시간을 초과합니다.';
      }

      // 출석 종료 시간 <= 종료 시간
      if (attendanceEndTime > endTime) {
        return '출석 종료 시간은 이벤트 종료 시간보다 빨라야 합니다.';
      }
    }

    return null; // 검증 통과
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 시간 조건 검증
    const validationError = validateTimeConstraints();
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    if (onSave) {
      onSave(formData);
    }
  };

  // 출석 가능 여부 확인
  const canCheckIn = () => {
    if (!event) return false;
    
    // 이미 출석한 경우 출석 체크 불가
    if (myAttendance && myAttendance.status === 'present') return false;
    
    const now = new Date();
    const attendanceStart = event.attendanceStartTime || event.startTime;
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    
    return attendanceStart <= now && attendanceEnd >= now;
  };

  // 출석 체크
  const handleCheckIn = async () => {
    if (!event) return;
    
    try {
      setIsCheckingIn(true);
      setAttendanceError(null);
      
      const data = event.isAttendanceCodeRequired && attendanceCode ? { attendanceCode } : undefined;
      await checkInAttendance(event.id, data);
      
      // 출석 정보 다시 조회
      const updatedAttendance = await getMyAttendanceForEvent(event.id);
      setMyAttendance(updatedAttendance);
      setAttendanceCode('');
      
      alert('출석 체크가 완료되었습니다!');
    } catch (error: any) {
      setAttendanceError(error.message || '출석 체크에 실패했습니다.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Prometheus background */}
        <div className="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0 relative z-10">
          {/* 배경 오버레이 */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

          {/* 모달 컨텐츠 */}
          <div className="inline-block align-top bg-black/80 backdrop-blur-lg rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-top md:max-w-4xl max-w-lg sm:w-full relative border border-white/20 max-h-[80vh] flex flex-col">
            {/* 헤더 */}
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-shrink-0">
              <div className="text-center w-full">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                  <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-kimm-bold text-white mb-2">
                  {isEditing ? (event ? '이벤트 수정' : '새 이벤트 생성') : '이벤트 상세'}
                </h3>
                <p className="text-sm text-gray-300">
                  {isEditing ? '이벤트 정보를 입력해주세요.' : '이벤트 상세 정보를 확인하세요.'}
                </p>
                
                {/* 탭 네비게이션 */}
                {!isEditing && (
                  <div className="mt-4 border-b border-white/20">
                    <nav className="-mb-px flex space-x-8 justify-center">
                      {['detail', 'attendance'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab
                              ? 'border-red-500 text-red-400'
                              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          {tab === 'detail' ? '이벤트 정보' : '출석 관리'}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
                
                {/* 버튼 영역 */}
                <div className="mt-4 flex justify-end space-x-3">
                  {isAdmin && !isEditing && onEdit && event && (
                    <button
                      onClick={() => onEdit(event)}
                      className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
                      수정
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="inline-flex justify-center rounded-lg border border-white/30 shadow-sm px-4 py-2 bg-white/10 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
              {(isEditing || !event) ? (
                // EventForm mode (for editing existing or creating new)
                <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* 제목 */}
                  <div>
                      <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
                        제목 <span className="text-red-400">*</span>
                      </label>
                    <input
                        id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                      required
                    />
                  </div>

                    {/* 설명 */}
                  <div>
                      <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                        설명
                      </label>
                    <textarea
                        id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      {/* 이벤트 타입 */}
                    <div>
                        <label htmlFor="eventType" className="block text-sm font-medium text-white mb-1">
                          이벤트 타입 <span className="text-red-400">*</span>
                        </label>
                      <select
                          id="eventType"
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                          className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                      >
                        <option value="study">스터디</option>
                        <option value="project">프로젝트</option>
                        <option value="hackathon">해커톤</option>
                        <option value="seminar">세미나</option>
                        <option value="meeting">회의</option>
                        <option value="other">기타</option>
                      </select>
                    </div>

                      {/* 기수 */}
                    <div>
                        <label htmlFor="currentGen" className="block text-sm font-medium text-white mb-1">
                          기수 <span className="text-red-400">*</span>
                        </label>
                      <input
                          id="currentGen"
                        type="number"
                        value={formData.currentGen}
                        onChange={(e) => setFormData({ ...formData, currentGen: parseInt(e.target.value) })}
                          className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      {/* 시작 시간 */}
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-white mb-1">
                          시작 시간 <span className="text-red-400">*</span>
                        </label>
                      <input
                          id="startTime"
                        type="datetime-local"
                        value={formatDateForInput(formData.startTime)}
                        onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value) })}
                          className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                        required
                      />
                    </div>

                      {/* 종료 시간 */}
                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-white mb-1">
                          종료 시간 <span className="text-red-400">*</span>
                        </label>
                      <input
                          id="endTime"
                        type="datetime-local"
                        value={formatDateForInput(formData.endTime)}
                        onChange={(e) => setFormData({ ...formData, endTime: new Date(e.target.value) })}
                          className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                        required
                      />
                    </div>
                  </div>

                    {/* 장소 */}
                  <div>
                      <label htmlFor="location" className="block text-sm font-medium text-white mb-1">
                        장소
                      </label>
                    <input
                        id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                    />
                  </div>

                    {/* 출석 관련 설정 */}
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
                              <label htmlFor="attendanceStartTime" className="block text-sm font-medium text-white mb-1">
                                출석 시작 시간
                              </label>
                            <input
                                id="attendanceStartTime"
                              type="datetime-local"
                              value={formData.attendanceStartTime ? formatDateForInput(formData.attendanceStartTime) : ''}
                              onChange={(e) => setFormData({ ...formData, attendanceStartTime: new Date(e.target.value) })}
                                className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                            />
                          </div>

                          <div>
                              <label htmlFor="attendanceEndTime" className="block text-sm font-medium text-white mb-1">
                                출석 종료 시간
                              </label>
                            <input
                                id="attendanceEndTime"
                              type="datetime-local"
                              value={formData.attendanceEndTime ? formatDateForInput(formData.attendanceEndTime) : ''}
                              onChange={(e) => setFormData({ ...formData, attendanceEndTime: new Date(e.target.value) })}
                                className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                            />
                          </div>
                        </div>

                        <div>
                            <label htmlFor="lateThresholdMinutes" className="block text-sm font-medium text-white mb-1">
                              지각 기준 (분)
                            </label>
                          <input
                              id="lateThresholdMinutes"
                            type="number"
                            value={formData.lateThresholdMinutes}
                            onChange={(e) => setFormData({ ...formData, lateThresholdMinutes: parseInt(e.target.value) })}
                              className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
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

                  {/* 검증 오류 메시지 */}
                  {validationError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      ⚠️ {validationError}
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={!!validationError}
                        className={`inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${
                          event 
                            ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                            : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        }`}
                      >
                        {event ? '수정 완료' : '이벤트 생성'}
                      </button>
                    <button
                      type="button"
                      onClick={onClose}
                        className="inline-flex justify-center rounded-lg border border-white/30 shadow-sm px-4 py-2 bg-white/10 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      취소
                    </button>
                    </div>
                  </div>
                </form>
              ) : (
                // General event detail mode
                <div className="mt-6">
                  {activeTab === 'detail' && (
                    <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                    <p className="text-gray-300 mt-2">{event.description}</p>
                  </div>
                  
                  {/* 이벤트 기본 정보 */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">이벤트 타입:</span>
                      <p className="text-white">{event.eventType}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">기수:</span>
                      <p className="text-white">{event.currentGen}기</p>
                    </div>
                  </div>

                  {/* 날짜 및 시간 정보 */}
                  <div className="space-y-3">
                    <h5 className="text-md font-medium text-white">📅 날짜 및 시간</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">시작 시간:</span>
                        <p className="text-white">{event.startTime.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">종료 시간:</span>
                        <p className="text-white">{event.endTime.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {event.location && (
                      <div>
                        <span className="text-gray-400">📍 장소:</span>
                        <p className="text-white">{event.location}</p>
                      </div>
                    )}
                  </div>

                  {/* 출석 관련 정보 */}
                  {event.isAttendanceRequired && (
                    <div className="space-y-3">
                      <h5 className="text-md font-medium text-white">✅ 출석 관리</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">출석 시작:</span>
                          <p className="text-white">{event.attendanceStartTime?.toLocaleString() || '미설정'}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">출석 종료:</span>
                          <p className="text-white">{event.attendanceEndTime?.toLocaleString() || '미설정'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">지각 기준:</span>
                          <p className="text-white">{event.lateThresholdMinutes || 15}분</p>
                        </div>
                        <div>
                          <span className="text-gray-400">출석 코드:</span>
                          <p className="text-white">{event.isAttendanceCodeRequired ? '필수' : '선택'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 이벤트 상태 */}
                  <div className="space-y-2">
                    <h5 className="text-md font-medium text-white">📊 이벤트 상태</h5>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                        {event.eventType}
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
                          코드생성됨
                        </span>
                      )}
                    </div>
                  </div>
                    </div>
                  )}

                  {activeTab === 'attendance' && !isAdmin && event.isAttendanceRequired && (
                    <div className="space-y-3">
                      <h5 className="text-md font-medium text-white">✅ 출석 체크</h5>
                      
                      {isLoadingAttendance ? (
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                        </div>
                      ) : myAttendance ? (
                        myAttendance.status === 'present' ? (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faCheck} className="text-green-300" />
                            <span className="text-green-300 font-medium">출석 완료</span>
                          </div>
                          {myAttendance.checkedInAt && (
                            <p className="text-sm text-green-200 mt-1">
                              출석 시간: {new Date(myAttendance.checkedInAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        ) : myAttendance.status === 'not_attended' ? (
                          <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-3">
                              <FontAwesomeIcon icon={faTimes} className="text-gray-300" />
                              <span className="text-gray-300 font-medium">미출석</span>
                            </div>
                            
                            {canCheckIn() ? (
                              <div className="space-y-3">
                                {event.isAttendanceCodeRequired && (
                                  <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                      <FontAwesomeIcon icon={faKey} className="mr-1" />
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
                                
                                {!event.isAttendanceCodeRequired && (
                                  <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                      <FontAwesomeIcon icon={faKey} className="mr-1" />
                                      출석 코드
                                    </label>
                                    <input
                                      type="text"
                                      disabled
                                      placeholder="코드가 필요하지 않습니다"
                                      className="w-full px-3 py-2 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg cursor-not-allowed"
                                    />
                                  </div>
                                )}
                                
                                {attendanceError && (
                                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                                    <div className="flex items-center space-x-2">
                                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-300" />
                                      <span className="text-red-300 text-sm">{attendanceError}</span>
                                    </div>
                                  </div>
                                )}
                                
                                <button
                                  onClick={handleCheckIn}
                                  disabled={isCheckingIn || (event.isAttendanceCodeRequired && !attendanceCode.trim())}
                                  className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 w-full"
                                >
                                  {isCheckingIn ? (
                                    <div className="flex items-center">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                      출석 체크 중...
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                      출석하기
                                    </div>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-200">
                                아직 출석 체크를 하지 않았습니다
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-300" />
                              <span className="text-yellow-300 font-medium">
                                {myAttendance.status === 'absent' ? '결석' : 
                                 myAttendance.status === 'late' ? '지각' : 
                                 myAttendance.status === 'excused' ? '사유결석' : '미확인'}
                              </span>
                            </div>
                            {myAttendance.reason && (
                              <p className="text-sm text-yellow-200 mt-1">
                                사유: {myAttendance.reason}
                              </p>
                            )}
                          </div>
                        )
                      ) : canCheckIn() ? (
                        <div className="space-y-3">
                          {event.isAttendanceCodeRequired && (
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">
                                <FontAwesomeIcon icon={faKey} className="mr-1" />
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
                            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-300" />
                                <span className="text-red-300 text-sm">{attendanceError}</span>
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={handleCheckIn}
                            disabled={isCheckingIn || (event.isAttendanceCodeRequired && !attendanceCode.trim())}
                            className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 w-full"
                          >
                            {isCheckingIn ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                출석 체크 중...
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                                출석 체크
                              </div>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-300" />
                            <span className="text-yellow-300 font-medium">출석 기한이 아닙니다</span>
                          </div>
                          <p className="text-sm text-yellow-200 mt-1">
                            출석 가능 시간: {event.attendanceStartTime?.toLocaleString()} ~ {event.attendanceEndTime?.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}