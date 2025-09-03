import React from 'react';
import { AppProviders } from '../src/context/AppProviders';
import Navigation from '../src/components/Navigation';
import ChatToggleWrapper from '../src/components/ChatToggleWrapper';
import './globals.css';

export const metadata = {
  title: '대학생 인공지능 단체 프로메테우스',
  description: '대학생 인공지능 단체 프로메테우스',
  icons: {
    icon: '/icons/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Note: hooks cannot be used in Server Components; we wrap children instead
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icons/favicon.ico" />
      </head>
      <body>
        <div className="min-h-screen relative">
          {/* Prometheus Background */}
          <div className="prometheus-bg"></div>
          
          {/* AppProviders로 전체 앱을 감싸기 */}
          <AppProviders>
            {/* Navigation */}
            <Navigation />
            
            {/* Main Content Container */}
            <div className="relative z-10 pt-16">
              {children}
            </div>
            
            {/* Chat Toggle */}
            <ChatToggleWrapper />
          </AppProviders>
        </div>
      </body>
    </html>
  );
}
