import React from 'react';

interface RedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  href?: string;
  as?: 'button' | 'a';
}

/**
 * 빨간색 그라데이션 스타일의 재사용 가능한 버튼 컴포넌트
 * 
 * @param children - 버튼 내부 콘텐츠
 * @param onClick - 클릭 이벤트 핸들러
 * @param type - 버튼 타입 (button, submit, reset)
 * @param disabled - 비활성화 상태
 * @param className - 추가 CSS 클래스
 * @param href - 링크 URL (Link 컴포넌트와 함께 사용)
 * @param as - 렌더링할 HTML 요소 타입
 */
export default function RedButton({ 
  children, 
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  href,
  as = 'button'
}: RedButtonProps) {
  const baseClasses = "px-4 py-2 rounded-md bg-gradient-to-r from-red-800 to-red-600 text-white border-red-700 shadow-lg hover:from-red-700 hover:to-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed";
  const combinedClasses = `${baseClasses} ${className}`.trim();

  if (href) {
    return (
      <a 
        href={href}
        className={combinedClasses}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  if (as === 'button') {
    return (
      <button 
        className={combinedClasses}
        onClick={onClick}
        type={type}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <div 
      className={combinedClasses}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
