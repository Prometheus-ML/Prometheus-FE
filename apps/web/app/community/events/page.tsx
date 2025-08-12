"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRequireAuth } from '../../../src/hooks/useRequireAuth';
import { useApi } from '../../../src/contexts/ApiProvider';

export default function EventsPage() {
  const { ready } = useRequireAuth();
  const { community } = useApi();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(12);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  const [form, setForm] = useState({ name: '', description: '', visibility: 'private' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      const res = await community.listEvents({ page, size });
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
    };
    run();
  }, [ready, page, size]);

  const createEvent = async () => {
    if (!form.name.trim()) return;
    try {
      setCreating(true);
      await community.createEvent({ ...form });
      setForm({ name: '', description: '', visibility: 'private' });
      const res = await community.listEvents({ page: 1, size });
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
      setPage(1);
    } finally {
      setCreating(false);
    }
  };

  if (!ready) return null;
  return (
    <div style={{ padding: 24 }}>
      <h1>커뮤니티 이벤트</h1>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="이벤트명" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <select value={form.visibility} onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}>
            <option value="private">비공개</option>
            <option value="public">공개</option>
          </select>
        </div>
        <textarea placeholder="설명" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <div>
          <button onClick={createEvent} disabled={creating}>{creating ? '생성 중...' : '이벤트 생성'}</button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((ev) => (
          <div key={ev.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{ev.name}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{ev.description}</div>
            </div>
            <Link href={`/community/events/${ev.id}`}>상세</Link>
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


