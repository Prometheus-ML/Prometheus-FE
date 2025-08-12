"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRequireAdmin } from '../../../../src/hooks/useRequireAdmin';
import { getApi } from '../../../../src/lib/apiClient';

export default function AdminProjectDetailPage() {
  const { ready } = useRequireAdmin();
  const params = useParams<{ projectId: string }>();
  const projectId = params?.projectId!;
  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const p = await getApi().projects.get(projectId);
      setProject(p);
      setTitle(p.title ?? '');
      const ms = await getApi().projects.listMembers(projectId, { page: 1, size: 100 });
      setMembers(ms.members ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  const save = async () => {
    await getApi().projects.update(projectId, { title });
    await load();
  };
  const del = async () => {
    if (!confirm('삭제하시겠습니까?')) return;
    await getApi().projects.remove(projectId);
    history.back();
  };

  if (!ready) return null;
  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (!project) return <div style={{ padding: 24 }}>없음</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>프로젝트 상세</h1>
      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#666' }}>제목</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save}>저장</button>
          <button onClick={del}>삭제</button>
        </div>
      </div>
      <h2>멤버</h2>
      <ul>
        {members.map((m) => (
          <li key={`${m.project_id}-${m.member_id}`}>{m.member_id} · {m.role} · {m.contribution}</li>
        ))}
      </ul>
    </div>
  );
}


