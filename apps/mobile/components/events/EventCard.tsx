import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, AttendanceStatus, MyAttendance } from '@prometheus-fe/types';

interface EventCardProps {
  event: Event;
  myAttendance?: MyAttendance;
  onEventClick: (event: Event) => void;
  onCheckIn: (event: Event) => void;
  isCheckingIn: boolean;
  attendanceCode: string;
  setAttendanceCode: (code: string) => void;
  attendanceError: string | null;
}

// 기수별 색상 반환
const getGenColor = (gen: number) => {
  return gen <= 4 ? 'bg-gray-500/20' : 'bg-red-900';
};

const getGenTextColor = (gen: number) => {
  return gen <= 4 ? 'text-gray-300' : 'text-red-200';
};

// 행사 상태 반환
const getEventStatus = (event: Event) => {
  const isUpcoming = event.startTime > new Date();
  const isOngoing = event.startTime <= new Date() && event.endTime >= new Date();
  const isPast = event.endTime < new Date();

  if (isOngoing) return { text: '진행중', color: '#10B981' };
  if (isUpcoming) return { text: '예정', color: '#F59E0B' };
  return { text: '종료', color: '#6B7280' };
};

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

export default function EventCard({
  event,
  myAttendance,
  onEventClick,
  onCheckIn,
  isCheckingIn,
  attendanceCode,
  setAttendanceCode,
  attendanceError,
}: EventCardProps) {
  const eventStatus = getEventStatus(event);

  return (
    <TouchableOpacity
      onPress={() => onEventClick(event)}
      className="bg-white/10 rounded-lg p-4 border border-white/20"
    >
      {/* 이벤트 기본 정보 */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: eventStatus.color }} />
            <Text className="text-lg font-semibold text-white flex-1" numberOfLines={2}>
              {event.title}
            </Text>
            <View className={`px-2 py-1 rounded-full ml-2 ${getGenColor(event.currentGen)}`}>
              <Text className={`text-xs font-semibold ${getGenTextColor(event.currentGen)}`}>
                {event.currentGen <= 4 ? '이전기수' : `${event.currentGen}기`}
              </Text>
            </View>
          </View>
        </View>

        {/* 이벤트 타입과 아이콘 */}
        <View className="flex-row items-center space-x-2 mb-3">
          <View className="bg-gray-500/20 px-2 py-1 rounded">
            <Text className="text-gray-300 text-xs">{event.eventType}</Text>
          </View>
          {event.isAttendanceRequired && (
            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
          )}
          {event.isAttendanceCodeRequired && (
            <Ionicons name="key" size={12} color="#9CA3AF" />
          )}
        </View>

        {/* 장소와 날짜 */}
        <View className="space-y-2">
          {event.location && (
            <View className="flex-row items-center">
              <Ionicons name="location" size={14} color="#9CA3AF" />
              <Text className="text-white/60 text-sm ml-2">{event.location}</Text>
            </View>
          )}
          <View className="flex-row items-center">
            <Ionicons name="calendar" size={14} color="#9CA3AF" />
            <Text className="text-white/60 text-sm ml-2">
              {event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </Text>
          </View>
        </View>
      </View>

      {/* 출석 체크 섹션 */}
      <View className="bg-white/10 rounded-lg p-4 border border-white/20">
        {(() => {
          if (myAttendance && myAttendance.status !== 'not_attended') {
            // 이미 출석 처리된 경우
            return (
              <View className="items-center">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text className="text-green-300 font-medium ml-2">출석 처리 완료</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(myAttendance.status)}`}>
                  <Text className="text-white text-sm font-medium">
                    {getStatusText(myAttendance.status)}
                  </Text>
                </View>
              </View>
            );
          }

          // 출석 체크가 필요한 경우
          return (
            <View>
              {event.isAttendanceCodeRequired && !event.hasAttendanceCode ? (
                // 출석 코드가 필수인데 생성되지 않은 경우
                <View className="items-center py-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="warning" size={16} color="#F59E0B" />
                    <Text className="text-yellow-300 font-medium ml-2">출석 코드 생성 대기중</Text>
                  </View>
                  <Text className="text-gray-300 text-sm text-center">
                    관리자가 출석 코드를 생성한 후 출석 체크가 가능합니다.
                  </Text>
                </View>
              ) : (
                <View>
                  {event.isAttendanceCodeRequired && event.hasAttendanceCode && (
                    <View className="mb-3">
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="key" size={14} color="white" />
                        <Text className="text-white font-medium ml-1">출석 코드</Text>
                      </View>
                      <TextInput
                        value={attendanceCode}
                        onChangeText={setAttendanceCode}
                        placeholder="출석 코드를 입력하세요"
                        placeholderTextColor="#9CA3AF"
                        className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2"
                      />
                    </View>
                  )}

                  {attendanceError && (
                    <View className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-3">
                      <View className="flex-row items-center">
                        <Ionicons name="warning" size={14} color="#FCA5A5" />
                        <Text className="text-red-300 text-sm ml-2">{attendanceError}</Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => onCheckIn(event)}
                    disabled={
                      isCheckingIn ||
                      (event.isAttendanceCodeRequired && event.hasAttendanceCode && !attendanceCode.trim()) ||
                      (event.isAttendanceCodeRequired && !event.hasAttendanceCode)
                    }
                    className={`rounded-lg px-4 py-3 flex-row items-center justify-center ${
                      isCheckingIn ||
                      (event.isAttendanceCodeRequired && event.hasAttendanceCode && !attendanceCode.trim()) ||
                      (event.isAttendanceCodeRequired && !event.hasAttendanceCode)
                        ? 'bg-red-600/50'
                        : 'bg-red-600'
                    }`}
                  >
                    {isCheckingIn ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="text-white font-medium ml-2">출석 체크 중...</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text className="text-white font-medium ml-2">출석하기</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })()}
      </View>
    </TouchableOpacity>
  );
}
