import React from 'react';
import { AppProviders } from '../src/context/AppProviders';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Note: hooks cannot be used in Server Components; we wrap children instead
  return (
    <html lang="ko">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
