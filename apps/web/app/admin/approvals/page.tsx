"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRequireAdmin } from '../../../src/hooks/useRequireAdmin';
import { getApi } from '../../../src/lib/apiClient';

export default function AdminApprovalsPage() {
  const { ready } = useRequireAdmin();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      const res = await getApi().admin.getPendingApprovals({ page, size });
      const list = (res.items ?? res.users ?? []) as any[];
      setItems(list);
      setTotal(res.total ?? list.length ?? 0);
    };
    run();
  }, [ready, page, size]);

  if (!ready) return null;
  return (
    <div style={{ padding: 24 }}>
      <h1>승인 대기 사용자</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((u) => (
          <div key={u.id ?? `${u.email}`} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{u.name ?? u.email}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{u.email}</div>
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


