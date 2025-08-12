"use client";
import Link from 'next/link';
import { useRequireAdmin } from '../../src/hooks/useRequireAdmin';

export default function AdminIndexPage() {
  const { ready } = useRequireAdmin();
  if (!ready) return null;
  return (
    <div style={{ padding: 24 }}>
      <h1>관리자</h1>
      <ul>
        <li><Link href="/admin/member">멤버 관리</Link></li>
        <li><Link href="/admin/project">프로젝트 관리</Link></li>
        <li><Link href="/admin/sponsorship">후원 관리</Link></li>
      </ul>
    </div>
  );
}


