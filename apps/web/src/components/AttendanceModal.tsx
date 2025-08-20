'use client';

import { useState, useEffect } from 'react';
import { Event, AttendanceStatus, MemberSummaryResponse } from '@prometheus-fe/types';
import { useEvent, useMyAttendance, useAttendanceCodeManagement, useAttendance, useAttendanceManagement } from '@prometheus-fe/hooks';
import GlassCard from './GlassCard';
import RedButton from './RedButton';
import Portal from './Portal';
import { MemberSelector } from './SearchMemberBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faCheck, 
  faTimes,
  faKey,
  faQrcode,
  faComment,
  faUsers,
  faExclamationTriangle,
  faList,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  isAdmin?: boolean;
}

export default function AttendanceModal({ 
  isOpen, 
  onClose, 
  event, 
  isAdmin = false
}: AttendanceModalProps) {
  const { getMyAttendanceForEvent, checkInAttendance } = useMyAttendance();
  const { generateAttendanceCode, deleteAttendanceCode, getAttendanceCode, isGenerating: isLoadingCode } = useAttendanceCodeManagement();
  const { attendances, isLoading: isLoadingAttendances, fetchAttendances } = useAttendance();
  const { updateAttendance, isUpdating: isUpdatingAttendance } = useAttendanceManagement();
  const { 
    participants, 
    isLoadingParticipants, 
    addParticipants, 
    removeParticipants, 
    fetchParticipants,
    setExcusedAbsence,
    updateExcusedAbsenceReason,
    myAttendances,
    fetchMyAttendances
  } = useEvent();

  const [myAttendance, setMyAttendance] = useState<any>(null);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [currentAttendanceCode, setCurrentAttendanceCode] = useState<string>('');
  const [editingAttendance, setEditingAttendance] = useState<{id: number, status: AttendanceStatus} | null>(null);

  // 참여자 관리 상태
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [editingExcusedAbsence, setEditingExcusedAbsence] = useState<{memberId: string, reason: string} | null>(null);
  const [editingAttendanceReason, setEditingAttendanceReason] = useState<string>('');
  const [showRemoveButton, setShowRemoveButton] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (event) {
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

        // Admin인 경우 출석 목록과 참여자 목록 가져오기
        if (isAdmin) {
          fetchAttendances(event.id);
          fetchParticipants(event.id);
          // 출석 코드 조회
          fetchAttendanceCode(event.id);
        }
      } else {
        // event가 null인 경우 내 출석 목록 가져오기
        fetchMyAttendances();
      }
    }
  }, [isOpen, event, getMyAttendanceForEvent, isAdmin, fetchAttendances, fetchParticipants, fetchMyAttendances]);

  if (!isOpen) return null;

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
      case 'excused':
        return 'bg-blue-500/20 text-blue-300';
      case 'not_attended':
        return 'bg-gray-500/20 text-gray-300';
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
      case 'excused':
        return '사유결석';
      case 'not_attended':
        return '미출석';
      default:
        return '미정';
    }
  };

  const handleGenerateCode = async () => {
    if (!event) return;
    
    try {
      await generateAttendanceCode(event.id);
      alert('출석 코드가 생성되었습니다.');
      fetchAttendances(event.id);
      fetchAttendanceCode(event.id); // 생성 후 코드 조회
    } catch (error: any) {
      alert(`출석 코드 생성 실패: ${error.message}`);
    }
  };

  const handleDeleteCode = async () => {
    if (!event) return;
    
    if (!confirm('정말 출석 코드를 삭제하시겠습니까?')) return;
    
    try {
      await deleteAttendanceCode(event.id);
      alert('출석 코드가 삭제되었습니다.');
      fetchAttendances(event.id);
      fetchAttendanceCode(event.id); // 삭제 후 코드 다시 조회
    } catch (error: any) {
      alert(`출석 코드 삭제 실패: ${error.message}`);
    }
  };

  const handleUpdateAttendanceStatus = async (attendanceId: number, newStatus: AttendanceStatus, reason?: string) => {
    if (!event) return;
    
    try {
      const updateData: any = { status: newStatus };
      if (reason && reason.trim()) {
        updateData.reason = reason.trim();
      }
      
      await updateAttendance(event.id, attendanceId, updateData);
      alert('출석 상태가 수정되었습니다.');
      fetchAttendances(event.id);
      fetchParticipants(event.id); // 참여자 목록도 다시 조회
      setEditingAttendance(null);
      setEditingAttendanceReason('');
    } catch (error: any) {
      alert(`출석 상태 수정 실패: ${error.message}`);
    }
  };

  // 참여자 관리 함수들
  const handleAddParticipants = async (members: MemberSummaryResponse[]) => {
    if (!event || members.length === 0) return;

    const memberIds = members.map(member => member.id);
    try {
      const result = await addParticipants(event.id, memberIds);
      alert(`참여자 추가 완료: ${result.added}명 추가, ${result.alreadyExists || 0}명 이미 존재`);
      fetchParticipants(event.id);
    } catch (error: any) {
      alert(`참여자 추가 실패: ${error.message}`);
    }
  };

  const handleRemoveParticipants = async () => {
    if (!event || selectedMemberIds.length === 0) return;
    
    if (!confirm(`선택된 ${selectedMemberIds.length}명의 참여자를 제거하시겠습니까?`)) return;

    try {
      const result = await removeParticipants(event.id, selectedMemberIds);
      alert(`참여자 제거 완료: ${result.removed}명 제거`);
      setSelectedMemberIds([]);
      fetchParticipants(event.id);
    } catch (error: any) {
      alert(`참여자 제거 실패: ${error.message}`);
    }
  };

  const handleParticipantSelection = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleParticipantCardClick = (memberId: string) => {
    setShowRemoveButton(showRemoveButton === memberId ? null : memberId);
  };

  const handleRemoveSingleParticipant = async (memberId: string) => {
    if (!event) return;
    
    if (!confirm('이 참여자를 제거하시겠습니까?')) return;

    try {
      const result = await removeParticipants(event.id, [memberId]);
      alert(`참여자 제거 완료: ${result.removed}명 제거`);
      setShowRemoveButton(null);
      fetchParticipants(event.id);
    } catch (error: any) {
      alert(`참여자 제거 실패: ${error.message}`);
    }
  };

  // 사유결석 관리 함수들
  const handleSetExcusedAbsence = async (memberId: string, reason: string) => {
    if (!event || !memberId.trim() || !reason.trim()) return;
    
    try {
      await setExcusedAbsence(event.id, memberId.trim(), reason.trim());
      alert('사유결석이 설정되었습니다.');
      fetchAttendances(event.id);
    } catch (error: any) {
      alert(`사유결석 설정 실패: ${error.message}`);
    }
  };

  const handleUpdateExcusedAbsenceReason = async () => {
    if (!event || !editingExcusedAbsence) return;
    
    try {
      await updateExcusedAbsenceReason(event.id, editingExcusedAbsence.memberId, editingExcusedAbsence.reason);
      alert('사유결석 사유가 수정되었습니다.');
      setEditingExcusedAbsence(null);
      fetchAttendances(event.id);
    } catch (error: any) {
      alert(`사유결석 사유 수정 실패: ${error.message}`);
    }
  };

  const handleEditExcusedAbsence = (memberId: string, currentReason: string) => {
    setEditingExcusedAbsence({ memberId, reason: currentReason });
  };

  // 출석 코드 조회 함수
  const fetchAttendanceCode = async (eventId: number) => {
    try {
      const codeData = await getAttendanceCode(eventId);
      setCurrentAttendanceCode(codeData.attendanceCode);
    } catch (error: any) {
      // 출석 코드가 없는 경우 (404 등) 빈 문자열로 설정
      setCurrentAttendanceCode('');
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0 relative z-10">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

          <div className="inline-block align-top bg-black/80 backdrop-blur-lg rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-top md:max-w-6xl max-w-lg sm:w-full relative border border-white/20 max-h-[80vh] flex flex-col">
            {/* 헤더 */}
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-shrink-0">
              <div className="text-center w-full">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 mb-4">
                  <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-kimm-bold text-white mb-2">
                  {event ? `출석 관리 - ${event.title}` : '내 출석 목록'}
                </h3>
                
                <div className="mt-4 flex justify-end space-x-3">
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
              {!event ? (
                // 내 출석 목록 모드
                <div className="mt-6 flex justify-center">
                  <div className="w-full max-w-2xl space-y-4">
                    {myAttendances.length === 0 ? (
                      <div className="text-center py-12">
                        <FontAwesomeIcon icon={faList} className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">출석 기록이 없습니다</h3>
                        <p className="text-gray-300">아직 참여한 이벤트가 없거나 출석 체크를 하지 않았습니다.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myAttendances.map((attendance) => (
                          <div key={attendance.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(attendance.status)}`}>
                                  {getStatusText(attendance.status)}
                                </span>
                                <span className="text-white font-medium">
                                  {attendance.eventTitle}
                                </span>
                              </div>
                              <div className="text-sm text-gray-300">
                                {attendance.checkedInAt && (
                                  <span>
                                    출석 시간: {new Date(attendance.checkedInAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-300">
                              <div className="flex items-center space-x-2 mb-1">
                                <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                                <span>{attendance.eventTitle} ({attendance.eventGen}기)</span>
                              </div>
                              {attendance.reason && (
                                <div className="flex items-center space-x-2">
                                  <FontAwesomeIcon icon={faComment} className="w-4 h-4" />
                                  <span>사유: {attendance.reason}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Admin 전용 출석 관리 - 좌우 분할 레이아웃
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 왼쪽: 참여자 관리 */}
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h3 className="font-semibold text-white mb-4 flex items-center">
                      <FontAwesomeIcon icon={faUsers} className="mr-2" />
                      참여자 관리
                    </h3>

                    <div className="space-y-4">
                      {/* 참여자 추가 */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-white">참여자 추가</h4>
                        <MemberSelector
                          onMemberSelect={(member) => handleAddParticipants([member])}
                          placeholder="멤버를 검색하여 추가하세요..."
                          className="w-full"
                        />
                      </div>

                      {/* 통합 참여자/출석 목록 */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white">참여자/출석 목록 ({participants.length}명)</h4>
                          {selectedMemberIds.length > 0 && (
                            <button
                              onClick={handleRemoveParticipants}
                              className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 rounded text-red-300 hover:bg-red-500/30 transition-colors flex items-center"
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-1 w-3 h-3" />
                              선택 제거 ({selectedMemberIds.length}명)
                            </button>
                          )}
                        </div>
                        
                        {isLoadingParticipants ? (
                          <div className="flex justify-center items-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                          </div>
                        ) : participants.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-300 text-sm">등록된 참여자가 없습니다.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {participants.map((participant) => {
                              // 해당 참여자의 출석 정보 찾기
                              const attendance = attendances.find(att => att.memberId === participant.memberId);
                              const isRemoveButtonVisible = showRemoveButton === participant.memberId;
                              
                              return (
                                <div 
                                  key={participant.memberId} 
                                  className={`relative flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                                    selectedMemberIds.includes(participant.memberId)
                                      ? 'bg-blue-500/20 border-blue-500/30'
                                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                                  }`}
                                  onClick={() => handleParticipantCardClick(participant.memberId)}
                                >
                                  {/* 제거 버튼 - 카드 클릭 시 나타남 */}
                                  {isRemoveButtonVisible && (
                                    <div className="absolute -top-2 -right-2 z-10">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveSingleParticipant(participant.memberId);
                                        }}
                                        className="w-6 h-6 bg-red-500 border border-red-400 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                                        title="참여자 제거"
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                  
                                  {/* 왼쪽: 체크박스 및 멤버 정보 */}
                                   <div className="flex items-center space-x-2">
                                     <input
                                       type="checkbox"
                                       checked={selectedMemberIds.includes(participant.memberId)}
                                       onChange={(e) => {
                                         e.stopPropagation();
                                         handleParticipantSelection(participant.memberId);
                                       }}
                                       className="mr-2"
                                     />
                                     <div className="flex flex-col">
                                       <span className="text-white font-medium text-sm">
                                         {participant.memberName || participant.memberId}
                                       </span>
                                       {participant.memberGen !== undefined && (
                                         <span className="text-xs text-gray-400">
                                           {participant.memberGen}기
                                         </span>
                                       )}
                                       {/* 출석 정보 표시 */}
                                       {attendance && (
                                         <div className="text-xs text-gray-300 mt-1">
                                           {attendance.status === 'excused' && attendance.reason && (
                                             <div className="flex items-center space-x-1">
                                               <FontAwesomeIcon icon={faComment} className="w-3 h-3" />
                                               <span>사유: {attendance.reason}</span>
                                             </div>
                                           )}
                                        {(attendance.status === 'present' || attendance.status === 'late') && attendance.checkedInAt && (
                                              <div className="flex items-center space-x-1">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="w-3 h-3" />
                                                <span>시간: {new Date(attendance.checkedInAt).toLocaleString()}</span>
                                              </div>
                                            )}
                                         </div>
                                       )}
                                     </div>
                                     <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(participant.status)}`}>
                                       {getStatusText(participant.status)}
                                     </span>
                                   </div>

                                  {/* 오른쪽: 수정 버튼 및 사유 입력 */}
                                  <div className="flex items-center space-x-2">
                                    {editingAttendance?.id === (attendance?.id || 0) ? (
                                      <div className="flex items-center space-x-2">
                                        <select
                                          value={editingAttendance.status}
                                          onChange={(e) => setEditingAttendance({
                                            id: attendance?.id || 0,
                                            status: e.target.value as AttendanceStatus
                                          })}
                                          className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                        >
                                          <option value="present">출석</option>
                                          <option value="late">지각</option>
                                          <option value="absent">결석</option>
                                          <option value="excused">사유결석</option>
                                        </select>
                                        {editingAttendance.status === 'excused' && (
                                          <input
                                            type="text"
                                            placeholder="사유 입력"
                                            value={editingAttendanceReason}
                                            className="px-2 py-1 text-xs bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-red-500 w-24"
                                            onChange={(e) => setEditingAttendanceReason(e.target.value)}
                                          />
                                        )}
                                        <button
                                          onClick={() => {
                                            if (attendance) {
                                              const reason = editingAttendance.status === 'excused' ? editingAttendanceReason : undefined;
                                              handleUpdateAttendanceStatus(attendance.id, editingAttendance.status, reason);
                                            }
                                          }}
                                          disabled={isUpdatingAttendance || (editingAttendance.status === 'excused' && !editingAttendanceReason.trim())}
                                          className="px-2 py-1 text-xs bg-green-500/20 border border-green-500/30 rounded text-green-300 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                        >
                                          저장
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingAttendance(null);
                                            setEditingAttendanceReason('');
                                          }}
                                          className="px-2 py-1 text-xs bg-gray-500/20 border border-gray-500/30 rounded text-gray-300 hover:bg-gray-500/30 transition-colors"
                                        >
                                          취소
                                        </button>
                                      </div>
                                                                          ) : (
                                        <button
                                          onClick={() => {
                                            if (attendance) {
                                              setEditingAttendance({
                                                id: attendance.id,
                                                status: attendance.status
                                              });
                                              setEditingAttendanceReason(attendance.reason || '');
                                            }
                                          }}
                                          className="px-2 py-1 text-xs bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 hover:bg-blue-500/30 transition-colors"
                                        >
                                          수정
                                        </button>
                                      )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 오른쪽: 출석 코드 관리 */}
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <h3 className="font-semibold text-white mb-4 flex items-center">
                      <FontAwesomeIcon icon={faKey} className="mr-2" />
                      출석 코드 관리
                    </h3>

                                         <div className="space-y-4">
                       {event.isAttendanceCodeRequired ? (
                         currentAttendanceCode ? (
                           <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                             <div className="space-y-3">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-2">
                                   <FontAwesomeIcon icon={faQrcode} className="text-green-300" />
                                   <span className="text-green-300 text-sm font-medium">출석 코드가 생성되어 있습니다</span>
                                 </div>
                                 <button
                                   onClick={handleDeleteCode}
                                   disabled={isLoadingCode}
                                   className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 rounded text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                 >
                                   삭제
                                 </button>
                               </div>
                               <div className="bg-white/10 rounded-lg p-3 text-center">
                                 <div className="text-xs text-gray-300 mb-1">생성된 출석 코드</div>
                                 <div className="text-2xl font-mono font-bold text-green-300 tracking-widest">
                                   {currentAttendanceCode}
                                 </div>
                                 <div className="text-xs text-gray-400 mt-1">
                                   참가자들이 이 코드를 입력하여 출석할 수 있습니다
                                 </div>
                               </div>
                             </div>
                           </div>
                         ) : (
                           <div className="p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center space-x-2">
                                 <FontAwesomeIcon icon={faQrcode} className="text-gray-300" />
                                 <span className="text-gray-300 text-sm">출석 코드가 없습니다</span>
                               </div>
                               <button
                                 onClick={handleGenerateCode}
                                 disabled={isLoadingCode}
                                 className="px-3 py-1 text-sm bg-green-500/20 border border-green-500/30 rounded text-green-300 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                               >
                                 생성
                               </button>
                             </div>
                           </div>
                         )
                       ) : (
                         <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                           <div className="flex items-center space-x-2">
                             <FontAwesomeIcon icon={faQrcode} className="text-blue-300" />
                             <span className="text-blue-300 text-sm">코드 필수가 아닙니다</span>
                           </div>
                         </div>
                       )}
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* 사유결석 사유 수정 모달 */}
            {editingExcusedAbsence && (
              <Portal>
                <div className="fixed inset-0 z-60 overflow-y-auto">
                  <div className="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0 relative z-70">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setEditingExcusedAbsence(null)} />

                    <div className="inline-block align-top bg-black/80 backdrop-blur-lg rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-top md:max-w-md max-w-lg sm:w-full relative border border-white/20">
                      <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-shrink-0">
                        <div className="text-center w-full">
                          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-500/20 mb-4">
                            <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <h3 className="text-lg leading-6 font-kimm-bold text-white mb-2">
                            사유결석 사유 수정
                          </h3>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
                        <div className="mt-6 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">멤버 ID</label>
                            <input
                              type="text"
                              value={editingExcusedAbsence.memberId}
                              disabled
                              className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm text-white text-sm opacity-50"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-white mb-1">사유 <span className="text-red-400">*</span></label>
                            <textarea
                              value={editingExcusedAbsence.reason}
                              onChange={(e) => setEditingExcusedAbsence({
                                ...editingExcusedAbsence,
                                reason: e.target.value
                              })}
                              placeholder="사유결석 사유를 입력하세요"
                              rows={3}
                              className="mt-1 block w-full bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 sm:px-6 sm:pb-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={handleUpdateExcusedAbsenceReason}
                            disabled={!editingExcusedAbsence.reason.trim()}
                            className="flex-1 inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => setEditingExcusedAbsence(null)}
                            className="flex-1 inline-flex justify-center rounded-lg border border-white/30 shadow-sm px-4 py-2 bg-white/10 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Portal>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
