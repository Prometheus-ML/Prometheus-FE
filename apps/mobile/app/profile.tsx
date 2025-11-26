import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useMember } from '@prometheus-fe/hooks';
import { MyProfileUpdateRequest } from '@prometheus-fe/types';
import ProfileHeader from '../components/profiles/ProfileHeader';
import ProfilePost from '../components/profiles/ProfilePost';
import ProfileProject from '../components/profiles/ProfileProject';
import ProfileCoffeeChat from '../components/profiles/ProfileCoffeeChat';
//import * as ImagePicker from 'expo-image-picker';

type TabType = 'basic' | 'optional' | 'coffee_chat' | 'post' | 'project';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getMyProfile, updateMyProfile, myProfile, isLoadingProfile } = useMember();
  const { getThumbnailUrl, uploadImage } = useImage();

  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [myProfileDraft, setMyProfileDraft] = useState<MyProfileUpdateRequest>({
    github: '',
    notion: '',
    figma: '',
    kakao_id: '',
    instagram_id: '',
    mbti: '',
    gender: '',
    coffee_chat_enabled: false,
    self_introduction: '',
    additional_career: '',
    profile_image_url: ''
  });

  // 유틸리티 함수들
  const getFirstLetter = useCallback((name: string) => {
    return name && name.length ? String(name).trim().charAt(0) : 'U';
  }, []);

  const selfIntroCount = myProfileDraft.self_introduction?.length || 0;
  const additionalCareerCount = myProfileDraft.additional_career?.length || 0;

  // 내 프로필 로드
  const loadMyProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      if (data) {
        // draft 동기화
        setMyProfileDraft({
          github: data.github ?? '',
          notion: data.notion ?? '',
          figma: data.figma ?? '',
          kakao_id: data.kakao_id ?? '',
          instagram_id: data.instagram_id ?? '',
          mbti: data.mbti ?? '',
          gender: data.gender ?? '',
          coffee_chat_enabled: !!data.coffee_chat_enabled,
          self_introduction: data.self_introduction ?? '',
          additional_career: data.additional_career ?? '',
          profile_image_url: data.profile_image_url ?? ''
        });
        setImageError(false);
      }
    } catch (err) {
      console.error('Failed to load my profile:', err);
    }
  }, [getMyProfile]);

  // 이미지 선택 및 업로드
  // const handleImageSelect = useCallback(async () => {
  //   try {
  //     // 권한 요청
  //     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //     if (status !== 'granted') {
  //       Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
  //       return;
  //     }

  //     // 이미지 선택
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       allowsEditing: true,
  //       aspect: [1, 1],
  //       quality: 0.8,
  //     });

  //     if (!result.canceled && result.assets[0]) {
  //       const asset = result.assets[0];
        
  //       // 파일 객체 생성
  //       const file = {
  //         uri: asset.uri,
  //         type: 'image/jpeg',
  //         name: 'profile.jpg',
  //       } as any;

  //       setSubmitting(true);

  //       // 이미지 업로드
  //       const imageUrl = await uploadImage(file, 'member');
  //       if (imageUrl) {
  //         setMyProfileDraft(prev => ({
  //           ...prev,
  //           profile_image_url: imageUrl
  //         }));
  //         setImageError(false);
  //       }
  //     }
  //   } catch (err) {
  //     console.error('Image upload failed:', err);
  //     Alert.alert('오류', '이미지 업로드에 실패했습니다.');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }, [uploadImage]);

  // 프로필 저장
  const submitMyProfile = useCallback(async () => {
    try {
      setSubmitting(true);
      await updateMyProfile(myProfileDraft);
      setEditMode(false);
      Alert.alert('성공', '프로필이 저장되었습니다.');
    } catch (err) {
      console.error('Profile update failed:', err);
      Alert.alert('오류', '프로필 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [updateMyProfile, myProfileDraft]);

  // 프로필 편집 취소
  const cancelEdit = useCallback(() => {
    setEditMode(false);
    loadMyProfile();
  }, [loadMyProfile]);

  // 뒤로가기 핸들러
  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);

  // 초기 로드
  useEffect(() => {
    if (user) {
      loadMyProfile();
    }
  }, [user, loadMyProfile]);



  // 기본 정보 탭 렌더링
  const renderBasicInfo = () => (
    <View style={styles.contentContainer}>
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>이름</Text>
          <Text style={styles.infoValue}>{myProfile?.name || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>이메일</Text>
          <Text style={styles.infoValue}>{myProfile?.email || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>권한</Text>
          <Text style={styles.infoValue}>{myProfile?.grant || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>기수</Text>
          <Text style={styles.infoValue}>{myProfile?.gen || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>학교</Text>
          <Text style={styles.infoValue}>{myProfile?.school || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>전공</Text>
          <Text style={styles.infoValue}>{myProfile?.major || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>학번</Text>
          <Text style={styles.infoValue}>{myProfile?.student_id || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>생년월일</Text>
          <Text style={styles.infoValue}>{myProfile?.birthdate || '-'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>전화번호</Text>
          <Text style={styles.infoValue}>{myProfile?.phone || '-'}</Text>
        </View>
      </View>
      
      <View style={styles.infoItem}>
        <Text style={styles.infoLabel}>활동 시작일</Text>
        <Text style={styles.infoValue}>{myProfile?.activity_start_date || '-'}</Text>
      </View>
      
      {myProfile?.active_gens?.length > 0 && (
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>활동 기수</Text>
          <View style={styles.badgeContainer}>
            {myProfile.active_gens.map((gen: number, index: number) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{gen}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {myProfile?.history?.length > 0 && (
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>이력</Text>
          <View style={styles.badgeContainer}>
            {myProfile.history.map((item: string, index: number) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // 선택 정보 탭 렌더링
  const renderOptionalInfo = () => (
    <View style={styles.contentContainer}>
      {!editMode ? (
        <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
          <Text style={styles.editButtonText}>수정</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.saveButton, submitting && styles.disabledButton]}
            onPress={submitMyProfile}
            disabled={submitting}
          >
            <Text style={styles.saveButtonText}>
              {submitting ? '저장 중...' : '저장'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, submitting && styles.disabledButton]}
            onPress={cancelEdit}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputGrid}>
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>GitHub</Text>
          <TextInput
            value={myProfileDraft.github || ''}
            onChangeText={(text) => setMyProfileDraft(prev => ({ ...prev, github: text }))}
            editable={editMode}
            placeholder="GitHub URL"
            placeholderTextColor="#888"
            style={[styles.textInput, !editMode && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Notion</Text>
          <TextInput
            value={myProfileDraft.notion || ''}
            onChangeText={(text) => setMyProfileDraft(prev => ({ ...prev, notion: text }))}
            editable={editMode}
            placeholder="Notion URL"
            placeholderTextColor="#888"
            style={[styles.textInput, !editMode && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>Figma</Text>
          <TextInput
            value={myProfileDraft.figma || ''}
            onChangeText={(text) => setMyProfileDraft(prev => ({ ...prev, figma: text }))}
            editable={editMode}
            placeholder="Figma URL"
            placeholderTextColor="#888"
            style={[styles.textInput, !editMode && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>카카오 ID</Text>
          <TextInput
            value={myProfileDraft.kakao_id || ''}
            onChangeText={(text) => setMyProfileDraft(prev => ({ ...prev, kakao_id: text }))}
            editable={editMode}
            placeholder="카카오톡 ID"
            placeholderTextColor="#888"
            style={[styles.textInput, !editMode && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>인스타그램 ID</Text>
          <TextInput
            value={myProfileDraft.instagram_id || ''}
            onChangeText={(text) => setMyProfileDraft(prev => ({ ...prev, instagram_id: text }))}
            editable={editMode}
            placeholder="Instagram ID"
            placeholderTextColor="#888"
            style={[styles.textInput, !editMode && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>MBTI</Text>
          <TextInput
            value={myProfileDraft.mbti || ''}
            onChangeText={(text) => setMyProfileDraft(prev => ({ ...prev, mbti: text }))}
            editable={editMode}
            placeholder="MBTI (4자리)"
            placeholderTextColor="#888"
            maxLength={4}
            style={[styles.textInput, !editMode && styles.disabledInput]}
          />
        </View>
        
        <View style={styles.inputItem}>
          <Text style={styles.inputLabel}>커피챗 활성화</Text>
          <TouchableOpacity
            style={[styles.switchContainer, !editMode && styles.disabledInput]}
            onPress={() => editMode && setMyProfileDraft(prev => ({ 
              ...prev, 
              coffee_chat_enabled: !prev.coffee_chat_enabled 
            }))}
            disabled={!editMode}
          >
            <View style={[
              styles.switch,
              myProfileDraft.coffee_chat_enabled && styles.switchActive
            ]}>
              <View style={[
                styles.switchThumb,
                myProfileDraft.coffee_chat_enabled && styles.switchThumbActive
              ]} />
            </View>
            <Text style={styles.switchText}>
              {myProfileDraft.coffee_chat_enabled ? '활성화' : '비활성화'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.inputItem}>
        <Text style={styles.inputLabel}>자기소개</Text>
        <TextInput
          value={myProfileDraft.self_introduction || ''}
          onChangeText={(text) => setMyProfileDraft(prev => ({ ...prev, self_introduction: text }))}
          editable={editMode}
          placeholder="자기소개를 입력해주세요"
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          maxLength={300}
          style={[styles.textArea, !editMode && styles.disabledInput]}
        />
        <Text style={styles.characterCount}>{selfIntroCount}/300</Text>
      </View>
      
      <View style={styles.inputItem}>
        <Text style={styles.inputLabel}>추가 경력</Text>
        <TextInput
          value={myProfileDraft.additional_career || ''}
          onChangeText={(text) => setMyProfileDraft(prev => ({ ...prev, additional_career: text }))}
          editable={editMode}
          placeholder="추가 경력을 입력해주세요"
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          maxLength={300}
          style={[styles.textArea, !editMode && styles.disabledInput]}
        />
        <Text style={styles.characterCount}>{additionalCareerCount}/300</Text>
      </View>
    </View>
  );

  // 탭 데이터 정의
  const tabData = [
    { key: 'basic', component: renderBasicInfo },
    { key: 'optional', component: renderOptionalInfo },
    { key: 'coffee_chat', component: () => <ProfileCoffeeChat /> },
    { key: 'post', component: () => <ProfilePost /> },
    { key: 'project', component: () => <ProfileProject /> },
  ];

  if (isLoadingProfile || !myProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B0000" />
          <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 프로필 헤더 */}
      <ProfileHeader
        title="내 프로필"
        profileImageUrl={myProfile?.profile_image_url}
        name={myProfile?.name}
        gen={myProfile?.gen}
        email={myProfile?.email}
        imageError={imageError}
        editMode={editMode}
        activeTab={activeTab}
        submitting={submitting}
        onImageError={() => setImageError(true)}
        onImageSelect={() => {}}
        onTabChange={setActiveTab}
        onBackPress={handleBackPress}
        getThumbnailUrl={getThumbnailUrl}
        getFirstLetter={getFirstLetter}
      />

      {/* 콘텐츠 */}
      <FlatList
        data={tabData.filter(tab => tab.key === activeTab)}
        renderItem={({ item }) => (
          <View style={styles.content}>
            {item.component()}
          </View>
        )}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        style={styles.content}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoGrid: {
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  editButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  inputGrid: {
    gap: 16,
    marginBottom: 20,
  },
  inputItem: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  characterCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    justifyContent: 'center',
    paddingHorizontal: 2,
    marginRight: 12,
  },
  switchActive: {
    backgroundColor: '#8B0000',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
});
