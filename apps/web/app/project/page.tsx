"use client";
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../../src/contexts/ApiProvider';

export default function ProjectPage() {
  const { projects: projectsApi } = useApi();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await projectsApi.list({ page, size });
        setItems(res.projects ?? []);
        setTotal(res.total ?? (res.projects?.length ?? 0));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [projectsApi, page, size]);

  return (
    <div style={{ padding: 24 }}>
      <h1>프로젝트</h1>
      {loading ? (
        <div>불러오는 중...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {items.map((p: any) => (
            <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'grid', gap: 6 }}>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              {p.description ? (
                <div style={{ color: '#666', fontSize: 12 }}>{p.description}</div>
              ) : null}
              <div style={{ fontSize: 12, color: '#444' }}>
                <span>상태: {p.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#777' }}>
                <span>
                  {p.start_date}
                  {p.end_date ? ` ~ ${p.end_date}` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {p.github_url ? (
                  <a href={p.github_url} target="_blank" rel="noreferrer">GitHub</a>
                ) : null}
                {p.demo_url ? (
                  <a href={p.demo_url} target="_blank" rel="noreferrer">Demo</a>
                ) : null}
                {p.panel_url ? (
                  <a href={p.panel_url} target="_blank" rel="noreferrer">Panel</a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>이전</button>
        <span>{page} / {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>다음</button>
      </div>
    </div>
  );
}



