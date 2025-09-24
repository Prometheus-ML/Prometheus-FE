import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '@prometheus-fe/types';

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  event: Event | null;
}

const { height: screenHeight } = Dimensions.get('window');

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

export default function EventModal({ visible, onClose, event }: EventModalProps) {
  if (!event) return null;

  const eventStatus = getEventStatus(event);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black" edges={['top']}>
        {/* 헤더 */}
        <View className="px-4 py-4 border-b border-white/20">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 items-center justify-center mr-3"
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white">이벤트 상세</Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {/* 이벤트 제목과 상태 */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <View 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: eventStatus.color }} 
              />
              <Text className="text-sm font-medium" style={{ color: eventStatus.color }}>
                {eventStatus.text}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white mb-2">
              {event.title}
            </Text>
            {event.description && (
              <Text className="text-gray-300 text-base leading-6">
                {event.description}
              </Text>
            )}
          </View>

          {/* 이벤트 기본 정보 */}
          <View className="bg-white/10 rounded-lg p-4 border border-white/20 mb-6">
            <Text className="text-lg font-semibold text-white mb-4">기본 정보</Text>
            
            <View className="space-y-4">
              {/* 이벤트 타입과 기수 */}
              <View className="flex-row justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-gray-400 text-sm mb-1">이벤트 타입</Text>
                  <View className="bg-gray-500/20 px-3 py-2 rounded-lg">
                    <Text className="text-white">{event.eventType}</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm mb-1">기수</Text>
                  <View className={`px-3 py-2 rounded-lg ${getGenColor(event.currentGen)}`}>
                    <Text className={`${getGenTextColor(event.currentGen)} text-center`}>
                      {event.currentGen <= 4 ? '이전기수' : `${event.currentGen}기`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 장소 */}
              {event.location && (
                <View>
                  <Text className="text-gray-400 text-sm mb-1">장소</Text>
                  <View className="flex-row items-center bg-gray-500/20 px-3 py-2 rounded-lg">
                    <Ionicons name="location" size={16} color="#9CA3AF" />
                    <Text className="text-white ml-2">{event.location}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* 날짜 및 시간 정보 */}
          <View className="bg-white/10 rounded-lg p-4 border border-white/20 mb-6">
            <View className="flex-row items-center mb-4">
              <Ionicons name="calendar" size={20} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-white ml-2">날짜 및 시간</Text>
            </View>
            
            <View className="space-y-4">
              <View className="flex-row justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-gray-400 text-sm mb-1">시작 시간</Text>
                  <Text className="text-white">
                    {event.startTime.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text className="text-gray-300 text-sm">
                    {event.startTime.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm mb-1">종료 시간</Text>
                  <Text className="text-white">
                    {event.endTime.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text className="text-gray-300 text-sm">
                    {event.endTime.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 출석 관련 정보 */}
          {event.isAttendanceRequired && (
            <View className="bg-white/10 rounded-lg p-4 border border-white/20 mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-lg font-semibold text-white ml-2">출석 관리</Text>
              </View>
              
              <View className="space-y-4">
                {/* 출석 시간 */}
                <View className="flex-row justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-gray-400 text-sm mb-1">출석 시작</Text>
                    <Text className="text-white">
                      {event.attendanceStartTime?.toLocaleString('ko-KR') || '미설정'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-1">출석 종료</Text>
                    <Text className="text-white">
                      {event.attendanceEndTime?.toLocaleString('ko-KR') || '미설정'}
                    </Text>
                  </View>
                </View>

                {/* 지각 기준과 출석 코드 */}
                <View className="flex-row justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-gray-400 text-sm mb-1">지각 기준</Text>
                    <Text className="text-white">{event.lateThresholdMinutes || 15}분</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm mb-1">출석 코드</Text>
                    <View className="flex-row items-center">
                      <Text className="text-white mr-2">
                        {event.isAttendanceCodeRequired ? '필수' : '선택'}
                      </Text>
                      {event.isAttendanceCodeRequired && (
                        <Ionicons name="key" size={14} color="#9CA3AF" />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* 추가 정보 */}
          <View className="bg-white/10 rounded-lg p-4 border border-white/20">
            <Text className="text-lg font-semibold text-white mb-4">추가 정보</Text>
            
            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons 
                  name={event.isAttendanceRequired ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color={event.isAttendanceRequired ? "#10B981" : "#6B7280"} 
                />
                <Text className="text-white ml-2">
                  출석 {event.isAttendanceRequired ? '필수' : '선택'}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons 
                  name={event.isAttendanceCodeRequired ? "key" : "key-outline"} 
                  size={16} 
                  color={event.isAttendanceCodeRequired ? "#10B981" : "#6B7280"} 
                />
                <Text className="text-white ml-2">
                  출석 코드 {event.isAttendanceCodeRequired ? '필수' : '선택'}
                </Text>
              </View>

              {event.isAttendanceCodeRequired && (
                <View className="flex-row items-center">
                  <Ionicons 
                    name={event.hasAttendanceCode ? "checkmark-circle" : "time"} 
                    size={16} 
                    color={event.hasAttendanceCode ? "#10B981" : "#F59E0B"} 
                  />
                  <Text className="text-white ml-2">
                    출석 코드 {event.hasAttendanceCode ? '생성됨' : '생성 대기중'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
