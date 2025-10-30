"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (tempToken: string, userId: string) => void;
}

export default function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  if (!isOpen) return null;

  // 전화번호 포맷팅 (010-1234-5678)
  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleSendCode = async () => {
    if (phone.replace(/[^\d]/g, '').length !== 11) {
      setError('올바른 전화번호를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: API 연결 - 실제 authApi 사용
      // const response = await authApi.sendPhoneVerificationCode({ phone });
      
      // Mock 응답 (개발용)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        message: '인증 코드가 발송되었습니다',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      };

      setExpiresAt(new Date(mockResponse.expires_at));
      setStep('code');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || '인증 코드 발송에 실패했습니다';
    setError(errorMessage);
    
    // 회원이 아닌 경우
    if (errorMessage.includes('프로메테우스 회원이 아닙니다')) {
      // 색상을 다르게 하거나 추가 안내 표시 가능
    }
  } finally {
    setLoading(false);
  }
    
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('6자리 인증 코드를 입력해주세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: API 연결
      // const response = await authApi.verifyPhoneCode({ phone, code });
      
      // Mock 응답 (개발용)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockResponse = {
        temp_token: 'mock_temp_token_12345',
        user: {
          id: 'user_123',
          name: '홍길동',
          phone: phone,
          current_google_email: '[email protected]'
        }
      };

      onVerified(mockResponse.temp_token, mockResponse.user.id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '인증 코드가 올바르지 않습니다');
    } finally {
      setLoading(false);
    }
    
  };

  const handleResendCode = async () => {
    setCode('');
    setError('');
    await handleSendCode();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Step 1: Phone input */}
        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-kimm-bold text-white mb-2">
                전화번호 인증
              </h2>
              <p className="text-gray-400 text-sm font-pretendard">
                단체에 등록된 전화번호를 입력해주세요
              </p>
            </div>

            <div>
              <label className="block text-sm font-pretendard text-gray-300 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                maxLength={13}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 font-pretendard focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm font-pretendard">
                {error}
              </div>
            )}

            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-pretendard py-3 rounded-lg transition-colors"
            >
              {loading ? '발송 중...' : '인증 코드 받기'}
            </button>
          </div>
        )}

        {/* Step 2: Code input */}
        {step === 'code' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-kimm-bold text-white mb-2">
                인증 코드 입력
              </h2>
              <p className="text-gray-400 text-sm font-pretendard">
                {phone}으로 전송된 6자리 코드를 입력해주세요
              </p>
            </div>

            <div>
              <label className="block text-sm font-pretendard text-gray-300 mb-2">
                인증 코드
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  setCode(value);
                  setError('');
                }}
                placeholder="123456"
                maxLength={6}
                className="w-full bg-gray-800 text-white text-center text-2xl tracking-widest rounded-lg px-4 py-3 font-pretendard focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm font-pretendard">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-pretendard py-3 rounded-lg transition-colors"
            >
              {loading ? '확인 중...' : '인증하기'}
            </button>

            <button
              onClick={handleResendCode}
              disabled={loading}
              className="w-full text-gray-400 hover:text-white font-pretendard text-sm transition-colors"
            >
              인증 코드 재발송
            </button>

            <button
              onClick={() => {
                setStep('phone');
                setCode('');
                setError('');
              }}
              className="w-full text-gray-400 hover:text-white font-pretendard text-sm transition-colors"
            >
              전화번호 변경
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
