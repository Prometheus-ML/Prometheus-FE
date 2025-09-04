import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useImage } from '@prometheus-fe/hooks';
import type { ImageCategory } from '@prometheus-fe/types';

interface GroupFormData {
  name: string;
  description?: string;
  category: 'STUDY' | 'CASUAL';
  max_members?: number;
  deadline?: string;
  thumbnail_url?: string;
}

interface GroupFormProps {
  visible: boolean;
  onSubmit: (data: GroupFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function GroupForm({ visible, onSubmit, onCancel, isSubmitting = false }: GroupFormProps) {
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    category: 'STUDY',
    max_members: undefined,
    deadline: '',
    thumbnail_url: undefined
  });

  const {
    uploadImage,
    validateImageFile,
    getThumbnailUrl,
    isUploading: isImageUploading,
    uploadError: imageUploadError,
    clearError: clearImageError
  } = useImage({
    onUploadSuccess: (response) => {
      setFormData(prev => ({ ...prev, thumbnail_url: response.id }));
    },
    onUploadError: (error) => {
      console.error('이미지 업로드 실패:', error);
    }
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('오류', '그룹명을 입력해주세요.');
      return;
    }

    if (!formData.description?.trim()) {
      Alert.alert('오류', '설명을 입력해주세요.');
      return;
    }

    // 데이터 정리: 빈 문자열을 undefined로 변환
    const cleanedData = {
      ...formData,
      description: formData.description?.trim() || undefined,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
      max_members: formData.max_members || undefined,
      thumbnail_url: formData.thumbnail_url || undefined
    };

    console.log('Original form data:', formData);
    console.log('Cleaned data for API:', cleanedData);
    
    onSubmit(cleanedData);
  };

  const handleChange = (field: keyof GroupFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'max_members' && value === 0 ? undefined : value
    }));
  };

  const handleImagePicker = async () => {
    try {
      // 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '사진 라이브러리에 접근하려면 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // File 객체 생성 (React Native에서는 다른 방식으로 처리)
        const file = {
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'image.jpg',
          size: asset.fileSize || 0,
        } as any;

        // 이미지 파일 검증
        const validationError = validateImageFile(file);
        if (validationError) {
          Alert.alert('오류', validationError);
          return;
        }

        // 이전 에러 클리어
        clearImageError();
        
        try {
          // useImage 훅을 사용하여 이미지 업로드
          const imageUrl = await uploadImage(file, 'group' as ImageCategory);
          if (imageUrl) {
            setFormData(prev => ({ ...prev, thumbnail_url: imageUrl }));
          }
        } catch (error) {
          console.error('썸네일 업로드 처리 중 오류:', error);
        }
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail_url: undefined }));
    clearImageError();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'STUDY',
      max_members: undefined,
      deadline: '',
      thumbnail_url: undefined
    });
    clearImageError();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>새 그룹 생성</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || isImageUploading || !formData.name.trim() || !formData.description?.trim()}
            style={[
              styles.submitButton,
              (isSubmitting || isImageUploading || !formData.name.trim() || !formData.description?.trim()) && styles.submitButtonDisabled
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isImageUploading ? '업로드 중...' : '생성'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 썸네일 업로드 */}
          <View style={styles.section}>
            <Text style={styles.label}>그룹 썸네일</Text>
            <TouchableOpacity
              onPress={handleImagePicker}
              disabled={isImageUploading}
              style={styles.imageUploadButton}
            >
              {formData.thumbnail_url ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: getThumbnailUrl(formData.thumbnail_url, 200) }}
                    style={styles.uploadedImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={removeThumbnail}
                    style={styles.removeImageButton}
                  >
                    <FontAwesome name="times" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageUploadPlaceholder}>
                  {isImageUploading ? (
                    <ActivityIndicator size="large" color="#c2402a" />
                  ) : (
                    <>
                      <FontAwesome name="camera" size={32} color="rgba(255,255,255,0.5)" />
                      <Text style={styles.imageUploadText}>썸네일 추가</Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
            
            {/* 업로드 에러 표시 */}
            {imageUploadError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{imageUploadError}</Text>
              </View>
            )}
          </View>

          {/* 그룹명 */}
          <View style={styles.section}>
            <Text style={styles.label}>그룹명 *</Text>
            <TextInput
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              style={styles.textInput}
              placeholder="그룹명을 입력하세요"
              placeholderTextColor="rgba(255,255,255,0.5)"
              maxLength={100}
            />
          </View>

          {/* 설명 */}
          <View style={styles.section}>
            <Text style={styles.label}>설명 *</Text>
            <TextInput
              value={formData.description}
              onChangeText={(value) => handleChange('description', value)}
              style={[styles.textInput, styles.textArea]}
              placeholder="그룹에 대한 설명을 입력하세요"
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline={true}
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
          </View>

          {/* 카테고리 */}
          <View style={styles.section}>
            <Text style={styles.label}>카테고리 *</Text>
            <View style={styles.categoryContainer}>
              <TouchableOpacity
                onPress={() => handleChange('category', 'STUDY')}
                style={[
                  styles.categoryButton,
                  formData.category === 'STUDY' && styles.categoryButtonActive
                ]}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === 'STUDY' && styles.categoryButtonTextActive
                ]}>
                  스터디 그룹
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleChange('category', 'CASUAL')}
                style={[
                  styles.categoryButton,
                  formData.category === 'CASUAL' && styles.categoryButtonActive
                ]}
              >
                <Text style={[
                  styles.categoryButtonText,
                  formData.category === 'CASUAL' && styles.categoryButtonTextActive
                ]}>
                  취미 그룹
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 최대 인원수 */}
          <View style={styles.section}>
            <Text style={styles.label}>최대 인원수</Text>
            <TextInput
              value={formData.max_members?.toString() || ''}
              onChangeText={(value) => handleChange('max_members', value ? parseInt(value) : undefined)}
              style={styles.textInput}
              placeholder="최대 인원수를 입력하세요 (선택사항)"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="numeric"
            />
          </View>

          {/* 마감일 */}
          <View style={styles.section}>
            <Text style={styles.label}>마감일</Text>
            <TextInput
              value={formData.deadline || ''}
              onChangeText={(value) => handleChange('deadline', value)}
              style={styles.textInput}
              placeholder="YYYY-MM-DD 형식으로 입력"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <Text style={styles.helperText}>
              예: 2024-12-31 (선택사항)
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    color: '#c2402a',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#c2402a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(194, 64, 42, 0.2)',
    borderColor: '#c2402a',
  },
  categoryButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: 120,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageUploadText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
  },
});
