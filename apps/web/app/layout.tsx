import React from 'react';
import ClientProviders from '../src/components/ClientProviders';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Note: hooks cannot be used in Server Components; we wrap children instead
  return (
    <html lang="ko">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

// No client hooks in server file

