/**
 * 이벤트 비즈니스 로직 훅
 * 
 * 이벤트 관련 상태 관리, API 호출, 에러 처리를 담당하는 비즈니스 로직 계층
 */

import { useState, useCallback, useEffect } from 'react';
import { useApi } from '@prometheus-fe/context';
import {
  Event,
  Attendance,
  AttendanceStats,
  EventList,
  AttendanceList,
  EventFormData,
  AttendanceFormData,
  BulkAttendanceResult,
  EventFilter,
  AttendanceStatus,
  AttendanceCode,
  CheckInAttendanceData,
  Participant,
  ParticipantList,
  ParticipantRequest,
  ParticipantResult,
  ExcusedAbsenceRequest,
  UpdateExcusedAbsenceRequest,
  MyAttendance
} from '@prometheus-fe/types';

/**
 * 출석 가능한 이벤트 목록 관리 훅
 */
export function useAttendableEventList() {
  const { event } = useApi();
  const [attendableEvents, setAttendableEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendableEvents = useCallback(async (
    page: number = 1,
    size: number = 20,
    filter?: EventFilter
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result: EventList = await event.getAttendableEvents(page, size, filter);
      
      setAttendableEvents(result.events);
      setPagination(result.pagination);
    } catch (err: any) {
      const errorMessage = err?.message || '출석 가능한 이벤트 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('출석 가능한 이벤트 목록 조회 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const refreshAttendableEvents = useCallback(() => {
    fetchAttendableEvents(pagination.page, pagination.size);
  }, [fetchAttendableEvents, pagination.page, pagination.size]);

  return {
    attendableEvents,
    pagination,
    isLoading,
    error,
    fetchAttendableEvents,
    refreshAttendableEvents
  };
}

/**
 * 이벤트 목록 관리 훅
 */
export function useEventList() {
  const { event } = useApi();
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (
    page: number = 1,
    size: number = 20,
    filter?: EventFilter
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result: EventList = await event.getEvents(page, size, filter);
      
      setEvents(result.events);
      setPagination(result.pagination);
    } catch (err: any) {
      const errorMessage = err?.message || '이벤트 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('이벤트 목록 조회 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const refreshEvents = useCallback(() => {
    fetchEvents(pagination.page, pagination.size);
  }, [fetchEvents, pagination.page, pagination.size]);

  return {
    events,
    pagination,
    isLoading,
    error,
    fetchEvents,
    refreshEvents
  };
}

/**
 * 이벤트 상세 관리 훅
 */
export function useEventDetail(eventId?: number) {
  const { event } = useApi();
  const [eventDetail, setEventDetail] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await event.getEvent(id);
      setEventDetail(result);
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '이벤트 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('이벤트 상세 조회 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const refreshEvent = useCallback(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [fetchEvent, eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent]);

  return {
    event: eventDetail,
    isLoading,
    error,
    fetchEvent,
    refreshEvent
  };
}

/**
 * 이벤트 관리 훅 (관리자용)
 */
export function useEventManagement() {
  const { event } = useApi();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCallback(async (formData: EventFormData): Promise<Event> => {
    try {
      console.log('🚀 [EventManagement] 이벤트 생성 시작:', formData);
      setIsCreating(true);
      setError(null);

      // 폼 데이터 유효성 검사
      if (!formData.title.trim()) {
        throw new Error('이벤트 제목을 입력해주세요.');
      }
      if (formData.startTime >= formData.endTime) {
        throw new Error('시작 시간이 종료 시간보다 늦을 수 없습니다.');
      }
      // 과거 날짜 검증 제거 - 과거 날짜로도 이벤트 생성 가능

      console.log('✅ [EventManagement] 유효성 검사 통과, API 호출 중...');
      const result = await event.createEvent(formData);
      console.log('🎉 [EventManagement] 이벤트 생성 성공:', result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '이벤트 생성에 실패했습니다.';
      setError(errorMessage);
      console.error('❌ [EventManagement] 이벤트 생성 실패:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [event]);

  const updateEvent = useCallback(async (
    eventId: number, 
    formData: Partial<EventFormData>
  ): Promise<Event> => {
    try {
      setIsUpdating(true);
      setError(null);

      // 시간 유효성 검사 (시작/종료 시간이 모두 있는 경우)
      if (formData.startTime && formData.endTime && 
          formData.startTime >= formData.endTime) {
        throw new Error('시작 시간이 종료 시간보다 늦을 수 없습니다.');
      }

      const result = await event.updateEvent(eventId, formData);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '이벤트 수정에 실패했습니다.';
      setError(errorMessage);
      console.error('이벤트 수정 실패:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [event]);

  const deleteEvent = useCallback(async (eventId: number): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);

      console.log(`🗑️ [EventManagement] 이벤트 삭제 시작: ID ${eventId}`);
      await event.deleteEvent(eventId);
      console.log(`✅ [EventManagement] 이벤트 삭제 성공: ID ${eventId}`);
    } catch (err: any) {
      const errorMessage = err?.message || '이벤트 삭제에 실패했습니다.';
      setError(errorMessage);
      
      // 에러 상세 정보 로깅
      console.error(`❌ [EventManagement] 이벤트 삭제 실패: ID ${eventId}`, {
        message: err?.message,
        status: err?.status,
        data: err?.data,
        detail: err?.detail,
        stack: err?.stack
      });
      
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [event]);

  return {
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createEvent,
    updateEvent,
    deleteEvent
  };
}

/**
 * 출석 코드 관리 훅 (관리자용)
 */
export function useAttendanceCodeManagement() {
  const { event } = useApi();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAttendanceCode = useCallback(async (eventId: number): Promise<AttendanceCode> => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log(`🔐 [AttendanceCodeManagement] 출석 코드 생성 시작: 이벤트 ID ${eventId}`);
      const result = await event.generateAttendanceCode(eventId);
      console.log(`✅ [AttendanceCodeManagement] 출석 코드 생성 성공:`, result);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '출석 코드 생성에 실패했습니다.';
      setError(errorMessage);
      console.error('출석 코드 생성 실패:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [event]);

  const getAttendanceCode = useCallback(async (eventId: number): Promise<AttendanceCode> => {
    try {
      const result = await event.getAttendanceCode(eventId);
      return result;
    } catch (err: any) {
      console.error('출석 코드 조회 실패:', err);
      throw err;
    }
  }, [event]);

  const deleteAttendanceCode = useCallback(async (eventId: number): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);

      console.log(`🗑️ [AttendanceCodeManagement] 출석 코드 삭제 시작: 이벤트 ID ${eventId}`);
      await event.deleteAttendanceCode(eventId);
      console.log(`✅ [AttendanceCodeManagement] 출석 코드 삭제 성공: 이벤트 ID ${eventId}`);
    } catch (err: any) {
      const errorMessage = err?.message || '출석 코드 삭제에 실패했습니다.';
      setError(errorMessage);
      console.error('출석 코드 삭제 실패:', err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [event]);

  const checkAttendanceCode = useCallback(async (
    eventId: number, 
    attendanceCode: string
  ): Promise<{ isValid: boolean; message: string }> => {
    try {
      const result = await event.checkAttendanceCode(eventId, attendanceCode);
      return result;
    } catch (err: any) {
      console.error('출석 코드 확인 실패:', err);
      throw err;
    }
  }, [event]);

  return {
    isGenerating,
    isDeleting,
    error,
    generateAttendanceCode,
    getAttendanceCode,
    deleteAttendanceCode,
    checkAttendanceCode
  };
}

/**
 * 출석 관리 훅
 */
export function useAttendance(eventId?: number) {
  const { event } = useApi();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendances = useCallback(async (
    eventIdParam: number,
    statusFilter?: AttendanceStatus,
    memberIdFilter?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result: AttendanceList = await event.getAttendances(
        eventIdParam, 
        statusFilter, 
        memberIdFilter
      );
      
      setAttendances(result.attendances);
      setTotal(result.total);
    } catch (err: any) {
      const errorMessage = err?.message || '출석 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('출석 목록 조회 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const fetchAttendanceStats = useCallback(async (eventIdParam: number) => {
    try {
      const stats = await event.getAttendanceStats(eventIdParam);
      setAttendanceStats(stats);
      return stats;
    } catch (err: any) {
      console.error('출석 통계 조회 실패:', err);
      throw err;
    }
  }, [event]);

  const refreshAttendances = useCallback(() => {
    if (eventId) {
      fetchAttendances(eventId);
    }
  }, [fetchAttendances, eventId]);

  useEffect(() => {
    if (eventId) {
      fetchAttendances(eventId);
      fetchAttendanceStats(eventId);
    }
  }, [eventId, fetchAttendances, fetchAttendanceStats]);

  return {
    attendances,
    attendanceStats,
    total,
    isLoading,
    error,
    fetchAttendances,
    fetchAttendanceStats,
    refreshAttendances
  };
}

/**
 * 출석 관리 훅 (관리자용)
 */
export function useAttendanceManagement() {
  const { event } = useApi();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAttendance = useCallback(async (
    eventId: number, 
    formData: AttendanceFormData
  ): Promise<Attendance> => {
    try {
      setIsCreating(true);
      setError(null);

      if (!formData.memberId.trim()) {
        throw new Error('멤버 ID를 입력해주세요.');
      }

      const result = await event.createAttendance(eventId, formData);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '출석 체크에 실패했습니다.';
      setError(errorMessage);
      console.error('출석 생성 실패:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [event]);

  const updateAttendance = useCallback(async (
    eventId: number,
    attendanceId: number,
    formData: Partial<AttendanceFormData>
  ): Promise<Attendance> => {
    try {
      setIsUpdating(true);
      setError(null);

      const result = await event.updateAttendance(eventId, attendanceId, formData);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '출석 정보 수정에 실패했습니다.';
      setError(errorMessage);
      console.error('출석 수정 실패:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [event]);

  const deleteAttendance = useCallback(async (
    eventId: number,
    attendanceId: number
  ): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);

      await event.deleteAttendance(eventId, attendanceId);
    } catch (err: any) {
      const errorMessage = err?.message || '출석 정보 삭제에 실패했습니다.';
      setError(errorMessage);
      console.error('출석 삭제 실패:', err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, [event]);

  const bulkCreateAttendances = useCallback(async (
    eventId: number,
    attendancesData: AttendanceFormData[]
  ): Promise<BulkAttendanceResult> => {
    try {
      setIsBulkCreating(true);
      setError(null);

      if (attendancesData.length === 0) {
        throw new Error('출석 체크할 멤버가 없습니다.');
      }

      const result = await event.bulkCreateAttendances(eventId, attendancesData);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '대량 출석 체크에 실패했습니다.';
      setError(errorMessage);
      console.error('대량 출석 생성 실패:', err);
      throw err;
    } finally {
      setIsBulkCreating(false);
    }
  }, [event]);

  return {
    isCreating,
    isUpdating,
    isDeleting,
    isBulkCreating,
    error,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    bulkCreateAttendances
  };
}

/**
 * 내 출석 기록 관리 훅
 */
export function useMyAttendance() {
  const { event } = useApi();
  const [myAttendances, setMyAttendances] = useState<MyAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyAttendances = useCallback(async (
    eventId?: number,
    statusFilter?: AttendanceStatus
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await event.getMyAttendances(eventId, statusFilter);
      setMyAttendances(result);
    } catch (err: any) {
      const errorMessage = err?.message || '내 출석 기록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('내 출석 기록 조회 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  const getMyAttendanceForEvent = useCallback(async (
    eventId: number
  ): Promise<MyAttendance | null> => {
    try {
      const result = await event.getMyAttendanceForEvent(eventId);
      return result;
    } catch (err: any) {
      console.error('특정 이벤트 출석 정보 조회 실패:', err);
      throw err;
    }
  }, [event]);

  const checkInAttendance = useCallback(async (
    eventId: number,
    data?: CheckInAttendanceData
  ): Promise<MyAttendance> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await event.checkInAttendance(eventId, data);
      
      // 출석 체크 성공 후 해당 이벤트의 출석 정보 업데이트
      const updatedAttendance = await event.getMyAttendanceForEvent(eventId);
      if (updatedAttendance) {
        setMyAttendances(prev => 
          prev.map(att => 
            att.eventId === eventId ? updatedAttendance : att
          )
        );
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '출석 체크에 실패했습니다.';
      setError(errorMessage);
      console.error('출석 체크 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  return {
    myAttendances,
    isLoading,
    error,
    fetchMyAttendances,
    getMyAttendanceForEvent,
    checkInAttendance
  };
}

/**
 * 참여자 관리 훅 (관리자용)
 */
export function useParticipantManagement() {
  const { event } = useApi();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const addParticipants = useCallback(async (
    eventId: number,
    memberIds: string[]
  ): Promise<ParticipantResult> => {
    try {
      setIsAdding(true);
      setError(null);

      if (memberIds.length === 0) {
        throw new Error('추가할 멤버를 선택해주세요.');
      }

      const result = await event.addParticipants(eventId, { memberIds });
      
      // 참여자 목록 새로고침
      await fetchParticipants(eventId);
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '참여자 추가에 실패했습니다.';
      setError(errorMessage);
      console.error('참여자 추가 실패:', err);
      throw err;
    } finally {
      setIsAdding(false);
    }
  }, [event]);

  const removeParticipants = useCallback(async (
    eventId: number,
    memberIds: string[]
  ): Promise<ParticipantResult> => {
    try {
      setIsRemoving(true);
      setError(null);

      if (memberIds.length === 0) {
        throw new Error('제거할 멤버를 선택해주세요.');
      }

      const result = await event.removeParticipants(eventId, { memberIds });
      
      // 참여자 목록 새로고침
      await fetchParticipants(eventId);
      
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '참여자 제거에 실패했습니다.';
      setError(errorMessage);
      console.error('참여자 제거 실패:', err);
      throw err;
    } finally {
      setIsRemoving(false);
    }
  }, [event]);

  const fetchParticipants = useCallback(async (eventId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await event.getParticipants(eventId);
      setParticipants(result.participants);
      setTotal(result.total);
    } catch (err: any) {
      const errorMessage = err?.message || '참여자 목록을 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('참여자 목록 조회 실패:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [event]);

  return {
    participants,
    total,
    isLoading,
    isAdding,
    isRemoving,
    error,
    addParticipants,
    removeParticipants,
    fetchParticipants
  };
}

/**
 * 통합 이벤트 훅 (편의 훅)
 */
export function useEvent() {
  const eventList = useEventList();
  const attendableEventList = useAttendableEventList();
  const eventManagement = useEventManagement();
  const attendanceCodeManagement = useAttendanceCodeManagement();
  const attendanceManagement = useAttendanceManagement();
  const myAttendance = useMyAttendance();
  const participantManagement = useParticipantManagement();
  const excusedAbsenceManagement = useExcusedAbsenceManagement();

  return {
    // 이벤트 목록 관련
    events: eventList.events,
    pagination: eventList.pagination,
    isLoadingEvents: eventList.isLoading,
    eventListError: eventList.error,
    fetchEvents: eventList.fetchEvents,
    refreshEvents: eventList.refreshEvents,

    // 출석 가능한 이벤트 목록 관련
    attendableEvents: attendableEventList.attendableEvents,
    attendablePagination: attendableEventList.pagination,
    isLoadingAttendableEvents: attendableEventList.isLoading,
    attendableEventListError: attendableEventList.error,
    fetchAttendableEvents: attendableEventList.fetchAttendableEvents,
    refreshAttendableEvents: attendableEventList.refreshAttendableEvents,

    // 이벤트 관리 관련
    isCreating: eventManagement.isCreating,
    isUpdating: eventManagement.isUpdating,
    isDeleting: eventManagement.isDeleting,
    managementError: eventManagement.error,
    createEvent: eventManagement.createEvent,
    updateEvent: eventManagement.updateEvent,
    deleteEvent: eventManagement.deleteEvent,

    // 출석 코드 관리 관련
    isGeneratingAttendanceCode: attendanceCodeManagement.isGenerating,
    isDeletingAttendanceCode: attendanceCodeManagement.isDeleting,
    attendanceCodeError: attendanceCodeManagement.error,
    generateAttendanceCode: attendanceCodeManagement.generateAttendanceCode,
    getAttendanceCode: attendanceCodeManagement.getAttendanceCode,
    deleteAttendanceCode: attendanceCodeManagement.deleteAttendanceCode,
    checkAttendanceCode: attendanceCodeManagement.checkAttendanceCode,

    // 출석 관리 관련
    isCreatingAttendance: attendanceManagement.isCreating,
    isUpdatingAttendance: attendanceManagement.isUpdating,
    isDeletingAttendance: attendanceManagement.isDeleting,
    isBulkCreatingAttendance: attendanceManagement.isBulkCreating,
    attendanceManagementError: attendanceManagement.error,
    createAttendance: attendanceManagement.createAttendance,
    updateAttendance: attendanceManagement.updateAttendance,
    deleteAttendance: attendanceManagement.deleteAttendance,
    bulkCreateAttendances: attendanceManagement.bulkCreateAttendances,

    // 내 출석 기록 관련
    myAttendances: myAttendance.myAttendances,
    isLoadingMyAttendances: myAttendance.isLoading,
    myAttendanceError: myAttendance.error,
    fetchMyAttendances: myAttendance.fetchMyAttendances,
    getMyAttendanceForEvent: myAttendance.getMyAttendanceForEvent,
    checkInAttendance: myAttendance.checkInAttendance,

    // 참여자 관리 관련
    isAddingParticipants: participantManagement.isAdding,
    isRemovingParticipants: participantManagement.isRemoving,
    participantError: participantManagement.error,
    addParticipants: participantManagement.addParticipants,
    removeParticipants: participantManagement.removeParticipants,
    fetchParticipants: participantManagement.fetchParticipants,
    participants: participantManagement.participants,
    totalParticipants: participantManagement.total,
    isLoadingParticipants: participantManagement.isLoading,

    // 사유결석 관리 관련
    isSettingExcusedAbsence: excusedAbsenceManagement.isSetting,
    isUpdatingExcusedAbsence: excusedAbsenceManagement.isUpdating,
    excusedAbsenceError: excusedAbsenceManagement.error,
    setExcusedAbsence: excusedAbsenceManagement.setExcusedAbsence,
    updateExcusedAbsenceReason: excusedAbsenceManagement.updateExcusedAbsenceReason
  };
}

/**
 * 사유결석 관리 훅 (관리자용)
 */
export function useExcusedAbsenceManagement() {
  const { event } = useApi();
  const [isSetting, setIsSetting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setExcusedAbsence = useCallback(async (
    eventId: number,
    memberId: string,
    reason: string
  ): Promise<Attendance> => {
    try {
      setIsSetting(true);
      setError(null);

      if (!memberId.trim()) {
        throw new Error('멤버 ID를 입력해주세요.');
      }
      if (!reason.trim()) {
        throw new Error('사유를 입력해주세요.');
      }

      const result = await event.setExcusedAbsence(eventId, { memberId, reason });
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '사유결석 설정에 실패했습니다.';
      setError(errorMessage);
      console.error('사유결석 설정 실패:', err);
      throw err;
    } finally {
      setIsSetting(false);
    }
  }, [event]);

  const updateExcusedAbsenceReason = useCallback(async (
    eventId: number,
    memberId: string,
    reason: string
  ): Promise<Attendance> => {
    try {
      setIsUpdating(true);
      setError(null);

      if (!reason.trim()) {
        throw new Error('사유를 입력해주세요.');
      }

      const result = await event.updateExcusedAbsenceReason(eventId, memberId, { reason });
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '사유결석 사유 수정에 실패했습니다.';
      setError(errorMessage);
      console.error('사유결석 사유 수정 실패:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [event]);

  return {
    isSetting,
    isUpdating,
    error,
    setExcusedAbsence,
    updateExcusedAbsenceReason
  };
}
