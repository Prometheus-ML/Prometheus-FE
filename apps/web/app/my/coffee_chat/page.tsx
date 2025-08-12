"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRequireAuth } from '../../../src/hooks/useRequireAuth';
import { useApi } from '../../../src/contexts/ApiProvider';

export default function CoffeeChatPage() {
  const { ready } = useRequireAuth();
  const { coffeeChat } = useApi();
  const [tab, setTab] = useState<'available' | 'sent' | 'received'>('available');

  // available users
  const [available, setAvailable] = useState<any[]>([]);
  const [aTotal, setATotal] = useState(0);
  const [aPage, setAPage] = useState(1);
  const [aSize] = useState(12);
  const [aSearch, setASearch] = useState('');
  const [aGen, setAGen] = useState('');
  const aPages = useMemo(() => Math.max(1, Math.ceil(aTotal / aSize)), [aTotal, aSize]);

  // sent / received
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [sentStatus, setSentStatus] = useState('');
  const [receivedStatus, setReceivedStatus] = useState('');

  useEffect(() => {
    if (!ready) return;
    const loadAvailable = async () => {
      const params: any = { page: aPage, size: aSize };
      if (aSearch) params.search = aSearch;
      if (aGen) params.gen_filter = Number(aGen);
      const res = await coffeeChat.getAvailableUsers(params);
      setAvailable(res.users ?? []);
      setATotal(res.total ?? 0);
    };
    loadAvailable();
  }, [ready, aPage, aSize, aSearch, aGen]);

  const loadSent = async () => {
    const params: any = { page: 1, size: 20 };
    if (sentStatus) params.status_filter = sentStatus;
    const res = await coffeeChat.getSentRequests(params);
    setSent(res.requests ?? []);
  };
  const loadReceived = async () => {
    const params: any = { page: 1, size: 20 };
    if (receivedStatus) params.status_filter = receivedStatus;
    const res = await coffeeChat.getReceivedRequests(params);
    setReceived(res.requests ?? []);
  };
  useEffect(() => {
    if (!ready) return;
    loadSent();
    loadReceived();
  }, [ready, sentStatus, receivedStatus]);

  const request = async (u: any) => {
    await coffeeChat.createRequest({ recipient_id: u.id });
    alert('요청 보냈습니다');
    loadSent();
  };

  const respond = async (r: any, status: 'accepted' | 'rejected') => {
    await coffeeChat.respondRequest(r.id, { status });
    await loadReceived();
  };

  if (!ready) return null;

  return (
    <div style={{ padding: 24 }}>
      <h1>커피챗</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setTab('available')} disabled={tab === 'available'}>가능 사용자</button>
        <button onClick={() => setTab('sent')} disabled={tab === 'sent'}>보낸 요청</button>
        <button onClick={() => setTab('received')} disabled={tab === 'received'}>받은 요청</button>
      </div>
      {tab === 'available' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input placeholder="검색" value={aSearch} onChange={(e) => setASearch(e.target.value)} />
            <select value={aGen} onChange={(e) => setAGen(e.target.value)}>
              <option value="">기수 전체</option>
              {Array.from({ length: 20 }).map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {i + 1}기
                </option>
              ))}
            </select>
            <button onClick={() => setAPage(1)}>검색</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {available.map((u) => (
              <div key={u.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ color: '#666', fontSize: 12 }}>{u.school} {u.major}</div>
                <div style={{ marginLeft: 'auto' }}>
                  <button onClick={() => request(u)}>요청</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
            <button onClick={() => setAPage((p) => Math.max(1, p - 1))} disabled={aPage === 1}>이전</button>
            <span>{aPage} / {aPages}</span>
            <button onClick={() => setAPage((p) => Math.min(aPages, p + 1))} disabled={aPage === aPages}>다음</button>
          </div>
        </div>
      )}
      {tab === 'sent' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <select value={sentStatus} onChange={(e) => setSentStatus(e.target.value)}>
              <option value="">전체</option>
              <option value="pending">대기</option>
              <option value="accepted">수락</option>
              <option value="rejected">거절</option>
            </select>
            <button onClick={loadSent}>조회</button>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {sent.map((r) => (
              <div key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 600 }}>{r.recipient_name}</div>
                <div style={{ color: '#666', fontSize: 12 }}>상태: {r.status}</div>
                <div style={{ color: '#666', fontSize: 12 }}>메시지: {r.message || '없음'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'received' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <select value={receivedStatus} onChange={(e) => setReceivedStatus(e.target.value)}>
              <option value="">전체</option>
              <option value="pending">대기</option>
              <option value="accepted">수락</option>
              <option value="rejected">거절</option>
            </select>
            <button onClick={loadReceived}>조회</button>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {received.map((r) => (
              <div key={r.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>{r.requester_name}</div>
                <div style={{ color: '#666', fontSize: 12 }}>상태: {r.status}</div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button onClick={() => respond(r, 'accepted')}>수락</button>
                  <button onClick={() => respond(r, 'rejected')}>거절</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


