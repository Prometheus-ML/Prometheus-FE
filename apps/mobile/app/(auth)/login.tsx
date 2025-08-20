import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleLoginButton } from '../../components';
import { useAuthStore } from '@prometheus-fe/stores';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [googleConfigured, setGoogleConfigured] = useState(false);
  const { error, clearError } = useAuthStore();

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

  // 에러가 있을 때 표시
  useEffect(() => {
    if (error) {
      Alert.alert('로그인 오류', error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <View style={styles.container}>
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
            <View style={styles.logoInner} />
          </View>
          <Text style={styles.tagline}>대학생 인공지능 단체</Text>
          <Text style={styles.appName}>Prometheus</Text>
        </View>

        {/* Login section */}
        <View style={styles.loginSection}>
          {googleConfigured ? (
            <GoogleLoginButton />
          ) : (
            <View style={[styles.googleButton, { opacity: 0.5 }]}>
              <Text style={styles.googleButtonText}>Google 로그인 설정 중...</Text>
            </View>
          )}
          
          <Text style={styles.infoText}>프로메테우스 멤버가 아니에요</Text>
        </View>
      </View>
    </View>
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
    backgroundColor: '#8B0000',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoInner: {
    width: 60,
    height: 60,
    backgroundColor: '#FF4500',
    borderRadius: 15,
    transform: [{ rotate: '45deg' }],
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
});
