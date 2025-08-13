"use client";
import React from "react";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const frontUri = process.env.NEXT_PUBLIC_FRONT_URI;
    const redirectUri = `${frontUri}/auth/google`;
    if (!googleClientId) {
      alert("Google Client ID가 설정되지 않았습니다.");
      return;
    }
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=email%20profile`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <button onClick={handleGoogleLogin}>Google로 로그인</button>
    </div>
  );
}


