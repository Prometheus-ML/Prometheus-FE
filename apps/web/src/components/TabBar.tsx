import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

/**
 * 탭 바 컴포넌트
 * 
 * @param tabs - 탭 아이템 배열
 * @param activeTab - 현재 활성화된 탭 ID
 * @param onTabChange - 탭 변경 핸들러
 * @param className - 추가 CSS 클래스
 */
export default function TabBar({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '' 
}: TabBarProps) {
  return (
    <div className={`border-b border-white/20 ${className}`}>
      <div className="flex w-full overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-shrink-0 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
