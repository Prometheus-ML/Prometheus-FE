"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRequireAdmin } from '../../../src/hooks/useRequireAdmin';
import { getApi } from '../../../src/lib/apiClient';

export default function AdminMemberPage() {
  const { ready } = useRequireAdmin();
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [filters, setFilters] = useState<any>({ search: '', grant_filter: '', gen_filter: '', status_filter: '' });
  const pages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);

  useEffect(() => {
    if (!ready) return;
    const run = async () => {
      const params: any = { page, size };
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) params[k] = v;
      });
      const res = await getApi().admin.getMembers(params);
      const members = (res.members ?? res.users ?? []);
      setList(members);
      setTotal(res.total ?? members.length ?? 0);
    };
    run();
  }, [ready, page, size, filters]);

  if (!ready) return null;
  return (
    <div style={{ padding: 24 }}>
      <h1>멤버 관리</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="검색" value={filters.search} onChange={(e) => setFilters((f: any) => ({ ...f, search: e.target.value }))} />
        <select value={filters.grant_filter} onChange={(e) => setFilters((f: any) => ({ ...f, grant_filter: e.target.value }))}>
          <option value="">권한 전체</option>
          <option value="Super">Super</option>
          <option value="Administrator">Administrator</option>
          <option value="Manager">Manager</option>
          <option value="Member">Member</option>
        </select>
        <select value={filters.gen_filter} onChange={(e) => setFilters((f: any) => ({ ...f, gen_filter: e.target.value }))}>
          <option value="">기수 전체</option>
          {Array.from({ length: 20 }).map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>{i + 1}기</option>
          ))}
        </select>
        <button onClick={() => setPage(1)}>검색</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {list.map((m) => (
          <div key={m.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{m.name}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{m.email}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{m.gen}기 · {m.school} {m.major}</div>
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


