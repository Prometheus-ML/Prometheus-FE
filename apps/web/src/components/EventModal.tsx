'use client';

import { useState, useEffect } from 'react';
import { Event, EventFormData, EventType } from '@prometheus-fe/types';
import { useEvent } from '@prometheus-fe/hooks';
import GlassCard from './GlassCard';
import RedButton from './RedButton';
import Portal from './Portal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faTimes,
  faEdit,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

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
  isEditing = false
}: EventModalProps) {
  const { getMyAttendanceForEvent, checkInAttendance } = useMyAttendance();
  const { 
    generateAttendanceCode, 
    getAttendanceCode, 
    deleteAttendanceCode, 
    checkAttendanceCode,
    isGeneratingAttendanceCode,
    isDeletingAttendanceCode,
    attendanceCodeError
  } = useEvent();

  const [myAttendance, setMyAttendance] = useState<any>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [currentAttendanceCode, setCurrentAttendanceCode] = useState<string | null>(null);
  const [isLoadingAttendanceCode, setIsLoadingAttendanceCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState<{ isValid: boolean; message: string } | null>(null);

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

      // Admin 모드일 때 현재 출석 코드 조회
      if (isAdmin) {
        fetchCurrentAttendanceCode();
      }
    }
  }, [isOpen, event, getMyAttendanceForEvent, isAdmin]);

  const fetchCurrentAttendanceCode = async () => {
    if (!event) return;
    
    try {
      setIsLoadingAttendanceCode(true);
      const code = await getAttendanceCode(event.id);
      setCurrentAttendanceCode(code.attendanceCode);
    } catch (error: any) {
      console.error('출석 코드 조회 실패:', error);
      // 404 에러는 코드가 없는 것이므로 null로 설정
      if (error.status === 404) {
        setCurrentAttendanceCode(null);
      } else {
        console.error('출석 코드 조회 중 오류 발생:', error);
      }
    } finally {
      setIsLoadingAttendanceCode(false);
    }
  };

  // 시간 제약 조건 검증 함수
  const validateTimeConstraints = (formData: EventFormData): string | null => {
    const {
      startTime,
      endTime,
      attendanceStartTime,
      attendanceEndTime,
      lateThresholdMinutes,
      isAttendanceRequired
    } = formData;

    // 기본 시간 제약
    if (startTime >= endTime) {
      return '종료 시간은 시작 시간보다 늦어야 합니다.';
    }

    if (!isAttendanceRequired) {
      return null;
    }

    // attendanceStartTime과 attendanceEndTime이 undefined일 수 있으므로 체크
    if (!attendanceStartTime || !attendanceEndTime) {
      return '출석 시작 시간과 종료 시간을 모두 설정해주세요.';
    }

    // 출석 관련 시간 제약
    if (attendanceStartTime < startTime) {
      return '출석 시작 시간은 이벤트 시작 시간보다 늦거나 같아야 합니다.';
    }

    if (attendanceEndTime > endTime) {
      return '출석 종료 시간은 이벤트 종료 시간보다 빠르거나 같아야 합니다.';
    }

    if (attendanceStartTime >= attendanceEndTime) {
      return '출석 종료 시간은 출석 시작 시간보다 늦어야 합니다.';
    }

    const lateDeadline = new Date(attendanceStartTime.getTime() + lateThresholdMinutes * 60 * 1000);
    if (lateDeadline > attendanceEndTime) {
      return '지각 기준 시간이 출석 종료 시간을 초과합니다.';
    }

    return null;
  };

  useEffect(() => {
    if (isOpen && event && isAdmin) {
      // Admin인 경우 참여자 목록 가져오기
      fetchParticipants(event.id);
    }
  }, [isOpen, event, isAdmin, fetchParticipants]);

  // EventForm 데이터 초기화
  useEffect(() => {
    if (event && isEditing) {
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

  // 실시간 시간 제약 조건 검증
  useEffect(() => {
    if (isEditing) {
      const error = validateTimeConstraints(formData);
      setValidationError(error);
    }
  }, [formData, isEditing]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 시간 제약 조건 검증
    const validationError = validateTimeConstraints(formData);
    if (validationError) {
      alert(validationError);
      return;
    }
    
    if (onSave) {
      onSave(formData);
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
                  {isEditing ? (event ? '이벤트 수정' : '새 이벤트 생성') : event?.title}
                </h3>
                
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
                // EventForm 모드 (수정 모드이거나 새 이벤트 생성)
                <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">제목 <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">설명</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">이벤트 타입 <span className="text-red-400">*</span></label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                        className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white text-sm"
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
                      <label className="block text-sm font-medium text-white mb-1">대상 기수 <span className="text-red-400">*</span></label>
                      <input
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
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">시작 시간 <span className="text-red-400">*</span></label>
                      <input
                        type="datetime-local"
                        value={formatDateForInput(formData.startTime)}
                        onChange={(e) => setFormData({ ...formData, startTime: parseDateFromInput(e.target.value) })}
                        className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white text-sm"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">과거 시간도 설정 가능합니다</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-1">종료 시간 <span className="text-red-400">*</span></label>
                      <input
                        type="datetime-local"
                        value={formatDateForInput(formData.endTime)}
                        onChange={(e) => setFormData({ ...formData, endTime: parseDateFromInput(e.target.value) })}
                        className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white text-sm"
                        required
                      />
                      <p className="text-xs text-gray-400 mt-1">시작 시간보다 늦어야 합니다</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-1">장소</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAttendanceRequired"
                        checked={formData.isAttendanceRequired}
                        onChange={(e) => setFormData({ ...formData, isAttendanceRequired: e.target.checked })}
                        className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-white/20 rounded bg-white/10"
                      />
                      <label htmlFor="isAttendanceRequired" className="text-sm text-white">
                        출석 필수
                      </label>
                    </div>

                    {formData.isAttendanceRequired && (
                      <div className="ml-6 space-y-3">
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-blue-300 mb-2">
                            <strong>시간 제약 조건:</strong> 시작시간 ≤ 출석시작시간 &lt; 출석시작시간+지각기준 ≤ 출석종료시간 ≤ 종료시간
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">출석 시작 시간</label>
                            <input
                              type="datetime-local"
                              value={formatDateForInput(formData.attendanceStartTime)}
                              onChange={(e) => setFormData({ ...formData, attendanceStartTime: parseDateFromInput(e.target.value) })}
                              className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">이벤트 시작 시간 이후</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white mb-1">출석 종료 시간</label>
                            <input
                              type="datetime-local"
                              value={formatDateForInput(formData.attendanceEndTime)}
                              onChange={(e) => setFormData({ ...formData, attendanceEndTime: parseDateFromInput(e.target.value) })}
                              className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white text-sm"
                            />
                            <p className="text-xs text-gray-400 mt-1">이벤트 종료 시간 이전</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-1">지각 기준 (분)</label>
                          <input
                            type="number"
                            value={formData.lateThresholdMinutes}
                            onChange={(e) => setFormData({ ...formData, lateThresholdMinutes: parseInt(e.target.value) })}
                            className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                            min="1"
                          />
                          <p className="text-xs text-gray-400 mt-1">출석 시작 시간으로부터 지각으로 처리되는 시간</p>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isAttendanceCodeRequired"
                            checked={formData.isAttendanceCodeRequired}
                            onChange={(e) => setFormData({ ...formData, isAttendanceCodeRequired: e.target.checked })}
                            className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-white/20 rounded bg-white/10"
                          />
                          <label htmlFor="isAttendanceCodeRequired" className="text-sm text-white">
                            출석 코드 필수
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {event ? '수정' : '생성'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 inline-flex justify-center rounded-lg border border-white/30 shadow-sm px-4 py-2 bg-white/10 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      취소
                    </button>
                  </div>
                  
                  {/* 검증 오류 표시 */}
                  {validationError && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-sm">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                        {validationError}
                      </p>
                    </div>
                  )}
                </form>
              ) : (
                // 일반 이벤트 상세 모드
                <div className="mt-6 space-y-4">
                  {/* 이벤트 정보 */}
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
                        {event?.eventType}
                      </span>
                      {event?.isAttendanceRequired && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                          출석필수
                        </span>
                      )}
                      {event?.isAttendanceCodeRequired && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                          코드필수
                        </span>
                      )}
                    </div>
                    
                    {event?.description && (
                      <p className="text-gray-300 text-sm mb-3">{event.description}</p>
                    )}

                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                        <span>
                          {event?.startTime.toLocaleDateString()} {event?.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event?.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {event?.location && (
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
