'use client';

import { useState, useEffect } from 'react';
import { SearchMemberBar } from './SearchMemberBar';
import { MemberSummaryResponse } from '@prometheus-fe/types';

interface Member {
  id: string;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
}

interface AddMemberModalProps {
  show: boolean;
  mode: 'add' | 'edit';
  member?: Member | null;
  onClose: () => void;
  onSubmit: (member: any) => void;
}

export default function AddMemberModal({ show, mode, member, onClose, onSubmit }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    member_id: '',
    role: '',
    contribution: ''
  });
  const [selectedMember, setSelectedMember] = useState<MemberSummaryResponse | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id || '',
        member_id: member.member_id || '',
        role: member.role || '',
        contribution: member.contribution || ''
      });
    } else {
      setFormData({
        id: '',
        member_id: '',
        role: '',
        contribution: ''
      });
      setSelectedMember(null);
    }
  }, [member, show]);

  // 멤버 선택 핸들러
  const handleMemberSelect = (member: MemberSummaryResponse) => {
    setSelectedMember(member);
    setFormData(prev => ({ ...prev, member_id: member.id }));
  };

  // 멤버 선택 해제 핸들러
  const handleMemberDeselect = () => {
    setSelectedMember(null);
    setFormData(prev => ({ ...prev, member_id: '' }));
  };

  const handleSubmit = () => {
    if (!formData.member_id) {
      alert('멤버를 선택해주세요.');
      return;
    }

    const payload = {
      id: formData.id || undefined,
      member_id: formData.member_id,
      role: formData.role || undefined,
      contribution: formData.contribution || undefined
    };
    onSubmit(payload);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? '멤버 추가' : '멤버 수정'}
          </h2>
          <button className="text-gray-500" onClick={onClose}>
            닫기
          </button>
        </div>
        <div className="space-y-3">
          {/* 멤버 검색 및 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              멤버 선택
            </label>
            <SearchMemberBar
              onMemberSelect={handleMemberSelect}
              onMemberDeselect={handleMemberDeselect}
              placeholder="멤버 이름으로 검색하세요..."
              showSelectedMember={true}
              className="w-full"
            />
          </div>
          
          <input
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="역할 (예: 리더/팀원)"
          />
          <input
            value={formData.contribution}
            onChange={(e) => setFormData(prev => ({ ...prev, contribution: e.target.value }))}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="기여 (100자 이내)"
          />
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            className="px-3 py-2 rounded-md border hover:bg-gray-50"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className={`px-3 py-2 rounded-md text-white ${
              formData.member_id 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={!formData.member_id}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
