import React from 'react';
import { TouchableOpacity, Text, View, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@prometheus-fe/stores';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

interface GoogleLoginButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onPress,
  disabled = false,
  style,
}) => {
  const { googleCallback, isLoading, error, clearError } = useAuthStore();

  const handleGoogleLogin = async () => {
    if (onPress) {
      onPress();
      return;
    }

    const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      Alert.alert(
        'Google 로그인 설정 오류',
        'Google Client ID가 누락되었습니다. .env 파일을 확인하거나 개발자에게 문의하세요.',
      );
      return;
    }

    try {
      console.log('Checking Google Play Services...');
      await GoogleSignin.hasPlayServices();
      
      console.log('Starting Google Sign-In...');
      const userInfo = await GoogleSignin.signIn();
      const serverAuthCode = userInfo.data?.serverAuthCode;

      if (serverAuthCode) {
        console.log('Google OAuth code received, calling backend...');
        const googleLoginSuccess = await googleCallback(serverAuthCode);

        if (googleLoginSuccess) {
          console.log('Google login successful, redirecting to index...');
          Alert.alert('로그인 성공', '프로메테우스에 성공적으로 로그인되었습니다!');
          router.replace('/');
        } else {
          // 에러는 이미 auth store에 설정되어 있음
          if (error) {
            Alert.alert('Google 로그인 실패', error);
            clearError();
          } else {
            Alert.alert('Google 로그인 실패', '로그인 처리 중 오류가 발생했습니다.');
          }
        }
      } else {
        console.error('No server auth code received from Google');
        Alert.alert('Google 로그인', 'Google 인증 토큰을 받지 못했습니다.');
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google login cancelled by user');
        // 사용자가 취소한 경우는 알림을 표시하지 않음
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Google 로그인', 'Google 로그인이 진행 중입니다.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google 로그인', 'Google Play 서비스를 사용할 수 없습니다.');
      } else {
        Alert.alert('Google 로그인', 'Google 로그인 중 오류가 발생했습니다.');
      }
    }
  };

  const googleIcon = (
    <Svg viewBox="0 0 48 48" width={20} height={20}>
      <Path
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        fill="#FFC107"
      />
      <Path
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        fill="#FF3D00"
      />
      <Path
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        fill="#4CAF50"
      />
      <Path
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        fill="#1976D2"
      />
    </Svg>
  );

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: '#FFFFFF',
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
      onPress={handleGoogleLogin}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="#000000" style={{ marginRight: 16 }} />
          <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>
            로그인 중...
          </Text>
        </>
      ) : (
        <>
          <View style={{ width: 20, height: 20, marginRight: 16 }}>{googleIcon}</View>
          <Text style={{ color: '#000000', fontSize: 16, fontWeight: '600' }}>
            Google로 로그인
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;
