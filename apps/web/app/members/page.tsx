"use client";
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../../src/contexts/ApiProvider';
import { useAuthStore } from '@prometheus-fe/store';

type UserBrief = any;

export default function MembersPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const [users, setUsers] = useState<UserBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [search, setSearch] = useState('');
  const [grant, setGrant] = useState('');
  const [gen, setGen] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / size)), [total, size]);
  const { user } = useApi();

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = { page, size };
        if (search) params.search = search;
        if (grant) params.grant = grant;
        if (gen) params.gen = Number(gen);
        const res = isAuthenticated
          ? await user.listPrivate(params)
          : await user.listPublic(params);
        setUsers(res.users ?? []);
        setTotal(res.total ?? (res.users?.length ?? 0));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isAuthenticated, page, size, search, grant, gen]);

  return (
    <div style={{ padding: 24 }}>
      <h1>멤버</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="검색" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={grant} onChange={(e) => setGrant(e.target.value)}>
          <option value="">권한 전체</option>
          <option value="Super">Super</option>
          <option value="Administrator">Administrator</option>
          <option value="Manager">Manager</option>
          <option value="Member">Member</option>
        </select>
        <select value={gen} onChange={(e) => setGen(e.target.value)}>
          <option value="">기수 전체</option>
          {Array.from({ length: 20 }).map((_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {i + 1}기
            </option>
          ))}
        </select>
        <button onClick={() => setPage(1)}>검색</button>
      </div>
      {loading ? (
        <div>불러오는 중...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {users.map((u: any) => (
            <div key={u.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{u.school} {u.major}</div>
              {isAuthenticated && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#444' }}>{(u.history ?? []).join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          이전
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          다음
        </button>
      </div>
    </div>
  );
}


