"use client";
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useRequireAdmin } from '../../../src/hooks/useRequireAdmin';
import { useApi } from '../../../src/contexts/ApiProvider';

export default function EventPage() {
  const { ready } = useRequireAdmin(); // 출석은 Manager 이상 API라 관리자 가드 사용
  const { schedules } = useApi();
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId!;
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status_filter = statusFilter;
      const res = await schedules.listAttendance(eventId, params);
      setItems(res.attendances ?? []);
      setTotal(res.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready, statusFilter]);

  const [newMemberId, setNewMemberId] = useState('');
  const [newStatus, setNewStatus] = useState('present');
  const create = async () => {
    await schedules.createAttendance(eventId, { member_id: newMemberId, status: newStatus });
    setNewMemberId('');
    setNewStatus('present');
    await load();
  };

  const update = async (attendanceId: any, status: string) => {
    await schedules.updateAttendance(eventId, attendanceId, { status });
    await load();
  };
  const remove = async (attendanceId: any) => {
    await schedules.deleteAttendance(eventId, attendanceId);
    await load();
  };

  if (!ready) return null;
  return (
    <div style={{ padding: 24 }}>
      <h1>출석 관리</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">전체</option>
          <option value="present">출석</option>
          <option value="absent">결석</option>
          <option value="late">지각</option>
        </select>
        <button onClick={load}>조회</button>
      </div>
      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="member_id" value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} />
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            <option value="present">출석</option>
            <option value="absent">결석</option>
            <option value="late">지각</option>
          </select>
          <button onClick={create}>추가</button>
        </div>
      </div>
      {loading ? (
        <div>불러오는 중...</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {items.map((a) => (
            <div key={a.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>{a.member_id}</div>
              <div>{a.status}</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button onClick={() => update(a.id, 'present')}>출석</button>
                <button onClick={() => update(a.id, 'absent')}>결석</button>
                <button onClick={() => update(a.id, 'late')}>지각</button>
                <button onClick={() => remove(a.id)}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


