'use client';

export default function SponsorshipPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">스폰서십 관리</h1>
        <p className="text-gray-600">프로메테우스 스폰서십 현황을 관리합니다</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">스폰서십 관리</h3>
          <p className="text-gray-600 mb-4">스폰서십 관리 기능이 준비 중입니다.</p>
          <div className="text-sm text-gray-500">
            <p>• 스폰서 등록 및 관리</p>
            <p>• 스폰서십 계약 현황</p>
            <p>• 후원금 관리</p>
            <p>• 스폰서 이벤트 관리</p>
          </div>
        </div>
      </div>
    </div>
  );
}
