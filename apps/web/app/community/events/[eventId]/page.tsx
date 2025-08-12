"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRequireAuth } from '../../../../src/hooks/useRequireAuth';
import { useApi } from '../../../../src/contexts/ApiProvider';

export default function EventDetailPage() {
  const { ready } = useRequireAuth();
  const { community } = useApi();
  const params = useParams<{ eventId: string }>();
  const id = params?.eventId;
  const [event, setEvent] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready || !id) return;
    const run = async () => {
      setLoading(true);
      try {
        const ev = await community.getEvent(id);
        const ms = await community.listMembers(id);
        setEvent(ev);
        setMembers(ms ?? []);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [ready, id]);

  const requestJoin = async () => {
    await community.requestJoin(id!);
    alert('참여 요청 보냈습니다');
  };

  if (!ready) return null;
  if (loading) return <div style={{ padding: 24 }}>불러오는 중...</div>;
  if (!event) return <div style={{ padding: 24 }}>없음</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>{event.name}</h1>
      <div style={{ color: '#666' }}>{event.description}</div>
      <div style={{ marginTop: 12 }}>
        <button onClick={requestJoin}>참여 요청</button>
      </div>
      <h2 style={{ marginTop: 24 }}>멤버</h2>
      <ul>
        {members.map((m) => (
          <li key={m.member_id}>{m.member_id} · {m.role} · {m.status}</li>
        ))}
      </ul>
    </div>
  );
}


