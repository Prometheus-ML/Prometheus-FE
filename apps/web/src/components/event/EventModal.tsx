'use client';

import { useState, useEffect } from 'react';
import type { Event, EventFormData, EventType } from '@prometheus-fe/types';
import Portal from '@/src/components/Portal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faUserGraduate,
  faCheck,
  faTimes
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
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventType: '스터디' as EventType,
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    currentGen: 0, // 기본값을 5기로 설정
    isAttendanceRequired: false,
    attendanceStartTime: new Date(),
    attendanceEndTime: new Date(),
    lateThresholdMinutes: 15,
    isAttendanceCodeRequired: false
  });

  const [validationError, setValidationError] = useState<string | null>(null);

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
      // 새 이벤트 생성 모드 - 기본값을 더 현실적으로 설정
      const now = new Date();
      const defaultStartTime = new Date(now.getTime() + 60 * 60 * 1000); // 1시간 후
      const defaultEndTime = new Date(defaultStartTime.getTime() + 2 * 60 * 60 * 1000); // 시작 후 2시간
      
      setFormData({
        title: '',
        description: '',
        eventType: '스터디' as EventType,
        startTime: defaultStartTime,
        endTime: defaultEndTime,
        location: '',
        currentGen: 5, // 기본값을 5기로 설정
        isAttendanceRequired: false,
        attendanceStartTime: defaultStartTime,
        attendanceEndTime: defaultEndTime,
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



  const formatDateForInput = (date: Date) => {
    // 로컬 시간대를 고려하여 YYYY-MM-DDTHH:mm 형식으로 변환 (24시간 형식)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 시간 조건 시각화를 위한 함수
  const getTimeConstraintVisualization = () => {
    if (!formData.isAttendanceRequired) return null;

    const startTime = formData.startTime;
    const endTime = formData.endTime;
    const attendanceStartTime = formData.attendanceStartTime || startTime;
    const attendanceEndTime = formData.attendanceEndTime || endTime;
    const lateThreshold = new Date(attendanceStartTime.getTime() + (formData.lateThresholdMinutes * 60 * 1000));

    return {
      startTime,
      endTime,
      attendanceStartTime,
      attendanceEndTime,
      lateThreshold
    };
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



  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Prometheus background */}
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0 relative z-10">
          {/* 배경 오버레이 */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

          {/* 모달 컨텐츠 */}
          <div className="inline-block align-middle bg-black/80 backdrop-blur-lg rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle md:max-w-4xl max-w-lg sm:w-full relative border border-white/20 max-h-[90vh] flex flex-col">
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
                   {isEditing ? (event ? '이벤트 정보를 수정해주세요.' : '새로운 이벤트 정보를 입력해주세요.') : '이벤트 상세 정보를 확인하세요.'}
                 </p>
                

                
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
                        <option value="스터디">스터디</option>
                        <option value="워크샵">워크샵</option>
                        <option value="세미나">세미나</option>
                        <option value="회의">회의</option>
                        <option value="데모데이">데모데이</option>
                        <option value="홈커밍데이">홈커밍데이</option>
                        <option value="네트워킹">네트워킹</option>
                        <option value="기타">기타</option>
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
                          className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
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
                          className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
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
                      <div className="ml-6 space-y-4">
                        {/* 시간 조건 시각화 */}
                        {(() => {
                          const timeViz = getTimeConstraintVisualization();
                          if (!timeViz) return null;

                          const formatTime = (date: Date) => {
                            return date.toLocaleTimeString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            });
                          };

                          return (
                              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                               <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                                 <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                 시간 조건 시각화
                               </h4>
                               <p className="text-xs text-gray-400 mb-3">
                                 시작시간 ≤ 출석시작시간 ≤ 출석시작시간+지각시간 ≤ 출석종료시간 ≤ 종료시간
                               </p>
                              {/* 타임라인 시각화 */}
                              <div className="mb-3">
                                <div className="relative h-8 bg-white/10 rounded-lg overflow-hidden">
                                  <div className="absolute inset-0 flex items-center justify-between px-2">
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                      <span className="text-xs text-white font-mono">{formatTime(timeViz.startTime)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                      <span className="text-xs text-white font-mono">{formatTime(timeViz.attendanceStartTime)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                      <span className="text-xs text-white font-mono">{formatTime(timeViz.lateThreshold)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                      <span className="text-xs text-white font-mono">{formatTime(timeViz.attendanceEndTime)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                      <span className="text-xs text-white font-mono">{formatTime(timeViz.endTime)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                  <span>시작</span>
                                  <span>출석시작</span>
                                  <span>지각기준</span>
                                  <span>출석종료</span>
                                  <span>종료</span>
                                </div>
                              </div>

                              {/* 시간 조정 입력 필드들 */}
                              <div className="grid grid-cols-3 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs text-gray-300 mb-1">출석 시작 시간</label>
                                  <input
                                    type="time"
                                    value={formData.attendanceStartTime ? formData.attendanceStartTime.toTimeString().slice(0, 5) : ''}
                                    onChange={(e) => {
                                      const [hours, minutes] = e.target.value.split(':');
                                      const newTime = new Date(formData.startTime); // 이벤트 시작 날짜 사용
                                      newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                      setFormData({ ...formData, attendanceStartTime: newTime });
                                    }}
                                    className="w-full px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white focus:ring-1 focus:ring-red-500 focus:border-red-500"
                                  />
                                </div>
                          <div>
                                  <label className="block text-xs text-gray-300 mb-1">출석 종료 시간</label>
                            <input
                                    type="time"
                                    value={formData.attendanceEndTime ? formData.attendanceEndTime.toTimeString().slice(0, 5) : ''}
                                    onChange={(e) => {
                                      const [hours, minutes] = e.target.value.split(':');
                                      const newTime = new Date(formData.endTime); // 이벤트 종료 날짜 사용
                                      newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                                      setFormData({ ...formData, attendanceEndTime: newTime });
                                    }}
                                    className="w-full px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            />
                          </div>
                          <div>
                                  <label className="block text-xs text-gray-300 mb-1">지각 허용 시간 (분)</label>
                            <input
                                    type="number"
                                    min="0"
                                    max="60"
                                    value={formData.lateThresholdMinutes}
                                    onChange={(e) => setFormData({ ...formData, lateThresholdMinutes: parseInt(e.target.value) || 0 })}
                                    className="w-full px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            />
                          </div>
                        </div>

                              {/* 시간 조건 체크리스트 */}
                              <div className="mt-3 space-y-1">
                                <div className={`flex items-center text-xs ${timeViz.startTime <= timeViz.attendanceStartTime ? 'text-green-400' : 'text-red-400'}`}>
                                  <FontAwesomeIcon icon={timeViz.startTime <= timeViz.attendanceStartTime ? faCheck : faTimes} className="mr-1" />
                                  시작 시간 ≤ 출석 시작 시간
                                </div>
                                <div className={`flex items-center text-xs ${timeViz.lateThreshold <= timeViz.attendanceEndTime ? 'text-green-400' : 'text-red-400'}`}>
                                  <FontAwesomeIcon icon={timeViz.lateThreshold <= timeViz.attendanceEndTime ? faCheck : faTimes} className="mr-1" />
                                  출석 시작 + 지각시간 ≤ 출석 종료
                                </div>
                                <div className={`flex items-center text-xs ${timeViz.attendanceEndTime <= timeViz.endTime ? 'text-green-400' : 'text-red-400'}`}>
                                  <FontAwesomeIcon icon={timeViz.attendanceEndTime <= timeViz.endTime ? faCheck : faTimes} className="mr-1" />
                                  출석 종료 ≤ 종료 시간
                                </div>
                              </div>
                              
                              {/* 기본값 리셋 버튼 */}
                              <div className="mt-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    // 기본값으로 리셋 - 이벤트 시작/종료 시간과 동일하게 설정
                                    setFormData({
                                      ...formData,
                                      attendanceStartTime: new Date(formData.startTime),
                                      attendanceEndTime: new Date(formData.endTime),
                                      lateThresholdMinutes: 15
                                    });
                                  }}
                                  className="w-full px-3 py-2 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                                >
                                  기본값으로 리셋
                                </button>
                              </div>
                            </div>
                          );
                        })()}



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
                      <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium flex items-center gap-1 ${event.currentGen <= 4 ? 'bg-gray-500/20 text-gray-300' : 'bg-[#8B0000] text-[#ffa282]'}`}>
                        {event.currentGen <= 4 ? '이전기수' : `${event.currentGen}기`}
                      </span>
                    </div>
                  </div>

                  {/* 날짜 및 시간 정보 */}
                  <div className="space-y-3">
                    <h5 className="text-md font-medium text-white flex items-center">
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                      날짜 및 시간
                    </h5>
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
                        <span className="text-gray-400 flex items-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                          장소:
                        </span>
                        <p className="text-white">{event.location}</p>
                      </div>
                    )}
                  </div>

                  {/* 출석 관련 정보 */}
                  {event.isAttendanceRequired && (
                    <div className="space-y-3">
                      <h5 className="text-md font-medium text-white flex items-center">
                        <FontAwesomeIcon icon={faCheck} className="mr-2" />
                        출석 관리
                      </h5>
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