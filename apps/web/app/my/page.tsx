"use client";
import { useEffect, useRef, useState } from 'react';
import { useRequireAuth } from '../../src/hooks/useRequireAuth';
import { useApi } from '../../src/contexts/ApiProvider';
import Image from 'next/image';

export default function MyPage() {
  const { ready } = useRequireAuth();
  const { auth, storage, user } = useApi();
  const [profile, setProfile] = useState<any>(null);
  const [draft, setDraft] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      const me = await auth.me();
      setProfile(me);
      setDraft({
        github: me.github ?? '',
        notion: me.notion ?? '',
        figma: me.figma ?? '',
        kakao_id: me.kakao_id ?? '',
        instagram_id: me.instagram_id ?? '',
        mbti: me.mbti ?? '',
        coffee_chat_enabled: !!me.coffee_chat_enabled,
        self_introduction: me.self_introduction ?? '',
        additional_career: me.additional_career ?? '',
        profile_image_url: me.profile_image_url ?? '',
      });
    };
    run();
  }, [ready]);

  const onChange = (key: string, value: any) => setDraft((d: any) => ({ ...d, [key]: value }));

  const uploadImage = async (file: File) => {
    const res: any = await storage.upload(file, 'member');
    return res.publicCdnUrl || res.publicEmbedUrl || res.publicEmbedUrlAlt || '';
  };

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      await user.updateMe(draft);
      const me = await auth.me();
      setProfile(me);
      alert('저장되었습니다');
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return null;
  if (!profile) return <div style={{ padding: 24 }}>불러오는 중...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>내 정보</h1>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
        <Image
          alt="profile"
          src={draft.profile_image_url || '/default-avatar.png'}
          style={{ width: 80, height: 80, borderRadius: 40, objectFit: 'cover', border: '1px solid #ddd' }}
        />
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              const url = await uploadImage(f);
              onChange('profile_image_url', url);
              if (fileRef.current) fileRef.current.value = '';
            }
          }} />
        <button onClick={() => fileRef.current?.click()} disabled={submitting}>이미지 변경</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <L label="GitHub"><input value={draft.github} onChange={(e) => onChange('github', e.target.value)} /></L>
        <L label="Notion"><input value={draft.notion} onChange={(e) => onChange('notion', e.target.value)} /></L>
        <L label="Figma"><input value={draft.figma} onChange={(e) => onChange('figma', e.target.value)} /></L>
        <L label="카카오 ID"><input value={draft.kakao_id} onChange={(e) => onChange('kakao_id', e.target.value)} /></L>
        <L label="인스타그램 ID"><input value={draft.instagram_id} onChange={(e) => onChange('instagram_id', e.target.value)} /></L>
        <L label="MBTI"><input maxLength={4} value={draft.mbti} onChange={(e) => onChange('mbti', e.target.value)} /></L>
        <L label="커피챗 활성화"><select value={String(draft.coffee_chat_enabled)} onChange={(e) => onChange('coffee_chat_enabled', e.target.value === 'true')}><option value="true">활성화</option><option value="false">비활성화</option></select></L>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ marginBottom: 6, fontSize: 12, color: '#666' }}>자기소개</div>
          <textarea rows={4} value={draft.self_introduction} onChange={(e) => onChange('self_introduction', e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ marginBottom: 6, fontSize: 12, color: '#666' }}>추가 경력</div>
          <textarea rows={4} value={draft.additional_career} onChange={(e) => onChange('additional_career', e.target.value)} style={{ width: '100%' }} />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={onSubmit} disabled={submitting}>{submitting ? '저장 중...' : '저장'}</button>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, color: '#666' }}>{label}</span>
      {children}
    </label>
  );
}


