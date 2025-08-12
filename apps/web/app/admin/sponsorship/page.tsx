"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRequireAdmin } from '../../../src/hooks/useRequireAdmin';
import { useApi } from '../../../src/contexts/ApiProvider';

export default function AdminSponsorshipPage() {
  const { ready } = useRequireAdmin();
  const { sponsorship } = useApi();
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [isActive, setIsActive] = useState('');
  const pages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      const params: any = { page, size };
      if (isActive) params.is_active = isActive === 'true';
      const res = await sponsorship.getSponsors(params);
      setList(res.sponsors ?? []);
      setTotal(res.total ?? 0);
    };
    run();
  }, [ready, page, size, isActive]);

  if (!ready) return null;
  return (
    <div style={{ padding: 24 }}>
      <h1>후원 관리</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select value={isActive} onChange={(e) => setIsActive(e.target.value)}>
          <option value="">전체</option>
          <option value="true">활성</option>
          <option value="false">비활성</option>
        </select>
        <button onClick={() => setPage(1)}>조회</button>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {list.map((s) => (
          <div key={s.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontWeight: 600 }}>{s.name}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{s.description}</div>
            <div style={{ marginLeft: 'auto', color: '#666', fontSize: 12 }}>{s.is_active ? '활성' : '비활성'}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>이전</button>
        <span>{page} / {pages}</span>
        <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>다음</button>
      </div>
    </div>
  );
}


