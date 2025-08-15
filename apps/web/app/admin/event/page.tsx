'use client';

export default function EventPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">이벤트 관리</h1>
        <p className="text-gray-600">프로메테우스 이벤트를 관리합니다</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">이벤트 관리</h3>
          <p className="text-gray-600 mb-4">이벤트 관리 기능이 준비 중입니다.</p>
          <div className="text-sm text-gray-500">
            <p>• 이벤트 등록 및 수정</p>
            <p>• 참가자 관리</p>
            <p>• 일정 관리</p>
            <p>• 이벤트 통계</p>
          </div>
        </div>
      </div>
    </div>
  );
}
