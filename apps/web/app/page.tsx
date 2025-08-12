"use client";
import { useEffect, useState } from 'react';
import { useApi } from '../src/contexts/ApiProvider';
import { useAuthStore } from '@prometheus-fe/store';
import Link from 'next/link';

export default function Page() {
  const isAuthenticated = useAuthStore((s: any) => s.isAuthenticated());
  const [me, setMe] = useState<any>(null);
  const { auth } = useApi();

  useEffect(() => {
    if (!isAuthenticated) return;
    auth
      .me()
      .then(setMe)
      .catch(() => setMe(null));
  }, [isAuthenticated]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Personalized header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>
                안녕하세요{me?.name ? `, ${me.name}님!` : '!'}
              </h1>
              <p style={{ color: '#4b5563', marginTop: 6 }}>
                {me?.name ? `${me.name}님, 오늘도 좋은 하루 보내세요` : '로그인하시면 개인화된 정보를 볼 수 있어요'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{85}%</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>출석률</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>{3}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>참여 프로젝트</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 16px' }}>
        {/* Quick actions */}
        <div
          style={{
            display: 'grid',
            gap: 24,
            gridTemplateColumns: 'repeat(1, minmax(0,1fr))',
          }}
        >
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: '#dbeafe', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#2563eb', fontSize: 20 }}>📅</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>일정 관리</h3>
                <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: '#6b7280' }}>다가오는 일정 확인</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Link href="/schedules" style={{ color: '#2563eb', fontWeight: 600, fontSize: 14 }}>바로가기 →</Link>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: '#dcfce7', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#16a34a', fontSize: 20 }}>👥</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>멤버</h3>
                <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: '#6b7280' }}>멤버들과 소통</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Link href="/members" style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>바로가기 →</Link>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: '#ede9fe', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#7c3aed', fontSize: 20 }}>🤝</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>후원</h3>
                <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: '#6b7280' }}>후원사 소개</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Link href="/admin/sponsorship" style={{ color: '#7c3aed', fontWeight: 600, fontSize: 14 }}>바로가기 →</Link>
              </div>
            </div>
          </div>

          {(me?.grant === 'Super' || me?.grant === 'Administrator' || me?.grant === 'Manager') && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: '#fee2e2', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#dc2626', fontSize: 20 }}>🛠️</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>관리자</h3>
                  <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: '#6b7280' }}>시스템 관리</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <Link href="/admin" style={{ color: '#dc2626', fontWeight: 600, fontSize: 14 }}>바로가기 →</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommended content */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 16 }}>추천 콘텐츠</h2>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(1, minmax(0,1fr))' }}>
            {[1, 2, 3].map((id) => (
              <div key={id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: '#dbeafe', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#2563eb' }}>⭐</span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>콘텐츠 타이틀 {id}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>작성자</p>
                  </div>
                </div>
                <p style={{ color: '#4b5563', fontSize: 14, marginTop: 0, marginBottom: 12 }}>간단한 설명 텍스트가 들어갑니다.</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>2025-01-20</span>
                  <button style={{ color: '#2563eb', fontWeight: 600, fontSize: 14 }}>자세히 보기</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activities */}
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 16 }}>최근 활동</h2>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
            {[1, 2, 3].map((id) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, background: '#f9fafb', borderRadius: 8, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, background: '#dbeafe', borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#2563eb', fontSize: 14 }}>⏰</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>최근 활동 타이틀 {id}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>2시간 전</p>
                </div>
                <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 9999, background: '#dcfce7', color: '#166534' }}>출석</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA section */}
        <div style={{ marginTop: 32 }}>
          <div style={{ background: 'linear-gradient(90deg, #2563eb, #7c3aed)', color: 'white', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>프로메테우스와 함께</h2>
            <p style={{ marginTop: 12, opacity: 0.9 }}>인공지능의 미래를 함께 만들어가는 동료들과 소통하세요</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/members" style={{ background: 'white', color: '#2563eb', padding: '10px 16px', borderRadius: 8, fontWeight: 600 }}>멤버 보기</Link>
              <Link href="/schedules" style={{ border: '2px solid white', color: 'white', padding: '10px 16px', borderRadius: 8, fontWeight: 600 }}>일정 확인</Link>
              {!isAuthenticated && (
                <Link href="/auth/login" style={{ background: 'white', color: '#7c3aed', padding: '10px 16px', borderRadius: 8, fontWeight: 600 }}>로그인</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

