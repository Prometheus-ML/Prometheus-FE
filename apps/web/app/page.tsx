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
    <div className="min-h-screen bg-gray-50">
      {/* Personalized header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 m-0">
                안녕하세요{me?.name ? `, ${me.name}님!` : '!'}
              </h1>
              <p className="text-gray-600 mt-1">
                {me?.name ? `${me.name}님, 오늘도 좋은 하루 보내세요` : '로그인하시면 개인화된 정보를 볼 수 있어요'}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-2xl font-extrabold text-emerald-600">{85}%</div>
                <div className="text-xs text-gray-500">출석률</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-blue-600">{3}</div>
                <div className="text-xs text-gray-500">참여 프로젝트</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
              <div>
                <h3 className="m-0 text-lg font-bold text-gray-900">일정 관리</h3>
                <p className="m-0 mt-1 text-sm text-gray-600">다가오는 일정 확인</p>
              </div>
              <div className="ml-auto">
                <Link href="/schedules" className="text-blue-600 font-semibold text-sm">바로가기 →</Link>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">👥</span>
              </div>
              <div>
                <h3 className="m-0 text-lg font-bold text-gray-900">멤버</h3>
                <p className="m-0 mt-1 text-sm text-gray-600">멤버들과 소통</p>
              </div>
              <div className="ml-auto">
                <Link href="/members" className="text-green-600 font-semibold text-sm">바로가기 →</Link>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-violet-600 text-xl">🤝</span>
              </div>
              <div>
                <h3 className="m-0 text-lg font-bold text-gray-900">후원</h3>
                <p className="m-0 mt-1 text-sm text-gray-600">후원사 소개</p>
              </div>
              <div className="ml-auto">
                <Link href="/admin/sponsorship" className="text-violet-600 font-semibold text-sm">바로가기 →</Link>
              </div>
            </div>
          </div>

          {(me?.grant === 'Super' || me?.grant === 'Administrator' || me?.grant === 'Manager') && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">🛠️</span>
                </div>
                <div>
                  <h3 className="m-0 text-lg font-bold text-gray-900">관리자</h3>
                  <p className="m-0 mt-1 text-sm text-gray-600">시스템 관리</p>
                </div>
                <div className="ml-auto">
                  <Link href="/admin" className="text-red-600 font-semibold text-sm">바로가기 →</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommended content */}
        <div className="mt-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">추천 콘텐츠</h2>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((id) => (
              <div key={id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-3 gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">⭐</span>
                  </div>
                  <div>
                    <h3 className="m-0 text-base font-bold text-gray-900">콘텐츠 타이틀 {id}</h3>
                    <p className="m-0 text-xs text-gray-500">작성자</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-0 mb-3">간단한 설명 텍스트가 들어갑니다.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">2025-01-20</span>
                  <button className="text-blue-600 font-semibold text-sm">자세히 보기</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activities */}
        <div className="mt-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">최근 활동</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {[1, 2, 3].map((id) => (
              <div key={id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">⏰</span>
                </div>
                <div className="flex-1">
                  <p className="m-0 font-semibold text-gray-900">최근 활동 타이틀 {id}</p>
                  <p className="m-0 text-xs text-gray-500">2시간 전</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">출석</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA section */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl p-6 text-center">
            <h2 className="m-0 text-2xl md:text-3xl font-extrabold">프로메테우스와 함께</h2>
            <p className="mt-3 opacity-90">인공지능의 미래를 함께 만들어가는 동료들과 소통하세요</p>
            <div className="mt-4 flex gap-3 justify-center flex-wrap">
              <Link href="/members" className="bg-white text-blue-600 px-4 py-2.5 rounded-lg font-semibold">멤버 보기</Link>
              <Link href="/schedules" className="border-2 border-white text-white px-4 py-2.5 rounded-lg font-semibold">일정 확인</Link>
              {!isAuthenticated && (
                <Link href="/auth/login" className="bg-white text-violet-600 px-4 py-2.5 rounded-lg font-semibold">로그인</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

