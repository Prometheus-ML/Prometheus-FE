import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Alert, Image, TextInput, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleLoginButton, AppleLoginButton } from '../../components';
import { useAuthStore } from '@prometheus-fe/stores';
import { router } from 'expo-router';
const { width, height } = Dimensions.get('window');

export default function Login() {
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const [showTempLogin, setShowTempLogin] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const { error, clearError, tempLogin, isLoading } = useAuthStore();

  // Google Sign-In 설정
  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
        const googleIosClientId = process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID;

        if (!googleClientId) {
          console.error('Google Client ID가 설정되지 않았습니다.');
          Alert.alert(
            'Google 로그인 설정 오류',
            'Google Client ID가 설정되지 않았습니다. 개발자에게 문의하세요.'
          );
          return;
        }

        GoogleSignin.configure({
          webClientId: googleClientId,
          iosClientId: googleIosClientId,
          scopes: ['profile', 'email'],
          offlineAccess: true,
        });

        setGoogleConfigured(true);
        console.log('Google Sign-In configured successfully');
      } catch (error) {
        console.error('Google Sign-In configuration failed:', error);
        Alert.alert(
          'Google 로그인 설정 오류',
          'Google 로그인 설정에 실패했습니다.'
        );
      }
    };

    configureGoogleSignIn();
  }, []);

  // 회원이 아닌 경우에만 Alert로 표시
  useEffect(() => {
    if (error) {
      // 회원 미등록 에러인 경우에만 Alert 표시
      if (error.includes('프로메테우스 회원으로 등록되지 않은 계정입니다')) {
        Alert.alert('로그인 실패', error);
      }
      // 다른 에러는 Alert로 표시하지 않음
      clearError();
    }
  }, [error, clearError]);

  const handleTempLogin = async () => {
    if (!isTermsAgreed) {
      Alert.alert('약관 동의 필요', 'EULA약관에 동의해야 로그인할 수 있습니다.');
      return;
    }

    if (!tempUsername.trim() || !tempPassword.trim()) {
      Alert.alert('입력 오류', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    const success = await tempLogin(tempUsername.trim(), tempPassword.trim());
    if (success) {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Modal
        visible={isTermsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>EULA 약관</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionTitle}>불관용 정책</Text>
              <Text style={styles.modalText}>
                프로메테우스는 불쾌감을 주는 콘텐츠 또는 악성 사용자에 대해
                관용이 없다.
              </Text>

              <Text style={styles.modalSectionTitle}>사용자 책임</Text>
              <Text style={styles.modalText}>
                사용자가 생성하는 모든 콘텐츠에 대한 책임은 사용자 본인에게 있다. 사용자는 불법적이거나
                불쾌한 콘텐츠를 게시해서는 안 되며, 관련 법령과 커뮤니티 가이드를 준수해야 한다.
              </Text>

              <Text style={styles.modalSectionTitle}>강력한 조치</Text>
              <Text style={styles.modalText}>
                불관용 정책을 위반할 경우, 프로메테우스는 서비스 내 콘텐츠 삭제, 계정 일시 정지, 또는
                영구 퇴출 등의 강력한 조치를 취할 수 있다.
              </Text>
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setIsTermsAgreed(false);
                  setIsTermsModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>동의하지 않음</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={() => {
                  setIsTermsAgreed(true);
                  setIsTermsModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>동의함</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Background with curved shapes */}
      <View style={styles.background}>
        <View style={styles.curvedShape1} />
        <View style={styles.curvedShape2} />
        <View style={styles.curvedShape3} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo and branding */}
        <View style={styles.brandingSection}>
          <View style={styles.logo}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tagline}>대학생 인공지능 단체</Text>
          <Text style={styles.appName}>Prometheus</Text>
        </View>

        {/* Login section */}
        <View style={styles.loginSection}>
          {!showTempLogin ? (
            <>
              {googleConfigured ? (
                <GoogleLoginButton isTermsAgreed={isTermsAgreed} />
              ) : (
                <View style={[styles.googleButton, { opacity: 0.5 }]}>
                  <Text style={styles.googleButtonText}>Google 로그인 설정 중...</Text>
                </View>
              )}
              {Platform.OS === 'ios' && (
                <AppleLoginButton isTermsAgreed={isTermsAgreed} />
              )}

              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setIsTermsModalVisible(true)}
              >
                <View style={[styles.termsIndicator, isTermsAgreed && styles.termsIndicatorActive]} />
                <Text style={styles.termsText}>EULA약관에 동의합니다.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.tempLoginToggle}
                onPress={() => setShowTempLogin(true)}
              >
                <Text style={styles.tempLoginToggleText}>임시 로그인 (심사용)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.infoText}>프로메테우스 멤버가 아니에요</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.tempLoginContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setShowTempLogin(false)}
              >
                <Text style={styles.backButtonText}>← 뒤로</Text>
              </TouchableOpacity>
              
              <Text style={styles.tempLoginTitle}>임시 로그인</Text>
              <Text style={styles.tempLoginSubtitle}>개발 및 테스트용 계정</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>아이디</Text>
                <TextInput
                  style={styles.input}
                  placeholder="username"
                  placeholderTextColor="#888"
                  value={tempUsername}
                  onChangeText={setTempUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>비밀번호</Text>
                <TextInput
                  style={styles.input}
                  placeholder="password"
                  placeholderTextColor="#888"
                  value={tempPassword}
                  onChangeText={setTempPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setIsTermsModalVisible(true)}
              >
                <View style={[styles.termsIndicator, isTermsAgreed && styles.termsIndicatorActive]} />
                <Text style={styles.termsText}>EULA약관에 동의합니다.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.tempLoginButton, isLoading && styles.tempLoginButtonDisabled]}
                onPress={handleTempLogin}
                disabled={isLoading}
              >
                <Text style={styles.tempLoginButtonText}>
                  {isLoading ? '로그인 중...' : '로그인'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  curvedShape1: {
    position: 'absolute',
    top: height * 0.3,
    right: -width * 0.2,
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: 'rgba(139, 0, 0, 0.3)',
    borderRadius: width * 0.3,
  },
  curvedShape2: {
    position: 'absolute',
    bottom: height * 0.1,
    left: -width * 0.15,
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: 'rgba(194, 64, 42, 0.2)',
    borderRadius: width * 0.25,
  },
  curvedShape3: {
    position: 'absolute',
    bottom: height * 0.05,
    right: -width * 0.1,
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: 'rgba(139, 0, 0, 0.15)',
    borderRadius: width * 0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: height * 0.15,
    paddingBottom: height * 0.1,
  },
  brandingSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoInner: {
    width: 60,
    height: 60,
    backgroundColor: '#FF4500',
    borderRadius: 15,
    transform: [{ rotate: '45deg' }],
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loginSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#4285F4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  googleG: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  termsIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#c2402a',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  termsIndicatorActive: {
    backgroundColor: '#c2402a',
  },
  termsText: {
    fontSize: 13,
    color: '#888888',
    textDecorationLine: 'underline',
  },
  tempLoginToggle: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tempLoginToggleText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  appleDisabledContainer: {
    width: 200,
    height: 44,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  appleDisabledText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  tempLoginContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  tempLoginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  tempLoginSubtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  tempLoginButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c2402a',
    marginTop: 16,
  },
  tempLoginButtonDisabled: {
    opacity: 0.5,
  },
  tempLoginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#111111',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#c2402a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  modalText: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 18,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalConfirmButton: {
    backgroundColor: '#c2402a',
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
