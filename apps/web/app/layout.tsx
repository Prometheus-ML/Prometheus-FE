import React from 'react';
import { AppProviders } from '../src/context/AppProviders';
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
          
          {/* Main Content Container */}
          <div className="md:max-w-4xl max-w-lg mx-auto relative z-10">
            <AppProviders>{children}</AppProviders>
          </div>
        </div>
      </body>
    </html>
  );
}
