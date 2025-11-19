import React from 'react';
import { View, Alert, Platform } from 'react-native';
import { useAuthStore } from '@prometheus-fe/stores';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';

interface AppleLoginButtonProps {
  isTermsAgreed?: boolean;
}

export default function AppleLoginButton({ isTermsAgreed = true }: AppleLoginButtonProps) {
  const { appleLogin, error, clearError } = useAuthStore();

  const handleAppleLogin = async () => {
    if (!isTermsAgreed) {
      Alert.alert('약관 동의 필요', 'EULA약관에 동의해야 로그인할 수 있습니다.');
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

      console.log('Apple signInAsync completed:', {
        hasIdentityToken: !!credential.identityToken,
        hasUser: !!credential.user,
        hasEmail: !!credential.email,
        hasFullName: !!credential.fullName,
        realUserStatus: credential.realUserStatus,
      });

      if (credential.identityToken) {
        console.log('Apple identity token received, calling backend...');
        console.log('Identity token length:', credential.identityToken.length);
        
        // 사용자 정보 구성 (첫 로그인 시에만 제공됨)
        const user = credential.fullName ? {
          name: {
            firstName: credential.fullName.givenName || undefined,
            lastName: credential.fullName.familyName || undefined,
          },
          email: credential.email || undefined,
        } : undefined;

        console.log('User info prepared:', {
          hasUser: !!user,
          hasName: !!user?.name,
          hasEmail: !!user?.email,
        });

        console.log('Calling appleLogin function...');
        const appleLoginSuccess = await appleLogin(credential.identityToken, user);
        console.log('appleLogin result:', appleLoginSuccess);

        if (appleLoginSuccess) {
          console.log('Apple login successful, redirecting to index...');
          Alert.alert('로그인 성공', '프로메테우스에 성공적으로 로그인되었습니다!');
          router.replace('/');
        } else {
          console.log('Apple login failed, checking error state...');
          // 에러는 이미 auth store에 설정되어 있음
          if (error) {
            console.log('Error from store:', error);
            Alert.alert('Apple 로그인 실패', error);
            clearError();
          } else {
            console.log('No error in store, showing generic error');
            Alert.alert('Apple 로그인 실패', '로그인 처리 중 오류가 발생했습니다.');
          }
        }
      } else {
        console.error('No identity token received from Apple');
        console.error('Credential object:', JSON.stringify(credential, null, 2));
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
      }
    }
  };

  // iOS가 아니면 버튼을 표시하지 않음
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10  }}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={5}
        style={{ width: 200, height: 44 }}
        onPress={handleAppleLogin}
      />
    </View>
  );
};
