import { useApi } from '@prometheus-fe/context';
import { Event, EventSummary, Attendance } from '@prometheus-fe/types';
import { useState, useCallback } from 'react';

export function useEvent() {
  const { event } = useApi();
  const [allEvents, setAllEvents] = useState<EventSummary[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventAttendances, setEventAttendances] = useState<Attendance[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(false);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);

  // 이벤트 목록 조회
  const getEventList = useCallback(async (params?: any) => {
    if (!event) {
      console.warn('event is not available. Ensure useEvent is used within ApiProvider.');
      setIsLoadingEvents(false);
      return { events: [], total: 0, page: 1, size: 20 };
    }
    try {
      setIsLoadingEvents(true);
      const data = await event.getEventList(params);
      setAllEvents(data.events || []);
      setTotal(data.total || 0);
      return data;
    } catch (error) {
      console.error('이벤트 목록 조회 실패:', error);
      setAllEvents([]);
      throw error;
    } finally {
      setIsLoadingEvents(false);
    }
  }, [event]);

  // 특정 이벤트 조회
  const getEvent = useCallback(async (eventId: number) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      setIsLoadingEvent(true);
      const data = await event.getEvent(eventId);
      setSelectedEvent(data);
      return data;
    } catch (error) {
      console.error(`이벤트 ${eventId} 조회 실패:`, error);
      throw error;
    } finally {
      setIsLoadingEvent(false);
    }
  }, [event]);

  // 이벤트 생성
  const createEvent = useCallback(async (formData: any) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      const response = await event.createEvent(formData);
      await getEventList();
      return response;
    } catch (error) {
      console.error('이벤트 생성 실패:', error);
      throw error;
    }
  }, [event, getEventList]);

  // 이벤트 수정
  const updateEvent = useCallback(async (eventId: number, data: any) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      const response = await event.updateEvent(eventId, data);
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(response);
      }
      await getEventList();
      return response;
    } catch (error) {
      console.error(`이벤트 ${eventId} 수정 실패:`, error);
      throw error;
    }
  }, [event, selectedEvent, getEventList]);

  // 이벤트 삭제
  const deleteEvent = useCallback(async (eventId: number) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      await event.deleteEvent(eventId);
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
      await getEventList();
    } catch (error) {
      console.error(`이벤트 ${eventId} 삭제 실패:`, error);
      throw error;
    }
  }, [event, selectedEvent, getEventList]);

  // 출석 목록 조회
  const fetchAttendances = useCallback(async (eventId: number, params?: any) => {
    if (!event) {
      console.warn('event is not available. Ensure useEvent is used within ApiProvider.');
      setIsLoadingAttendances(false);
      return { attendances: [], total: 0 };
    }
    try {
      setIsLoadingAttendances(true);
      const data = await event.getAttendanceList(eventId, params);
      setEventAttendances(data.attendances || []);
      return data;
    } catch (error) {
      console.error('출석 목록 조회 실패:', error);
      setEventAttendances([]);
      throw error;
    } finally {
      setIsLoadingAttendances(false);
    }
  }, [event]);

  // 출석 체크
  const createAttendance = useCallback(async (eventId: number, data: any) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      const response = await event.createAttendance(eventId, data);
      await fetchAttendances(eventId);
      return response;
    } catch (error) {
      console.error('출석 체크 실패:', error);
      throw error;
    }
  }, [event, fetchAttendances]);

  // 대량 출석 등록
  const createBulkAttendance = useCallback(async (eventId: number, data: any) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      const response = await event.createBulkAttendance(eventId, data);
      await fetchAttendances(eventId);
      return response;
    } catch (error) {
      console.error('대량 출석 등록 실패:', error);
      throw error;
    }
  }, [event, fetchAttendances]);

  // 출석 수정
  const updateAttendance = useCallback(async (eventId: number, attendanceId: number, data: any) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      const response = await event.updateAttendance(eventId, attendanceId, data);
      await fetchAttendances(eventId);
      return response;
    } catch (error) {
      console.error('출석 수정 실패:', error);
      throw error;
    }
  }, [event, fetchAttendances]);

  // 출석 삭제
  const deleteAttendance = useCallback(async (eventId: number, attendanceId: number) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      await event.deleteAttendance(eventId, attendanceId);
      await fetchAttendances(eventId);
    } catch (error) {
      console.error('출석 삭제 실패:', error);
      throw error;
    }
  }, [event, fetchAttendances]);

  // 일반 사용자용 이벤트 목록 조회 (verify 포함)
  const getPublicEventList = useCallback(async (params?: any) => {
    if (!event) {
      console.warn('event is not available. Ensure useEvent is used within ApiProvider.');
      setIsLoadingEvents(false);
      return { events: [], total: 0, page: 1, size: 20 };
    }
    try {
      setIsLoadingEvents(true);
      const data = await event.getPublicEventList(params);
      setAllEvents(data.events || []);
      setTotal(data.total || 0);
      return data;
    } catch (error) {
      console.error('일반 사용자 이벤트 목록 조회 실패:', error);
      setAllEvents([]);
      throw error;
    } finally {
      setIsLoadingEvents(false);
    }
  }, [event]);

  // 일반 사용자용 이벤트 상세 조회 (verify 포함)
  const getPublicEvent = useCallback(async (eventId: number) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      setIsLoadingEvent(true);
      const data = await event.getPublicEvent(eventId);
      setSelectedEvent(data);
      return data;
    } catch (error) {
      console.error(`일반 사용자 이벤트 ${eventId} 조회 실패:`, error);
      throw error;
    } finally {
      setIsLoadingEvent(false);
    }
  }, [event]);

  // 내 출석 기록 조회
  const getMyAttendances = useCallback(async (params?: any) => {
    if (!event) {
      console.warn('event is not available. Ensure useEvent is used within ApiProvider.');
      return [];
    }
    try {
      const data = await event.getMyAttendances(params);
      return data;
    } catch (error) {
      console.error('내 출석 기록 조회 실패:', error);
      throw error;
    }
  }, [event]);

  // 특정 이벤트 내 출석 조회
  const getMyAttendanceForEvent = useCallback(async (eventId: number) => {
    if (!event) {
      throw new Error('event is not available');
    }
    try {
      const data = await event.getMyAttendanceForEvent(eventId);
      return data;
    } catch (error) {
      console.error(`이벤트 ${eventId} 내 출석 조회 실패:`, error);
      throw error;
    }
  }, [event]);

  return {
    // 상태
    events: allEvents,
    selectedEvent,
    attendances: eventAttendances,
    total,
    isLoadingEvents,
    isLoadingEvent,
    isLoadingAttendances,
    
    // 관리자용 API 함수들
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
    
    // 일반 사용자용 API 함수들
    getPublicEventList,
    getPublicEvent,
    getMyAttendances,
    getMyAttendanceForEvent,
    
    // 핸들러들
    handleEventSelect: useCallback((event: any) => setSelectedEvent(event), []),
    handleEventDeselect: useCallback(() => setSelectedEvent(null), []),
  };
};
