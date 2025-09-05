import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'basic' | 'optional' | 'coffee_chat' | 'post' | 'project';

interface ProfileHeaderProps {
  title: string;
  profileImageUrl?: string;
  name?: string;
  gen?: number;
  email?: string;
  imageError: boolean;
  editMode: boolean;
  activeTab: TabType;
  submitting: boolean;
  onImageError: () => void;
  onImageSelect?: () => void;
  onTabChange: (tab: TabType) => void;
  onBackPress?: () => void;
  getThumbnailUrl: (url: string, size: number) => string;
  getFirstLetter: (name: string) => string;
}

export default function ProfileHeader({
  title,
  profileImageUrl,
  name,
  gen,
  email,
  imageError,
  editMode,
  activeTab,
  submitting,
  onImageError,
  onImageSelect,
  onTabChange,
  onBackPress,
  getThumbnailUrl,
  getFirstLetter,
}: ProfileHeaderProps) {
  // 탭 데이터
  const tabData = [
    { key: 'basic', label: '기본 정보' },
    { key: 'optional', label: '선택 정보' },
    { key: 'coffee_chat', label: '커피챗' },
    { key: 'post', label: '게시글' },
    { key: 'project', label: '프로젝트' }
  ];

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <FlatList
        data={tabData}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tab, activeTab === item.key && styles.activeTab]}
            onPress={() => onTabChange(item.key as TabType)}
          >
            <Text style={[styles.tabText, activeTab === item.key && styles.activeTabText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        {onBackPress && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title || ''}</Text>
      </View>

      {/* 프로필 헤더 */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {profileImageUrl && !imageError ? (
            <Image
              source={{ uri: getThumbnailUrl(profileImageUrl, 200) }}
              style={styles.profileImage}
              onError={onImageError}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>
                {getFirstLetter(name || '') || 'U'}
              </Text>
            </View>
          )}
          {activeTab === 'optional' && editMode && (
            <TouchableOpacity
              style={styles.imageEditButton}
              onPress={onImageSelect}
              disabled={submitting}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name || ''}</Text>
          {typeof gen === 'number' && gen > 0 && (
            <View style={[
              styles.genBadge,
              { backgroundColor: gen <= 4 ? 'rgba(156, 163, 175, 0.2)' : '#8B0000' }
            ]}>
              <Text style={[
                styles.genText,
                { color: gen <= 4 ? '#d1d5db' : '#ffa282' }
              ]}>
                {gen <= 4 ? '이전기수' : `${gen}기`}
              </Text>
            </View>
          )}
          <Text style={styles.profileEmail}>{email || ''}</Text>
        </View>
      </View>

      {/* 탭 */}
      {renderTabs()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: '#e0e0e0',
    fontSize: 24,
    fontWeight: '500',
  },
  imageEditButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#8B0000',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  genBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  genText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabScrollContent: {
    paddingHorizontal: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  activeTab: {
    borderBottomColor: '#8B0000',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8B0000',
    fontWeight: '600',
  },
});
