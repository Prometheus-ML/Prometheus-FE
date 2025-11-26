import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MemberDetailResponse } from '@prometheus-fe/types';
import { useImage, useCoffeeChat, useMember } from '@prometheus-fe/hooks';
import { useAuthStore } from '@prometheus-fe/stores';
import { Ionicons } from '@expo/vector-icons';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberDetailResponse | null;
}

export default function MemberModal({ isOpen, onClose, member }: MemberModalProps) {
  const { getThumbnailUrl } = useImage();
  const { createRequest } = useCoffeeChat();
  const { blockMember } = useMember();
  const { user } = useAuthStore();

  // 커피챗 관련 상태
  const [showCoffeeChat, setShowCoffeeChat] = useState(false);
  const [coffeeChatMessage, setCoffeeChatMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [modalImageError, setModalImageError] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModalImageError(false);
      setShowCoffeeChat(false);
      setCoffeeChatMessage('');
    }
  }, [isOpen]);

  if (!member) return null;

  const getFirstLetter = (name: string) => {
    return name && name.length ? name.trim().charAt(0) : 'U';
  };

  const handleCoffeeChatToggle = () => {
    setShowCoffeeChat(!showCoffeeChat);
    if (!showCoffeeChat) {
      setCoffeeChatMessage('');
    }
  };

  const handleSendCoffeeChat = async () => {
    if (!member || !coffeeChatMessage.trim()) return;
    
    // 자기 자신에게 요청하는지 확인
    if (user && member.id === user.id) {
      Alert.alert('알림', '자기 자신에게는 커피챗을 요청할 수 없습니다.');
      return;
    }
    
    try {
      setIsRequesting(true);
      await createRequest({
        recipient_id: member.id,
        message: coffeeChatMessage
      });
      setShowCoffeeChat(false);
      setCoffeeChatMessage('');
      Alert.alert('성공', '커피챗 요청이 전송되었습니다.');
    } catch (error) {
      console.error('Failed to send coffee chat:', error);
      Alert.alert('오류', '커피챗 요청 전송에 실패했습니다.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleBlockMember = () => {
    if (!member || !user) return;
    if (member.id === user.id) {
      Alert.alert('알림', '자기 자신은 차단할 수 없습니다.');
      return;
    }

    Alert.alert(
      '멤버 차단',
      `${member.name}님을 차단하시겠습니까?\n차단하면 해당 멤버는 당신의 커피챗 상태를 볼 수 없습니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '차단',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsBlocking(true);
              await blockMember(member.id);
              Alert.alert('완료', '멤버가 차단되었습니다.');
              onClose();
            } catch (error: any) {
              console.error('Failed to block member:', error);
              const message =
                error?.response?.data?.detail || '멤버 차단에 실패했습니다.';
              Alert.alert('오류', message);
            } finally {
              setIsBlocking(false);
            }
          },
        },
      ],
    );
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
        
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
              {member.profile_image_url && !modalImageError ? (
                <Image
                  source={{ uri: getThumbnailUrl(member.profile_image_url, 200) }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                  }}
                  onError={() => setModalImageError(true)}
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

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {member.coffee_chat_enabled && (
                  <TouchableOpacity
                    onPress={handleCoffeeChatToggle}
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
                  </TouchableOpacity>
                )}

                {user && member.id !== user.id && (
                  <TouchableOpacity
                    onPress={handleBlockMember}
                    disabled={isBlocking}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: 'rgba(220, 38, 38, 0.15)',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      borderWidth: 1,
                      borderColor: 'rgba(220, 38, 38, 0.4)',
                      opacity: isBlocking ? 0.6 : 1,
                    }}
                  >
                    {isBlocking ? (
                      <ActivityIndicator size="small" color="#DC2626" />
                    ) : (
                      <Ionicons name="ban" size={16} color="#F87171" />
                    )}
                    <Text style={{ color: '#F87171', fontSize: 14, fontWeight: '600' }}>
                      차단
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 이메일 */}
            {/* <Text style={{ color: '#e0e0e0', fontSize: 16, marginBottom: 8 }}>
              {member.email}
            </Text> */}
          </View>

          {/* 커피챗 요청 섹션 */}
          {showCoffeeChat && member.coffee_chat_enabled && (
            <View style={{
              backgroundColor: 'rgba(0, 101, 77, 0.1)',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: 'rgba(0, 101, 77, 0.3)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Ionicons name="cafe" size={20} color="#00654D" />
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 }}>
                  커피챗 요청
                </Text>
              </View>
              
              <TextInput
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                  color: '#FFFFFF',
                  fontSize: 16,
                  textAlignVertical: 'top',
                  minHeight: 100,
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
                placeholder="커피챗 요청 메시지를 작성해주세요..."
                placeholderTextColor="#888"
                value={coffeeChatMessage}
                onChangeText={setCoffeeChatMessage}
                multiline
                maxLength={300}
              />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text style={{ color: '#888', fontSize: 12 }}>
                  {coffeeChatMessage.length}/300
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setShowCoffeeChat(false)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Text style={{ color: '#e0e0e0', fontSize: 14, fontWeight: '500' }}>
                      취소
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSendCoffeeChat}
                    disabled={!coffeeChatMessage.trim() || isRequesting}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: !coffeeChatMessage.trim() || isRequesting ? 'rgba(255, 255, 255, 0.1)' : '#00654D',
                      opacity: !coffeeChatMessage.trim() || isRequesting ? 0.5 : 1,
                    }}
                  >
                    {isRequesting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                        전송
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* 기본 정보 섹션 */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}>
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

            {member.mbti && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#888', fontSize: 14, marginBottom: 4 }}>MBTI</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16 }}>{member.mbti}</Text>
              </View>
            )}
          </View>

          {/* 공개 정보 섹션 */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}>
            {/* 자기소개 */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                자기소개
              </Text>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: 12,
              }}>
                <Text style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 20 }}>
                  {member.self_introduction || '자기소개가 없습니다.'}
                </Text>
              </View>
            </View>
            
            {/* 이력 */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                이력
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {member.history && member.history.length > 0 ? (
                  member.history.map((h: string, i: number) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ color: '#e0e0e0', fontSize: 14 }}>
                        {h}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}>
                    <Text style={{ color: '#9ca3af', fontSize: 14 }}>
                      없음
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* 추가 경력 */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                추가 경력
              </Text>
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: 12,
              }}>
                <Text style={{ color: '#e0e0e0', fontSize: 14, lineHeight: 20 }}>
                  {member.additional_career || '추가 경력이 없습니다.'}
                </Text>
              </View>
            </View>
            
            {/* 링크 */}
            <View>
              <Text style={{ color: '#d1d5db', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                링크
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {member.github ? (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(getSocialUrl('github', member.github!))}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Ionicons name="logo-github" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#e0e0e0', fontSize: 14 }}>GitHub</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      opacity: 0.5,
                    }}
                  >
                    <Ionicons name="logo-github" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#e0e0e0', fontSize: 14 }}>GitHub</Text>
                  </View>
                )}
                
                {member.notion ? (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(getSocialUrl('notion', member.notion!))}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Ionicons name="document-text" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#e0e0e0', fontSize: 14 }}>Notion</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      opacity: 0.5,
                    }}
                  >
                    <Ionicons name="document-text" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#e0e0e0', fontSize: 14 }}>Notion</Text>
                  </View>
                )}
                
                {member.figma ? (
                  <TouchableOpacity
                    onPress={() => handleLinkPress(getSocialUrl('figma', member.figma!))}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Ionicons name="color-palette" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#e0e0e0', fontSize: 14 }}>Figma</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      opacity: 0.5,
                    }}
                  >
                    <Ionicons name="color-palette" size={16} color="#FFFFFF" />
                    <Text style={{ color: '#e0e0e0', fontSize: 14 }}>Figma</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 소셜 링크 섹션 (카카오톡, 인스타그램) */}
          {(member.kakao_id || member.instagram_id) && (
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
                    <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
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
                    <Ionicons name="logo-instagram" size={20} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 16, marginLeft: 12 }}>Instagram</Text>
                    <Ionicons name="chevron-forward" size={16} color="#888" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                )}
              </View>
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
