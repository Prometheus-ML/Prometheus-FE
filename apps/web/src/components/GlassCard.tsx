import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  as?: 'div' | 'button' | 'a';
  disabled?: boolean;
}

/**
 * 반투명한 배경을 가진 재사용 가능한 카드 컴포넌트
 * 
 * @param children - 카드 내부 콘텐츠
 * @param className - 추가 CSS 클래스
 * @param onClick - 클릭 이벤트 핸들러
 * @param href - 링크 URL (Link 컴포넌트와 함께 사용)
 * @param as - 렌더링할 HTML 요소 타입
 */
export default function GlassCard({ 
  children, 
  className = '', 
  onClick,
  href,
  as = 'div',
  disabled = false
}: GlassCardProps) {
  const baseClasses = "bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-200 hover:bg-white/15 hover:border-white/30";
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
        type="button"
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
