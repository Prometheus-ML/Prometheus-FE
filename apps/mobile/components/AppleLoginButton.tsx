import React from 'react';
import { TouchableOpacity, Text, View, Alert, ActivityIndicator, Platform } from 'react-native';
import { useAuthStore } from '@prometheus-fe/stores';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';

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
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 12,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
          opacity: (isLoading || disabled) ? 0.7 : 1,
        },
        style,
      ]}
      onPress={handleAppleLogin}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 16 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            로그인 중...
          </Text>
        </>
      ) : (
        <>
          <View style={{ width: 20, height: 20, marginRight: 16 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18 }}>🍎</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            Apple로 로그인
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default AppleLoginButton;

