'use client';

import { useState, useEffect } from 'react';
import { useEvent, useEventDetail, useAttendance, useAttendanceManagement } from '@prometheus-fe/hooks';
import type { Event, EventFormData, AttendanceFormData, EventType, AttendanceStatus, AttendanceCode } from '@prometheus-fe/types';
import GlassCard from './GlassCard';
import RedButton from './RedButton';
import Portal from './Portal';
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
    <Portal>
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
    </Portal>
  );
}

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
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          </div>

          <div className="inline-block align-bottom bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-shrink-0">
              <div className="text-center w-full">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                  <FontAwesomeIcon icon={faCalendarAlt} className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-white mb-2">
                  {isEditing ? (event ? '이벤트 수정' : '새 이벤트 생성') : '이벤트 상세'}
                </h3>
                <p className="text-sm text-gray-300">
                  {isEditing ? '이벤트 정보를 입력해주세요.' : '이벤트 상세 정보를 확인하세요.'}
                </p>
                
                {/* Button area */}
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

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
              {(isEditing || !event) ? (
                // EventForm mode (for editing existing or creating new)
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (onSave) {
                    // This would need proper form data handling
                    onSave({
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
                }} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">제목</label>
                    <input
                      type="text"
                      defaultValue={event?.title || ''}
                      className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {/* Add more form fields as needed */}
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
              ) : (
                // General event detail mode
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                    <p className="text-gray-300 mt-2">{event.description}</p>
                  </div>
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}