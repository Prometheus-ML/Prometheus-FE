'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@prometheus-fe/stores';
import { useImage, useMember } from '@prometheus-fe/hooks';
import { MyProfileUpdateRequest } from '@prometheus-fe/types';

export default function MyPage() {
  const { isAuthenticated } = useAuthStore();
  const { getMyProfile, updateMyProfile, myProfile, isLoadingProfile } = useMember();
  const { getThumbnailUrl } = useImage();

  // 상태 관리
  const [profileInnerTab, setProfileInnerTab] = useState<'basic' | 'optional'>('basic');
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [myProfileDraft, setMyProfileDraft] = useState<MyProfileUpdateRequest>({
    github: '',
    notion: '',
    figma: '',
    kakao_id: '',
    instagram_id: '',
    mbti: '',
    gender: '',
    coffee_chat_enabled: false,
    self_introduction: '',
    additional_career: '',
    profile_image_url: ''
  });

  const profileImageInputRef = useRef<HTMLInputElement>(null);

  // 유틸리티 함수들
  const getFirstLetter = useCallback((name: string) => {
    return name && name.length ? String(name).trim().charAt(0) : 'U';
  }, []);

  const selfIntroCount = myProfileDraft.self_introduction?.length || 0;
  const additionalCareerCount = myProfileDraft.additional_career?.length || 0;

  // 내 프로필 로드
  const loadMyProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      if (data) {
        // draft 동기화
        setMyProfileDraft({
          github: data.github ?? '',
          notion: data.notion ?? '',
          figma: data.figma ?? '',
          kakao_id: data.kakao_id ?? '',
          instagram_id: data.instagram_id ?? '',
          mbti: data.mbti ?? '',
          gender: data.gender ?? '',
          coffee_chat_enabled: !!data.coffee_chat_enabled,
          self_introduction: data.self_introduction ?? '',
          additional_career: data.additional_career ?? '',
          profile_image_url: data.profile_image_url ?? ''
        });
        setProfileImageError(false);
      }
    } catch (err) {
      console.error('Failed to load my profile:', err);
    }
  }, [getMyProfile]);

  // 이미지 선택 트리거
  const triggerMyProfileImageSelect = useCallback(() => {
    profileImageInputRef.current?.click();
  }, []);

  // 이미지 변경 처리
  const onMyProfileImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    try {
      setProfileSubmitting(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'member');

      // TODO: 이미지 업로드 API 호출
      // const res = await uploadImage(formData);
      // const cdn = res?.publicCdnUrl || (res?.id ? `https://lh3.googleusercontent.com/d/${res.id}=s512-c` : '');
      // setMyProfileDraft(prev => ({
      //   ...prev,
      //   profile_image_url: cdn || res?.publicEmbedUrl || res?.publicEmbedUrlAlt || prev.profile_image_url
      // }));

      alert('이미지 업로드 기능은 준비 중입니다.');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('이미지 업로드 실패');
    } finally {
      setProfileSubmitting(false);
      if (e.target) e.target.value = '';
    }
  }, []);

  // 프로필 저장
  const submitMyProfile = useCallback(async () => {
    try {
      setProfileSubmitting(true);
      await updateMyProfile(myProfileDraft);
      setProfileEditMode(false);
      alert('저장되었습니다');
    } catch (err) {
      console.error('Profile update failed:', err);
      alert('저장 실패');
    } finally {
      setProfileSubmitting(false);
    }
  }, [updateMyProfile, myProfileDraft]);

  // 프로필 편집 취소
  const cancelMyProfileEdit = useCallback(() => {
    setProfileEditMode(false);
    loadMyProfile();
  }, [loadMyProfile]);

  // 초기 로드
  useEffect(() => {
    if (isAuthenticated()) {
      loadMyProfile();
    }
  }, [isAuthenticated, loadMyProfile]);

  if (!myProfile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      {/* 내 프로필 */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">내 프로필</h2>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {myProfile.profile_image_url && !profileImageError ? (
                  <div className="relative w-20 h-20">
                    <Image
                      src={getThumbnailUrl(myProfile.profile_image_url, 160)}
                      alt={myProfile.name}
                      fill
                      className="rounded-full object-cover border"
                      onError={() => setProfileImageError(true)}
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-medium">
                    {getFirstLetter(myProfile.name)}
                  </div>
                )}
                <input 
                  ref={profileImageInputRef}
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={onMyProfileImageChange} 
                />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold">{myProfile.name}</div>
                <div className="text-sm text-gray-600">{myProfile.email}</div>
              </div>
              {profileInnerTab === 'optional' && profileEditMode && (
                <button 
                  onClick={triggerMyProfileImageSelect} 
                  disabled={profileSubmitting} 
                  className="px-3 py-1.5 rounded border hover:bg-gray-50 cursor-pointer"
                >
                  이미지 변경
                </button>
              )}
            </div>

            {/* 내부 탭 */}
            <div className="border-b mb-4">
              <nav className="-mb-px flex space-x-6">
                <button 
                  onClick={() => setProfileInnerTab('basic')} 
                  className={`py-2 px-1 border-b-2 text-sm cursor-pointer ${
                    profileInnerTab === 'basic' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  기본 정보
                </button>
                <button 
                  onClick={() => setProfileInnerTab('optional')} 
                  className={`py-2 px-1 border-b-2 text-sm cursor-pointer ${
                    profileInnerTab === 'optional' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  선택 정보
                </button>
              </nav>
            </div>

            {/* 기본 정보: 읽기 전용 */}
            {profileInnerTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500">이름</label><div className="mt-1">{myProfile.name}</div></div>
                <div><label className="text-xs text-gray-500">이메일</label><div className="mt-1">{myProfile.email}</div></div>
                <div><label className="text-xs text-gray-500">권한</label><div className="mt-1">{myProfile.grant}</div></div>
                <div><label className="text-xs text-gray-500">상태</label><div className="mt-1">{myProfile.status}</div></div>
                <div><label className="text-xs text-gray-500">기수</label><div className="mt-1">{myProfile.gen ?? '-'}</div></div>
                <div><label className="text-xs text-gray-500">학교</label><div className="mt-1">{myProfile.school ?? '-'}</div></div>
                <div><label className="text-xs text-gray-500">전공</label><div className="mt-1">{myProfile.major ?? '-'}</div></div>
                <div><label className="text-xs text-gray-500">학번</label><div className="mt-1">{myProfile.student_id ?? '-'}</div></div>
                <div><label className="text-xs text-gray-500">생년월일</label><div className="mt-1">{myProfile.birthdate ?? '-'}</div></div>
                <div><label className="text-xs text-gray-500">전화번호</label><div className="mt-1">{myProfile.phone ?? '-'}</div></div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">활동 시작일</label>
                  <div className="mt-1">{myProfile.activity_start_date ?? '-'}</div>
                </div>
                {myProfile.active_gens?.length && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">활동 기수</label>
                    <div className="mt-1">{myProfile.active_gens.join(', ')}</div>
                  </div>
                )}
                {myProfile.history?.length && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">이력</label>
                    <div className="mt-1">{myProfile.history.join(', ')}</div>
                  </div>
                )}
              </div>
            )}

            {/* 선택 정보: 편집 가능 */}
            {profileInnerTab === 'optional' && (
              <div>
                <div className="flex items-center justify-end mb-3 space-x-2">
                  {!profileEditMode ? (
                                    <button 
                  onClick={() => setProfileEditMode(true)} 
                  className="px-3 py-1.5 rounded border hover:bg-gray-50 cursor-pointer"
                >
                      수정
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={submitMyProfile} 
                        disabled={profileSubmitting} 
                        className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      >
                        {profileSubmitting ? '저장 중...' : '저장'}
                      </button>
                      <button 
                        onClick={cancelMyProfileEdit} 
                        disabled={profileSubmitting} 
                        className="px-3 py-1.5 rounded border hover:bg-gray-50 cursor-pointer"
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">GitHub</label>
                    <input 
                      value={myProfileDraft.github || ''} 
                      onChange={(e) => setMyProfileDraft(prev => ({ ...prev, github: e.target.value }))}
                      disabled={!profileEditMode} 
                      type="url" 
                      className="mt-1 w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Notion</label>
                    <input 
                      value={myProfileDraft.notion || ''} 
                      onChange={(e) => setMyProfileDraft(prev => ({ ...prev, notion: e.target.value }))}
                      disabled={!profileEditMode} 
                      type="url" 
                      className="mt-1 w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Figma</label>
                    <input 
                      value={myProfileDraft.figma || ''} 
                      onChange={(e) => setMyProfileDraft(prev => ({ ...prev, figma: e.target.value }))}
                      disabled={!profileEditMode} 
                      type="url" 
                      className="mt-1 w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">카카오 ID</label>
                    <input 
                      value={myProfileDraft.kakao_id || ''} 
                      onChange={(e) => setMyProfileDraft(prev => ({ ...prev, kakao_id: e.target.value }))}
                      disabled={!profileEditMode} 
                      type="text" 
                      className="mt-1 w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">인스타그램 ID</label>
                    <input 
                      value={myProfileDraft.instagram_id || ''} 
                      onChange={(e) => setMyProfileDraft(prev => ({ ...prev, instagram_id: e.target.value }))}
                      disabled={!profileEditMode} 
                      type="text" 
                      className="mt-1 w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">MBTI</label>
                    <input 
                      value={myProfileDraft.mbti || ''} 
                      onChange={(e) => setMyProfileDraft(prev => ({ ...prev, mbti: e.target.value }))}
                      disabled={!profileEditMode} 
                      type="text" 
                      maxLength={4} 
                      className="mt-1 w-full border rounded px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">커피챗 활성화</label>
                    <select 
                      value={myProfileDraft.coffee_chat_enabled ? 'true' : 'false'} 
                      onChange={(e) => setMyProfileDraft(prev => ({ ...prev, coffee_chat_enabled: e.target.value === 'true' }))}
                      disabled={!profileEditMode} 
                      className="mt-1 w-full border rounded px-3 py-2"
                    >
                      <option value="true">활성화</option>
                      <option value="false">비활성화</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-600">자기소개</label>
                    <div className="mt-1">
                      <textarea
                        value={myProfileDraft.self_introduction || ''}
                        onChange={(e) => setMyProfileDraft(prev => ({ ...prev, self_introduction: e.target.value }))}
                        disabled={!profileEditMode}
                        rows={4}
                        maxLength={300}
                        className="w-full border rounded px-3 py-2"
                      />
                      <div className="text-right text-xs text-gray-500 mt-1">{selfIntroCount}/300</div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-600">추가 경력</label>
                    <div className="mt-1">
                      <textarea
                        value={myProfileDraft.additional_career || ''}
                        onChange={(e) => setMyProfileDraft(prev => ({ ...prev, additional_career: e.target.value }))}
                        disabled={!profileEditMode}
                        rows={4}
                        maxLength={300}
                        className="w-full border rounded px-3 py-2"
                      />
                      <div className="text-right text-xs text-gray-500 mt-1">{additionalCareerCount}/300</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
