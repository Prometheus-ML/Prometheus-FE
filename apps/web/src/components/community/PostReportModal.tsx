'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faTimes } from '@fortawesome/free-solid-svg-icons';
import Portal from '@/src/components/Portal';
import type { PostReportReason } from '@prometheus-fe/types';

const REPORT_REASONS: { value: PostReportReason; label: string; description: string }[] = [
  { value: 'spam', label: '스팸/홍보', description: '반복적인 광고, 도배성 글' },
  { value: 'abuse', label: '욕설/혐오 표현', description: '타인 비방, 혐오 조장' },
  { value: 'misinformation', label: '허위 정보', description: '사실과 다른 정보 유포' },
  { value: 'illegal', label: '불법/위험 행위', description: '법령 위반 또는 위험 조장' },
  { value: 'inappropriate', label: '부적절한 콘텐츠', description: '커뮤니티 가이드 위반' },
  { value: 'other', label: '기타', description: '기타 신고 사유' },
];

export interface PostReportPayload {
  reason: PostReportReason;
  description?: string;
}

interface PostReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: PostReportPayload) => Promise<void>;
  postTitle?: string;
  isSubmitting?: boolean;
}

export default function PostReportModal({
  isOpen,
  onClose,
  onSubmit,
  postTitle,
  isSubmitting = false,
}: PostReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<PostReportReason>('spam');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedReason('spam');
      setDetails('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isSubmitting) return;

    try {
      setError('');
      setSubmitting(true);
      await onSubmit({
        reason: selectedReason,
        description: details.trim() ? details.trim() : undefined,
      });
    } catch (err: any) {
      setError(
        err?.message ||
          err?.data?.detail ||
          '신고 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#0b0b0f] p-6 text-white shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/20">
                <FontAwesomeIcon icon={faFlag} className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-300">커뮤니티 신고</p>
                <h3 className="font-semibold">{postTitle || '게시글'}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              aria-label="신고 모달 닫기"
            >
              <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-medium text-gray-300">신고 사유를 선택해주세요</p>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => setSelectedReason(reason.value)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selectedReason === reason.value
                        ? 'border-red-500 bg-red-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-gray-200 hover:border-white/30'
                    }`}
                  >
                    <p className="text-sm font-semibold">{reason.label}</p>
                    <p className="text-xs text-gray-400">{reason.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                상세 내용 (선택)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="신고 사유를 자세히 적어주시면 더 빠르게 확인할 수 있어요."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              />
              <p className="mt-1 text-right text-xs text-gray-500">{details.length}/1000</p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-gray-300 transition hover:border-white/30 hover:text-white"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || isSubmitting}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-600/70"
              >
                {submitting || isSubmitting ? '제출 중...' : '신고하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

