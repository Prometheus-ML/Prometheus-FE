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
  AttendanceStatus
} from '@prometheus-fe/types';

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
      setIsCreating(true);
      setError(null);

      // 폼 데이터 유효성 검사
      if (!formData.title.trim()) {
        throw new Error('이벤트 제목을 입력해주세요.');
      }
      if (formData.startTime >= formData.endTime) {
        throw new Error('시작 시간이 종료 시간보다 늦을 수 없습니다.');
      }
      if (formData.startTime < new Date()) {
        throw new Error('과거 날짜로 이벤트를 생성할 수 없습니다.');
      }

      const result = await event.createEvent(formData);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || '이벤트 생성에 실패했습니다.';
      setError(errorMessage);
      console.error('이벤트 생성 실패:', err);
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

      await event.deleteEvent(eventId);
    } catch (err: any) {
      const errorMessage = err?.message || '이벤트 삭제에 실패했습니다.';
      setError(errorMessage);
      console.error('이벤트 삭제 실패:', err);
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
  const [myAttendances, setMyAttendances] = useState<Attendance[]>([]);
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
  ): Promise<Attendance | null> => {
    try {
      const result = await event.getMyAttendanceForEvent(eventId);
      return result;
    } catch (err: any) {
      console.error('특정 이벤트 출석 정보 조회 실패:', err);
      throw err;
    }
  }, [event]);

  const checkInAttendance = useCallback(async (
    eventId: number
  ): Promise<Attendance> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await event.checkInAttendance(eventId);
      
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
 * 통합 이벤트 훅 (편의 훅)
 */
export function useEvent() {
  const eventList = useEventList();
  const eventManagement = useEventManagement();
  const attendanceManagement = useAttendanceManagement();
  const myAttendance = useMyAttendance();

  return {
    // 이벤트 목록 관련
    events: eventList.events,
    pagination: eventList.pagination,
    isLoadingEvents: eventList.isLoading,
    eventListError: eventList.error,
    fetchEvents: eventList.fetchEvents,
    refreshEvents: eventList.refreshEvents,

    // 이벤트 관리 관련
    isCreating: eventManagement.isCreating,
    isUpdating: eventManagement.isUpdating,
    isDeleting: eventManagement.isDeleting,
    managementError: eventManagement.error,
    createEvent: eventManagement.createEvent,
    updateEvent: eventManagement.updateEvent,
    deleteEvent: eventManagement.deleteEvent,

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
    checkInAttendance: myAttendance.checkInAttendance
  };
}
