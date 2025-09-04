import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Event, EventFilter } from '@prometheus-fe/types';
import { useEvent } from '@prometheus-fe/hooks';

interface EventListModalProps {
  visible: boolean;
  onClose: () => void;
  filter?: EventFilter;
}

const { width: screenWidth } = Dimensions.get('window');

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

// EventCard 컴포넌트 (리스트용)
interface EventListItemProps {
  event: Event;
  onPress?: (event: Event) => void;
}

const EventListItem = ({ event, onPress }: EventListItemProps) => {
  const eventStatus = getEventStatus(event);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(event)}
      className="bg-white/10 rounded-lg p-4 border border-white/20 mb-4"
    >
      {/* 제목과 기수 */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-row items-center flex-1 mr-2">
          <View 
            className="w-2 h-2 rounded-full mr-2" 
            style={{ backgroundColor: eventStatus.color }} 
          />
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

      {/* 행사 타입과 아이콘 */}
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

      {/* 설명 (두 줄 고정) */}
      <View className="h-10 mb-3">
        {event.description ? (
          <Text className="text-gray-300 text-sm" numberOfLines={2}>
            {event.description}
          </Text>
        ) : null}
      </View>

      {/* 장소와 날짜 */}
      <View className="space-y-2">
        {event.location && (
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color="#9CA3AF" />
            <Text className="text-white/60 text-sm ml-2" numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}
        <View className="flex-row items-center">
          <Ionicons name="calendar" size={14} color="#9CA3AF" />
          <Text className="text-white/60 text-sm ml-2">
            {event.startTime.toLocaleDateString()} {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {event.endTime.toLocaleDateString()} {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function EventListModal({ visible, onClose, filter }: EventListModalProps) {
  const { 
    events, 
    pagination, 
    isLoadingEvents, 
    eventListError,
    fetchEvents
  } = useEvent();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  useEffect(() => {
    if (visible) {
      setCurrentPage(1);
      fetchEvents(1, pageSize, filter);
    }
  }, [visible, pageSize, filter, fetchEvents]);

  const handleLoadMore = () => {
    if (!isLoadingEvents && pagination) {
      const totalPages = Math.ceil(pagination.total / pageSize);
      if (currentPage < totalPages) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchEvents(nextPage, pageSize, filter);
      }
    }
  };

  const renderFooter = () => {
    if (!isLoadingEvents) return null;
    
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#EF4444" />
        <Text className="text-gray-300 mt-2 text-sm">더 많은 이벤트를 불러오는 중...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoadingEvents) return null;
    
    return (
      <View className="items-center py-12">
        <Ionicons name="calendar-outline" size={64} color="#6B7280" />
        <Text className="text-lg font-medium text-white mt-4 mb-2">
          행사가 없습니다
        </Text>
        <Text className="text-gray-300 text-center">
          현재 등록된 행사가 없습니다.
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black">
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
              <View>
                <Text className="text-xl font-bold text-white">전체 행사 목록</Text>
                <Text className="text-sm text-gray-300">모든 행사 목록을 확인하세요</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 에러 메시지 */}
        {eventListError && (
          <View className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <View className="flex-row items-center">
              <Ionicons name="warning" size={16} color="#FCA5A5" />
              <Text className="text-red-300 ml-2 flex-1">{eventListError}</Text>
            </View>
          </View>
        )}

        {/* 이벤트 목록 */}
        <View className="flex-1 px-4">
          {isLoadingEvents && events.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#EF4444" />
              <Text className="text-white mt-4">이벤트를 불러오는 중...</Text>
            </View>
          ) : (
            <FlatList
              data={events}
              renderItem={({ item }) => <EventListItem event={item} />}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 16 }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
            />
          )}
        </View>

        {/* 페이지네이션 정보 */}
        {pagination && events.length > 0 && (
          <View className="px-4 py-3 border-t border-white/20">
            <Text className="text-center text-gray-300 text-sm">
              총 {pagination.total}개 이벤트 중 {events.length}개 표시
              {pagination.total > events.length && ' (더 많은 이벤트를 보려면 아래로 스크롤)'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
