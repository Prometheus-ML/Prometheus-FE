import React from 'react';
import { TouchableOpacity, Text, View, Alert, ActivityIndicator, Platform } from 'react-native';
import { useAuthStore } from '@prometheus-fe/stores';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import Svg, { Path } from 'react-native-svg';

interface AppleLoginButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

const AppleLoginButton: React.FC<AppleLoginButtonProps> = ({
  onPress,
  disabled = false,
  style,
}) => {
  const { appleLogin, isLoading, error, clearError } = useAuthStore();

  const handleAppleLogin = async () => {
    if (onPress) {
      onPress();
      return;
    }

    // iOS에서만 Apple 로그인 지원
    if (Platform.OS !== 'ios') {
      Alert.alert(
        'Apple 로그인',
        'Apple 로그인은 iOS에서만 사용할 수 있습니다.',
      );
      return;
    }

    try {
      console.log('Starting Apple Sign-In...');
      
      // Apple 인증 시작
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        console.log('Apple identity token received, calling backend...');
        
        // 사용자 정보 구성 (첫 로그인 시에만 제공됨)
        const user = credential.fullName ? {
          name: {
            firstName: credential.fullName.givenName || undefined,
            lastName: credential.fullName.familyName || undefined,
          },
          email: credential.email || undefined,
        } : undefined;

        const appleLoginSuccess = await appleLogin(credential.identityToken, user);

        if (appleLoginSuccess) {
          console.log('Apple login successful, redirecting to index...');
          Alert.alert('로그인 성공', '프로메테우스에 성공적으로 로그인되었습니다!');
          router.replace('/');
        } else {
          // 에러는 이미 auth store에 설정되어 있음
          if (error) {
            Alert.alert('Apple 로그인 실패', error);
            clearError();
          } else {
            Alert.alert('Apple 로그인 실패', '로그인 처리 중 오류가 발생했습니다.');
          }
        }
      } else {
        console.error('No identity token received from Apple');
        Alert.alert('Apple 로그인', 'Apple 인증 토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('Apple Auth Error:', error);
      
      if (error.code === 'ERR_CANCELED') {
        console.log('Apple login cancelled by user');
        // 사용자가 취소한 경우는 알림을 표시하지 않음
      } else if (error.code === 'ERR_INVALID_RESPONSE') {
        Alert.alert(
          'Apple 로그인 오류',
          'Apple 인증 응답이 유효하지 않습니다. 다시 시도해주세요.'
        );
      } else if (error.code === 'ERR_NOT_AVAILABLE') {
        Alert.alert(
          'Apple 로그인',
          'Apple 로그인을 사용할 수 없습니다.\n\n해결 방법:\n1. iOS 13 이상이 필요합니다\n2. Apple ID가 기기에 로그인되어 있어야 합니다\n3. 설정 > Apple ID > 암호 및 보안에서 Apple ID 로그인 활성화'
        );
      } else {
        Alert.alert(
          'Apple 로그인 오류',
          `오류 코드: ${error.code}\n메시지: ${error.message}\n\n다시 시도해주세요.`
        );
      }
    }
  };

  // Apple 로고 SVG (Apple 공식 디자인)
  const appleLogo = (
    <Svg viewBox="0 0 24 24" width={18} height={18} style={{ marginRight: 8 }}>
      <Path
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
        fill="#FFFFFF"
      />
    </Svg>
  );

  // iOS가 아니면 버튼을 표시하지 않음
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: '#000000',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          minHeight: 44, // Apple 최소 터치 영역
          borderRadius: 8,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 2,
          opacity: (isLoading || disabled) ? 0.6 : 1,
        },
        style,
      ]}
      onPress={handleAppleLogin}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 12 }} />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: '400',
              letterSpacing: -0.41,
            }}
          >
            로그인 중...
          </Text>
        </>
      ) : (
        <>
          {appleLogo}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 17,
              fontWeight: '400',
              letterSpacing: -0.41,
            }}
          >
            Apple로 계속하기
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppleLoginButton;

