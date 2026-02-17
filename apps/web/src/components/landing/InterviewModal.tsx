'use client';

import { useEffect, useState } from 'react';
import { LandingInterviewCreateRequest, MemberSummaryResponse } from '@prometheus-fe/types';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import { MemberSelector } from '@/src/components/member/SearchMemberBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import Portal from '@/src/components/Portal';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LandingInterviewCreateRequest) => void;
}

export default function InterviewModal({ isOpen, onClose, onSubmit }: InterviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberSummaryResponse | null>(null);

  const [form, setForm] = useState<LandingInterviewCreateRequest>({
    member_id: '',
    gen: 0,
    content: ''
  });

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setForm({
        member_id: '',
        gen: 0,
        content: ''
      });
      setSelectedMember(null);
    }
  }, [isOpen]);

  // 선택된 멤버가 변경될 때 폼 업데이트
  useEffect(() => {
    if (selectedMember) {
      setForm(prev => ({
        ...prev,
        member_id: selectedMember.id,
        gen: selectedMember.gen || 0
      }));
    }
  }, [selectedMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) {
      alert('멤버를 선택해주세요.');
      return;
    }

    if (form.gen < 0) {
      alert('유효한 기수를 입력해주세요.');
      return;
    }

    if (!form.content.trim()) {
      alert('인터뷰 내용을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (error) {
      console.error('인터뷰 저장 실패:', error);
      alert('인터뷰 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            인터뷰 추가
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 멤버 검색 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              멤버 선택 *
            </label>
            <MemberSelector
              onMemberSelect={(member) => setSelectedMember(member)}
              onMemberDeselect={() => setSelectedMember(null)}
              placeholder="인터뷰할 멤버를 검색하세요..."
              showSelectedMember={true}
            />
          </div>

          {/* 기수 (수정 가능) */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              활동 기수 *
            </label>
            <input
              type="number"
              value={form.gen}
              onChange={(e) => setForm(prev => ({ ...prev, gen: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="활동한 기수를 입력하세요 (예: 12)"
              min="0"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              * 멤버 선택 시 자동으로 설정되며, 필요시 수정 가능합니다.
            </p>
          </div>

          {/* 인터뷰 내용 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              인터뷰 내용 *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              rows={6}
              className="w-full bg-white/20 text-black border border-white/30 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="인터뷰 내용을 입력하세요"
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              취소
            </button>
            <RedButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '추가'}
            </RedButton>
          </div>
        </form>
      </GlassCard>
    </div>
    </Portal>
  );
}
