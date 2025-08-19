'use client';

import { useState, useEffect } from 'react';
import { Event, AttendanceStatus } from '@prometheus-fe/types';
import { useEvent, useMyAttendance } from '@prometheus-fe/hooks';
import GlassCard from './GlassCard';
import RedButton from './RedButton';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faMapMarkerAlt, 
  faCheck, 
  faClock, 
  faTimes,
  faEdit,
  faKey,
  faEye,
  faTrash,
  faCopy,
  faCheck as faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  isAdmin?: boolean;
  onEdit?: (event: Event) => void;
}

export default function EventModal({ 
  isOpen, 
  onClose, 
  event, 
  isAdmin = false,
  onEdit 
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

  const handleCheckIn = async () => {
    if (!event) return;
    
    try {
      setIsCheckingIn(true);
      const data = event.isAttendanceCodeRequired && attendanceCode ? { attendanceCode } : undefined;
      const result = await checkInAttendance(event.id, data);
      setMyAttendance(result);
      alert('출석 체크가 완료되었습니다!');
    } catch (error: any) {
      console.error('출석 체크 실패:', error);
      alert(error.message || '출석 체크에 실패했습니다.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!event) return;
    
    try {
      const result = await generateAttendanceCode(event.id);
      // 생성된 코드를 직접 설정
      if (result && result.attendanceCode) {
        setCurrentAttendanceCode(result.attendanceCode);
      } else {
        // 생성 후 다시 조회
        await fetchCurrentAttendanceCode();
      }
      alert('출석 코드가 생성되었습니다!');
    } catch (error: any) {
      alert(error.message || '출석 코드 생성에 실패했습니다.');
    }
  };

  const handleDeleteCode = async () => {
    if (!event) return;
    
    if (!confirm('출석 코드를 삭제하시겠습니까?')) return;
    
    try {
      await deleteAttendanceCode(event.id);
      setCurrentAttendanceCode(null);
      alert('출석 코드가 삭제되었습니다!');
    } catch (error: any) {
      alert(error.message || '출석 코드 삭제에 실패했습니다.');
    }
  };

  const handleCopyCode = () => {
    if (currentAttendanceCode) {
      navigator.clipboard.writeText(currentAttendanceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTestCode = async () => {
    if (!event || !testCode) return;
    
    try {
      const result = await checkAttendanceCode(event.id, testCode);
      setTestResult({
        isValid: result.isValid,
        message: result.isValid ? '올바른 코드입니다!' : '잘못된 코드입니다.'
      });
    } catch (error: any) {
      setTestResult({
        isValid: false,
        message: error.message || '코드 확인에 실패했습니다.'
      });
    }
  };

  const canCheckIn = () => {
    if (!event || myAttendance) return false;
    
    const now = new Date();
    const attendanceStart = event.attendanceStartTime || event.startTime;
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    
    return attendanceStart <= now && attendanceEnd >= now;
  };

  const getCheckInMessage = () => {
    if (!event) return '';
    if (myAttendance) return '이미 출석 체크가 완료되었습니다.';
    
    const now = new Date();
    const attendanceStart = event.attendanceStartTime || event.startTime;
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    
    if (attendanceStart > now) {
      const timeDiff = Math.ceil((attendanceStart.getTime() - now.getTime()) / (1000 * 60));
      return `출석 가능 시간까지 ${timeDiff}분 남았습니다.`;
    }
    
    if (attendanceEnd < now) {
      return '출석 가능 시간이 종료되었습니다.';
    }
    
    const lateThreshold = event.lateThresholdMinutes || 15;
    const lateDeadline = new Date(attendanceStart.getTime() + lateThreshold * 60 * 1000);
    
    if (now <= lateDeadline) {
      return '출석 체크가 가능합니다.';
    } else {
      return '지각 처리됩니다. 출석 체크가 가능합니다.';
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-500/20 text-green-300';
      case 'late':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'absent':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return '출석';
      case 'late':
        return '지각';
      case 'absent':
        return '결석';
      default:
        return '미정';
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{event.title}</h2>
          <div className="flex items-center space-x-2">
            {isAdmin && onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-1 h-3 w-3" />
                수정
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 이벤트 정보 */}
          <div className="space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
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
              </div>
              
              {event.description && (
                <p className="text-gray-300 text-sm mb-3">{event.description}</p>
              )}

              <div className="space-y-2 text-sm text-gray-300">
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
              </div>
            </div>

            {/* 출석 체크 섹션 (일반 사용자용) */}
            {!isAdmin && event.isAttendanceRequired && (
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">출석 체크</h3>
                
                {isLoadingAttendance ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                  </div>
                ) : myAttendance ? (
                  <div className="text-center">
                    <div className={`inline-block px-3 py-2 rounded-lg ${getStatusColor(myAttendance.status)}`}>
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      {getStatusText(myAttendance.status)}
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      출석 시간: {new Date(myAttendance.checkInTime).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-300 text-sm mb-3">{getCheckInMessage()}</p>
                    
                    {event.isAttendanceCodeRequired && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-white mb-2">
                          출석 코드 (6자리 숫자)
                        </label>
                        <input
                          type="text"
                          value={attendanceCode}
                          onChange={(e) => setAttendanceCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg tracking-widest"
                          maxLength={6}
                          pattern="[0-9]{6}"
                        />
                      </div>
                    )}
                    
                    <RedButton
                      onClick={handleCheckIn}
                      disabled={!canCheckIn() || isCheckingIn || (event.isAttendanceCodeRequired && attendanceCode.length !== 6)}
                      className="inline-flex items-center"
                    >
                      <FontAwesomeIcon icon={faCheck} className="mr-2" />
                      {isCheckingIn ? '체크 중...' : '출석 체크'}
                    </RedButton>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin 전용 출석 코드 관리 */}
          {isAdmin && event.isAttendanceCodeRequired && (
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <FontAwesomeIcon icon={faKey} className="mr-2" />
                출석 코드 관리
              </h3>

              {/* 현재 출석 코드 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2">현재 출석 코드</h4>
                {isLoadingAttendanceCode ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                  </div>
                ) : currentAttendanceCode ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md text-center text-lg tracking-widest font-mono">
                      {currentAttendanceCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-md text-blue-300 hover:bg-blue-500/30 transition-colors"
                      title="복사"
                    >
                      <FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">생성된 출석 코드가 없습니다.</p>
                )}
              </div>

              {/* 출석 코드 관리 버튼 */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={handleGenerateCode}
                  disabled={isGeneratingAttendanceCode}
                  className="flex-1 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-md text-green-300 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faKey} className="mr-1 h-3 w-3" />
                  {isGeneratingAttendanceCode ? '생성 중...' : '코드 생성'}
                </button>
                {currentAttendanceCode && (
                  <button
                    onClick={handleDeleteCode}
                    disabled={isDeletingAttendanceCode}
                    className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* 코드 테스트 */}
              <div>
                <h4 className="text-sm font-medium text-white mb-2">코드 테스트</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="flex-1 px-3 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center"
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                  <button
                    onClick={handleTestCode}
                    disabled={testCode.length !== 6}
                    className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-md text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={faEye} className="h-3 w-3" />
                  </button>
                </div>
                                 {testResult && (
                   <div className={`flex items-center space-x-2 text-sm ${
                     testResult.isValid ? 'text-green-300' : 'text-red-300'
                   }`}>
                     <FontAwesomeIcon 
                       icon={testResult.isValid ? faCheckCircle : faExclamationTriangle} 
                       className="w-4 h-4" 
                     />
                     <span>{testResult.message}</span>
                   </div>
                 )}
                 <p className="text-xs text-gray-400 mt-2">
                   출석 생성은 상세보기에서 하세요
                 </p>
              </div>

              {attendanceCodeError && (
                <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 text-sm">
                  {attendanceCodeError}
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
