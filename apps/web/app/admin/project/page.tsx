"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRequireAdmin } from '../../../src/hooks/useRequireAdmin';
import { getApi } from '../../../src/lib/apiClient';

export default function AdminProjectPage() {
  const { ready } = useRequireAdmin();
  const [projects, setProjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      const res = await getApi().projects.list({ page, size });
      setProjects(res.projects ?? []);
      setTotal(res.total ?? 0);
    };
    run();
  }, [ready, page, size]);

  if (!ready) return null;
  return (
    <div style={{ padding: 24 }}>
      <h1>프로젝트 관리</h1>
      <div style={{ display: 'grid', gap: 8 }}>
        {projects.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{p.title}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{p.description}</div>
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


