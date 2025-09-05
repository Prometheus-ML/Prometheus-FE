'use client';

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useImage } from '@prometheus-fe/hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faImage, faUpload } from '@fortawesome/free-solid-svg-icons';
import * as ImagePicker from 'expo-image-picker';

interface ProjectFormProps {
  initial?: any;
  mode: 'create' | 'edit';
  showStatus?: boolean;
  onSubmit: (data: any) => void;
}

export default function ProjectForm({ initial, mode, showStatus = true, onSubmit }: ProjectFormProps) {
  const { uploadImage, validateImageFile } = useImage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: [] as string[],
    github_url: '',
    demo_url: '',
    panel_url: '',
    thumbnail_url: '',
    status: 'active' as 'active' | 'completed' | 'paused',
    gen: 1,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 초기값 설정
  useEffect(() => {
    if (initial) {
      setFormData({
        title: initial.title || '',
        description: initial.description || '',
        keywords: initial.keywords || [],
        github_url: initial.github_url || '',
        demo_url: initial.demo_url || '',
        panel_url: initial.panel_url || '',
        thumbnail_url: initial.thumbnail_url || '',
        status: initial.status || 'active',
        gen: initial.gen || 1,
      });
    }
  }, [initial]);

  // 폼 데이터 업데이트
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 키워드 추가
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  // 키워드 제거
  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  // 이미지 선택 및 업로드
  const pickImage = async (type: 'thumbnail' | 'panel') => {
    try {
      // 권한 요청
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'thumbnail' ? [4, 3] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // 파일 검증
        const validationError = validateImageFile(file as any);
        if (validationError) {
          Alert.alert('파일 오류', validationError);
          return;
        }

        // 업로드
        setIsUploading(true);
        setUploadError(null);

        try {
          const imageUrl = await uploadImage(file as any, 'project');
          if (imageUrl) {
            updateFormData(type === 'thumbnail' ? 'thumbnail_url' : 'panel_url', imageUrl);
            Alert.alert('성공', '이미지가 업로드되었습니다.');
          } else {
            throw new Error('이미지 업로드 실패');
          }
        } catch (error: any) {
          console.error('이미지 업로드 실패:', error);
          setUploadError(error.message || '이미지 업로드에 실패했습니다.');
          Alert.alert('업로드 실패', error.message || '이미지 업로드에 실패했습니다.');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error: any) {
      console.error('이미지 선택 실패:', error);
      Alert.alert('오류', '이미지 선택에 실패했습니다.');
    }
  };

  // 폼 제출
  const handleSubmit = () => {
    // 유효성 검사
    if (!formData.title.trim()) {
      Alert.alert('입력 오류', '프로젝트 제목을 입력해주세요.');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('입력 오류', '프로젝트 설명을 입력해주세요.');
      return;
    }

    if (formData.keywords.length === 0) {
      Alert.alert('입력 오류', '최소 하나의 키워드를 입력해주세요.');
      return;
    }

    // URL 유효성 검사
    const urlFields = [
      { field: 'github_url', name: 'GitHub URL' },
      { field: 'demo_url', name: 'Demo URL' },
      { field: 'panel_url', name: 'Panel URL' },
    ];

    for (const { field, name } of urlFields) {
      const url = formData[field as keyof typeof formData] as string;
      if (url && url.trim()) {
        try {
          new URL(url);
        } catch {
          Alert.alert('입력 오류', `${name}이 올바르지 않습니다.`);
          return;
        }
      }
    }

    onSubmit(formData);
  };

  return (
    <ScrollView className="flex-1">
      <View className="space-y-6">
        {/* 프로젝트 제목 */}
        <View>
          <Text className="text-white text-lg font-semibold mb-2">프로젝트 제목 *</Text>
          <TextInput
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            placeholder="프로젝트 제목을 입력하세요"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={formData.title}
            onChangeText={(text) => updateFormData('title', text)}
          />
        </View>

        {/* 프로젝트 설명 */}
        <View>
          <Text className="text-white text-lg font-semibold mb-2">프로젝트 설명 *</Text>
          <TextInput
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            placeholder="프로젝트 설명을 입력하세요"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 키워드 */}
        <View>
          <Text className="text-white text-lg font-semibold mb-2">키워드 *</Text>
          <View className="flex-row space-x-2 mb-2">
            <TextInput
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
              placeholder="키워드를 입력하세요"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={keywordInput}
              onChangeText={setKeywordInput}
              onSubmitEditing={addKeyword}
            />
            <TouchableOpacity
              onPress={addKeyword}
              className="bg-red-600 rounded-lg px-4 py-3"
            >
              <FontAwesomeIcon icon={faPlus} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {formData.keywords.map((keyword, index) => (
              <View
                key={index}
                className="bg-white/20 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center"
              >
                <Text className="text-white text-sm mr-2">#{keyword}</Text>
                <TouchableOpacity onPress={() => removeKeyword(index)}>
                  <FontAwesomeIcon icon={faTrash} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* 기수 */}
        <View>
          <Text className="text-white text-lg font-semibold mb-2">기수</Text>
          <TextInput
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            placeholder="기수를 입력하세요"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={formData.gen.toString()}
            onChangeText={(text) => updateFormData('gen', parseInt(text) || 1)}
            keyboardType="numeric"
          />
        </View>

        {/* 상태 (생성 모드에서만 표시) */}
        {showStatus && (
          <View>
            <Text className="text-white text-lg font-semibold mb-2">상태</Text>
            <View className="flex-row space-x-2">
              {[
                { value: 'active', label: '진행중' },
                { value: 'completed', label: '완료' },
                { value: 'paused', label: '중지' },
              ].map((status) => (
                <TouchableOpacity
                  key={status.value}
                  className={`flex-1 py-3 rounded-lg border ${
                    formData.status === status.value
                      ? 'bg-red-600 border-red-600'
                      : 'bg-white/10 border-white/20'
                  }`}
                  onPress={() => updateFormData('status', status.value)}
                >
                  <Text className={`text-center font-semibold ${
                    formData.status === status.value ? 'text-white' : 'text-gray-300'
                  }`}>
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 썸네일 이미지 */}
        <View>
          <Text className="text-white text-lg font-semibold mb-2">썸네일 이미지</Text>
          <TouchableOpacity
            onPress={() => pickImage('thumbnail')}
            disabled={isUploading}
            className="bg-white/10 border border-white/20 rounded-lg p-4 items-center"
          >
            {formData.thumbnail_url ? (
              <View className="w-full">
                <Image
                  source={{ uri: formData.thumbnail_url }}
                  className="w-full h-32 rounded-lg mb-2"
                  resizeMode="cover"
                />
                <Text className="text-white text-sm text-center">이미지 변경</Text>
              </View>
            ) : (
              <View className="items-center">
                <FontAwesomeIcon icon={faImage} color="rgba(255,255,255,0.5)" />
                <Text className="text-white text-sm mt-2">이미지 선택</Text>
              </View>
            )}
            {isUploading && (
              <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-lg">
                <View className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 패널 이미지 */}
        <View>
          <Text className="text-white text-lg font-semibold mb-2">패널 이미지</Text>
          <TouchableOpacity
            onPress={() => pickImage('panel')}
            disabled={isUploading}
            className="bg-white/10 border border-white/20 rounded-lg p-4 items-center"
          >
            {formData.panel_url ? (
              <View className="w-full">
                <Image
                  source={{ uri: formData.panel_url }}
                  className="w-full h-32 rounded-lg mb-2"
                  resizeMode="cover"
                />
                <Text className="text-white text-sm text-center">이미지 변경</Text>
              </View>
            ) : (
              <View className="items-center">
                <FontAwesomeIcon icon={faImage} color="rgba(255,255,255,0.5)" />
                <Text className="text-white text-sm mt-2">이미지 선택</Text>
              </View>
            )}
            {isUploading && (
              <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-lg">
                <View className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* GitHub URL */}
        <View>
          <Text className="text-white text-lg font-semibold mb-2">GitHub URL</Text>
          <TextInput
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            placeholder="https://github.com/username/repository"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={formData.github_url}
            onChangeText={(text) => updateFormData('github_url', text)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* Demo URL */}
        <View>
          <Text className="text-white text-lg font-semibold mb-2">Demo URL</Text>
          <TextInput
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
            placeholder="https://demo.example.com"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={formData.demo_url}
            onChangeText={(text) => updateFormData('demo_url', text)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {/* 업로드 에러 표시 */}
        {uploadError && (
          <View className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <Text className="text-red-400 text-center">{uploadError}</Text>
          </View>
        )}

        {/* 제출 버튼 */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isUploading}
          className={`py-4 rounded-lg ${
            isUploading ? 'bg-gray-600' : 'bg-red-600'
          }`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            {isUploading ? '업로드 중...' : (mode === 'create' ? '프로젝트 생성' : '프로젝트 수정')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
