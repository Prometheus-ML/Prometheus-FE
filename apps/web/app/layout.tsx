import React from 'react';
import { useAuthHydration } from '../src/hooks/useAuthHydration';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Note: hooks cannot be used in Server Components; we wrap children instead
  return (
    <html lang="ko">
      <body>
        <ClientAuthHydrator>{children}</ClientAuthHydrator>
      </body>
    </html>
  );
}

function ClientAuthHydrator({ children }: { children: React.ReactNode }) {
  useAuthHydration();
  return <>{children}</>;
}

