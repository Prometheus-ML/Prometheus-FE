import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MemberDetailResponse } from '@prometheus-fe/types';
import { useImage } from '@prometheus-fe/hooks';
import { Ionicons } from '@expo/vector-icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberDetailResponse | null;
}

export default function ProfileModal({ isOpen, onClose, member }: ProfileModalProps) {
  const { getThumbnailUrl } = useImage();

  if (!member) return null;

  const getFirstLetter = (name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  };

  const handleLinkPress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('링크 열기 실패:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR');
    } catch {
      return dateString;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return 'logo-github';
      case 'notion':
        return 'document-text';
      case 'figma':
        return 'color-palette';
      case 'kakao_id':
        return 'chatbubble';
      case 'instagram_id':
        return 'logo-instagram';
      default:
        return 'link';
    }
  };

  const getSocialUrl = (platform: string, value: string) => {
    switch (platform) {
      case 'github':
        return value.startsWith('http') ? value : `https://github.com/${value}`;
      case 'instagram_id':
        return value.startsWith('http') ? value : `https://instagram.com/${value}`;
      default:
        return value.startsWith('http') ? value : `https://${value}`;
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* 헤더 */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>
            프로필
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
          {/* 프로필 이미지 및 기본 정보 */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            {/* 프로필 이미지 */}
            <View style={{ marginBottom: 16 }}>
              {member.profile_image_url ? (
                <Image
                  source={{ uri: getThumbnailUrl(member.profile_image_url, 200) }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: '#404040',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#e0e0e0', fontSize: 36, fontWeight: '500' }}>
                    {getFirstLetter(member.name)}
                  </Text>
                </View>
              )}
            </View>

            {/* 이름 */}
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
              {member.name}
            </Text>

            {/* 기수와 상태 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              {member.gen !== undefined && (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: member.status === 'active' ? '#8B0000' : 'rgba(156, 163, 175, 0.2)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {member.status === 'active' && (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#ffa282',
                      }}
                    />
                  )}
                  <Text
                    style={{
                      color: member.status === 'active' ? '#ffa282' : '#d1d5db',
                      fontSize: 14,
                      fontWeight: '600',
                    }}
                  >
                    {member.gen === 0 ? '창립멤버' : `${member.gen}기`}
                  </Text>
                </View>
              )}

              {member.coffee_chat_enabled && (
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: '#00654D',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Ionicons name="cafe" size={14} color="white" />
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                    커피챗 가능
                  </Text>
                </View>
              )}
            </View>

            {/* 이메일 */}
            <Text style={{ color: '#e0e0e0', fontSize: 16, marginBottom: 8 }}>
              {member.email}
            </Text>
          </View>

          {/* 기본 정보 섹션 */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
              기본 정보
            </Text>

            {member.school && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>학교</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{member.school}</Text>
              </View>
            )}

            {member.major && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>전공</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{member.major}</Text>
              </View>
            )}

            {member.student_id && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>학번</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{member.student_id}</Text>
              </View>
            )}

            {member.birthdate && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>생년월일</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{formatDate(member.birthdate)}</Text>
              </View>
            )}

            {member.phone && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>연락처</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{member.phone}</Text>
              </View>
            )}

            {member.gender && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>성별</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
                  {member.gender === 'male' ? '남성' : member.gender === 'female' ? '여성' : member.gender}
                </Text>
              </View>
            )}

            {member.mbti && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>MBTI</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{member.mbti}</Text>
              </View>
            )}

            {member.activity_start_date && (
              <View>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>활동 시작일</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{formatDate(member.activity_start_date)}</Text>
              </View>
            )}
          </View>

          {/* 소셜 링크 섹션 */}
          {(member.github || member.notion || member.figma || member.kakao_id || member.instagram_id) && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                소셜 링크
              </Text>

              <View style={{ gap: 12 }}>
                {member.github && (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(getSocialUrl('github', member.github!))}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                    }}
                  >
                    <Ionicons name={getSocialIcon('github')} size={20} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}>GitHub</Text>
                    <Ionicons name="chevron-forward" size={16} color="#888" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                )}

                {member.notion && (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(getSocialUrl('notion', member.notion!))}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                    }}
                  >
                    <Ionicons name={getSocialIcon('notion')} size={20} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}>Notion</Text>
                    <Ionicons name="chevron-forward" size={16} color="#888" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                )}

                {member.figma && (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(getSocialUrl('figma', member.figma!))}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                    }}
                  >
                    <Ionicons name={getSocialIcon('figma')} size={20} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}>Figma</Text>
                    <Ionicons name="chevron-forward" size={16} color="#888" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                )}

                {member.kakao_id && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                    }}
                  >
                    <Ionicons name={getSocialIcon('kakao_id')} size={20} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}>카카오톡</Text>
                    <Text style={{ color: '#888', fontSize: 14, marginLeft: 'auto' }}>{member.kakao_id}</Text>
                  </View>
                )}

                {member.instagram_id && (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(getSocialUrl('instagram_id', member.instagram_id!))}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                    }}
                  >
                    <Ionicons name={getSocialIcon('instagram_id')} size={20} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}>Instagram</Text>
                    <Ionicons name="chevron-forward" size={16} color="#888" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* 자기소개 섹션 */}
          {member.self_introduction && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                자기소개
              </Text>
              <Text style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 24 }}>
                {member.self_introduction}
              </Text>
            </View>
          )}

          {/* 추가 경력 섹션 */}
          {member.additional_career && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                추가 경력
              </Text>
              <Text style={{ color: '#e0e0e0', fontSize: 16, lineHeight: 24 }}>
                {member.additional_career}
              </Text>
            </View>
          )}

          {/* 활동 이력 섹션 */}
          {member.history && member.history.length > 0 && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                활동 이력
              </Text>
              {member.history.map((item, index) => (
                <View
                  key={index}
                  style={{
                    paddingVertical: 8,
                    borderBottomWidth: index < member.history!.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Text style={{ color: '#e0e0e0', fontSize: 16 }}>• {item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 활동 기수 섹션 */}
          {member.active_gens && member.active_gens.length > 0 && (
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              padding: 20,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
                활동 기수
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {member.active_gens.map((gen, index) => (
                  <View
                    key={index}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: '#8B0000',
                    }}
                  >
                    <Text style={{ color: '#ffa282', fontSize: 14, fontWeight: '600' }}>
                      {gen === 0 ? '창립멤버' : `${gen}기`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
