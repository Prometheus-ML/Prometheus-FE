import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEvent, useMyAttendance } from '@prometheus-fe/hooks';
import { Event, EventFilter, AttendanceStatus, MyAttendance } from '@prometheus-fe/types';
import { useAuthStore } from '@prometheus-fe/stores';
import EventCard from '../components/events/EventCard';
import EventModal from '../components/events/EventModal';
import EventListModal from '../components/events/EventListModal';

export default function EventPage() {
  const router = useRouter();
  const { 
    events, 
    attendableEvents,
    myAttendances,
    fetchEvents,
    fetchAttendableEvents,
    fetchMyAttendances,
    isLoadingAttendableEvents,
    isLoadingMyAttendances
  } = useEvent();

  const { checkInAttendance } = useMyAttendance();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventListModal, setShowEventListModal] = useState(false);
  const [filter, setFilter] = useState<EventFilter>({});
  const [selectedAttendanceEvent, setSelectedAttendanceEvent] = useState<Event | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 출석 관련 상태
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // 사용자의 기수로 필터링
    const initialFilter: EventFilter = {};
    if (user?.gen) {
      initialFilter.gen = user.gen;
    }
    setFilter(initialFilter);
    fetchAttendableEvents(1, 10, initialFilter);
    fetchMyAttendances();
  }, [fetchAttendableEvents, fetchMyAttendances, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchAttendableEvents(1, 10, filter),
        fetchMyAttendances()
      ]);
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // 출석 체크
  const handleCheckIn = async (event: Event) => {
    try {
      setIsCheckingIn(true);
      setAttendanceError(null);
      
      const data = event.isAttendanceCodeRequired && attendanceCode ? { attendanceCode } : undefined;
      await checkInAttendance(event.id, data);
      
      setAttendanceCode('');
      Alert.alert('성공', '출석 체크가 완료되었습니다!');
      
      // 출석 목록 새로고침
      fetchMyAttendances();
    } catch (error: any) {
      setAttendanceError(error.message || '출석 체크에 실패했습니다.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // 출석 가능한 행사와 이전 출석 목록 분리
  const now = new Date();
  const attendableEventsList = attendableEvents.filter(event => {
    const attendanceEnd = event.attendanceEndTime || event.endTime;
    return attendanceEnd >= now;
  });

  const pastEventsList = myAttendances.filter(attendance => {
    // not_attended 상태가 아닌 출석 기록만 표시
    return attendance.status !== 'not_attended';
  });

  // 각 출석 가능한 행사에 대한 내 출석 상태 확인
  const getMyAttendanceForEvent = (eventId: number) => {
    return myAttendances.find(attendance => attendance.eventId === eventId);
  };

  // 출석 기록에서 이벤트 상세 정보 가져오기
  const handleAttendanceCardClick = async (attendance: MyAttendance) => {
    // 현재 로드된 이벤트 목록에서 해당 이벤트 찾기
    let eventDetail = events.find(event => event.id === attendance.eventId);
    
    if (!eventDetail) {
      // 이벤트가 로드되지 않은 경우, 전체 이벤트 목록에서 찾기
      eventDetail = attendableEvents.find(event => event.id === attendance.eventId);
    }
    
    if (eventDetail) {
      setSelectedAttendanceEvent(eventDetail);
      setShowEventModal(true);
    } else {
      // 여전히 찾을 수 없는 경우
      Alert.alert('오류', '이벤트 상세 정보를 가져올 수 없습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* 헤더 */}
      <View className="px-4 py-4 border-b border-white/20">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.push('/')}
              className="w-10 h-10 items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">출석하기</Text>
              <Text className="text-sm text-gray-300">내 출석 목록</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowEventListModal(true)}
            className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="list" size={16} color="white" />
            <Text className="text-white ml-2 font-medium">전체 행사</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4">
          {/* 출석 가능한 행사 */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text className="text-xl font-bold text-white ml-2">
                출석 가능한 행사
              </Text>
            </View>
            <Text className="text-white/70 mb-4">지금 출석 체크할 수 있는 행사</Text>
            
            {isLoadingAttendableEvents ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="text-white mt-2">로딩 중...</Text>
              </View>
            ) : attendableEventsList.length === 0 ? (
              <View className="bg-white/10 rounded-lg p-6 items-center border border-white/20">
                <Ionicons name="calendar-outline" size={48} color="#6B7280" />
                <Text className="text-lg font-medium text-white mt-4 mb-2">
                  출석 가능한 행사가 없습니다
                </Text>
                <Text className="text-gray-300 text-center">
                  현재 출석 체크할 수 있는 행사가 없습니다.
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {attendableEventsList.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    myAttendance={getMyAttendanceForEvent(event.id)}
                    onEventClick={handleEventClick}
                    onCheckIn={handleCheckIn}
                    isCheckingIn={isCheckingIn}
                    attendanceCode={attendanceCode}
                    setAttendanceCode={setAttendanceCode}
                    attendanceError={attendanceError}
                  />
                ))}
              </View>
            )}
          </View>

          {/* 이전 출석 목록 */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text className="text-xl font-bold text-white ml-2">
                이전 출석 목록
              </Text>
            </View>
            <Text className="text-white/70 mb-4">이전에 참여한 행사들의 출석 기록</Text>
            
            {isLoadingMyAttendances ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#EF4444" />
                <Text className="text-white mt-2">로딩 중...</Text>
              </View>
            ) : pastEventsList.length === 0 ? (
              <View className="bg-white/10 rounded-lg p-6 items-center border border-white/20">
                <Ionicons name="document-outline" size={48} color="#6B7280" />
                <Text className="text-lg font-medium text-white mt-4 mb-2">
                  출석 기록이 없습니다
                </Text>
                <Text className="text-gray-300 text-center">
                  아직 참여한 이벤트가 없거나 출석 체크를 하지 않았습니다.
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {pastEventsList.map((attendance) => (
                  <TouchableOpacity
                    key={attendance.id}
                    onPress={() => handleAttendanceCardClick(attendance)}
                    className="bg-white/10 rounded-lg p-4 border border-white/20"
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <View className={`px-3 py-1 rounded-full mr-3 ${getStatusColor(attendance.status)}`}>
                          <Text className="text-xs font-medium">
                            {getStatusText(attendance.status)}
                          </Text>
                        </View>
                        <Text className="text-white font-medium flex-1" numberOfLines={1}>
                          {attendance.eventTitle}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                    </View>
                    
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <Ionicons name="location" size={14} color="#9CA3AF" />
                        <Text className="text-gray-300 text-sm ml-2">
                          {attendance.eventLocation || '장소 미정'}
                        </Text>
                      </View>
                      
                      {attendance.checkedInAt && (
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={14} color="#9CA3AF" />
                          <Text className="text-gray-300 text-sm ml-2">
                            출석: {new Date(attendance.checkedInAt).toLocaleTimeString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit', 
                              hour12: false 
                            })}
                          </Text>
                        </View>
                      )}
                      
                      {attendance.reason && (
                        <View className="flex-row items-center">
                          <Ionicons name="chatbubble" size={14} color="#9CA3AF" />
                          <Text className="text-gray-300 text-sm ml-2">
                            사유: {attendance.reason}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 행사 상세 모달 */}
      <EventModal
        visible={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
          setSelectedAttendanceEvent(null);
        }}
        event={selectedEvent || selectedAttendanceEvent}
      />

      {/* 전체 행사 목록 모달 */}
      <EventListModal
        visible={showEventListModal}
        onClose={() => setShowEventListModal(false)}
        filter={filter}
      />
    </SafeAreaView>
  );
}

const getStatusColor = (status: AttendanceStatus) => {
  switch (status) {
    case 'present':
      return 'bg-green-500';
    case 'late':
      return 'bg-yellow-500';
    case 'absent':
      return 'bg-red-500';
    case 'excused':
      return 'bg-blue-500';
    case 'not_attended':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
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
