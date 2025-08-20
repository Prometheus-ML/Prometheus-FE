'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faRotateLeft 
} from '@fortawesome/free-solid-svg-icons';

// TabBar 컴포넌트
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

const TabBar: React.FC<TabBarProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '' 
}) => {
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
};

// QueryBar 메인 컴포넌트
interface QueryBarProps {
  // 검색어
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  
  // 탭 필터링
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  
  // select 옵션들
  selects: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
  }[];
  
  // 버튼 핸들러
  onSearch?: () => void;
  onReset?: () => void;
  
  // 로딩 상태
  isLoading?: boolean;
  
  // 기타 props
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const QueryBar: React.FC<QueryBarProps> = ({
  searchTerm,
  onSearchTermChange,
  tabs,
  activeTab,
  onTabChange,
  selects,
  onSearch,
  onReset,
  isLoading = false,
  className = "",
  placeholder = "검색어를 입력하세요",
  disabled = false,
}) => {
  // 검색어 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(e.target.value);
  };

  // 엔터키 핸들러
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.();
    }
  };

  // 초기화 핸들러
  const handleReset = () => {
    onSearchTermChange('');
    selects.forEach(select => {
      select.onChange('all');
    });
    if (tabs && onTabChange) {
      onTabChange(tabs[0]?.id || '');
    }
    onReset?.();
  };

  // 탭 변경 핸들러 (기존 필터에 추가하고 바로 검색 실행)
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    // 탭 변경 시 바로 검색 실행
    if (onSearch) {
      onSearch();
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    onSearch?.();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 탭 필터링 (최상단) */}
      {tabs && activeTab && onTabChange && (
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mb-4"
        />
      )}

      {/* 검색 입력창 (윗줄) */}
      <div className="relative">
        <FontAwesomeIcon 
          icon={faSearch} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e0e0e0] w-4 h-4" 
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full border border-[#404040] rounded-md px-10 py-3 bg-[#1A1A1A] text-[#FFFFFF] placeholder-[#e0e0e0] focus:border-[#c2402a] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Select 필터들과 버튼들 (아랫줄) */}
      <div className="grid grid-cols-12 gap-3">
        {/* Select 필터들 */}
        <div className={`${selects.length > 0 ? 'col-span-10' : 'col-span-10'} flex gap-3`}>
          {selects.map((select, index) => (
            <select
              key={select.id}
              value={select.value}
              onChange={(e) => select.onChange(e.target.value)}
              disabled={disabled}
              className="flex-1 border border-[#404040] rounded-md px-3 py-2 bg-[#1A1A1A] text-[#FFFFFF] focus:border-[#c2402a] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {select.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>

        {/* 검색 버튼과 초기화 버튼 (2개 열로 배치) */}
        <div className="col-span-2 flex gap-2">
          <button
            onClick={handleSearch}
            disabled={disabled || isLoading}
            className="flex-1 inline-flex items-center justify-center px-2 py-2 border border-transparent rounded-md bg-[#c2402a] text-white hover:bg-[#a03020] focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="검색"
          >
            {!isLoading && <FontAwesomeIcon icon={faSearch} className="w-3 h-3" />}
          </button>
          <button
            onClick={handleReset}
            disabled={disabled}
            className="flex-1 inline-flex items-center justify-center px-2 py-2 border border-[#404040] rounded-md bg-[#1A1A1A] text-[#e0e0e0] hover:bg-[#2A2A2A] hover:border-[#c2402a] focus:outline-none focus:ring-2 focus:ring-[#c2402a] focus:ring-offset-2 focus:ring-offset-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="초기화"
          >
            {!isLoading && <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 로딩 상태 표시 (검색바 아래) */}
      {isLoading && (
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded animate-pulse"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-white/10 rounded animate-pulse w-1/2"></div>
        </div>
      )}
    </div>
  );
};

// TabBar export 추가
export { TabBar };

// 기본 export
export default QueryBar;
