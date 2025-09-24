'use client';

import { useState } from 'react';
import { LandingHistory } from '@prometheus-fe/types';
import { useLanding } from '@prometheus-fe/hooks';
import GlassCard from '@/src/components/GlassCard';

interface HistoryTabProps {
  isLoading: boolean;
  histories: LandingHistory[];
  onRefresh: () => Promise<void>;
}

export default function HistoryTab({ isLoading, histories, onRefresh }: HistoryTabProps) {
  const { createAdminHistory, updateAdminHistory, deleteAdminHistory } = useLanding();
  const [isCreating, setIsCreating] = useState(false);
  const [editingHistory, setEditingHistory] = useState<LandingHistory | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    gen: '',
  });

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      date: '',
      title: '',
      gen: '',
    });
  };

  const handleEdit = (history: LandingHistory) => {
    setEditingHistory(history);
    setFormData({
      date: history.date ? new Date(history.date).toISOString().split('T')[0] : '',
      title: history.title || '',
      gen: history.gen?.toString() || '',
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingHistory(null);
    setFormData({
      date: '',
      title: '',
      gen: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        date: formData.date ? `${formData.date}T00:00:00` : new Date().toISOString().split('T')[0] + 'T00:00:00',
        title: formData.title,
        gen: formData.gen ? parseInt(formData.gen) : undefined,
      };

      if (editingHistory) {
        await updateAdminHistory(editingHistory.id, submitData);
      } else {
        await createAdminHistory(submitData);
      }

      await onRefresh();
      handleCancel();
    } catch (error) {
      console.error('Error submitting history:', error);
      alert('히스토리 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (historyId: number) => {
    if (!confirm('정말로 이 히스토리를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteAdminHistory(historyId);
      await onRefresh();
    } catch (error) {
      console.error('Error deleting history:', error);
      alert('히스토리 삭제 중 오류가 발생했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">히스토리 관리</h2>
          <p className="text-sm text-gray-300 mt-1">
            프로메테우스의 주요 역사적 사건들을 관리합니다
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          새 히스토리 추가
        </button>
      </div>

      {/* 히스토리 목록 */}
      <GlassCard className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white">로딩 중...</span>
          </div>
        ) : histories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">등록된 히스토리가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {histories.map((history) => (
              <div
                key={history.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-white font-medium">{history.title}</h3>
                    <p className="text-sm text-gray-300">
                      {formatDate(history.date)}
                      {history.gen && ` • ${history.gen}기`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(history)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(history.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* 생성/수정 폼 모달 */}
      {(isCreating || editingHistory) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <GlassCard className="p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingHistory ? '히스토리 수정' : '새 히스토리 추가'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  날짜 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="히스토리 제목을 입력하세요"
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  기수
                </label>
                <input
                  type="number"
                  value={formData.gen}
                  onChange={(e) => setFormData({ ...formData, gen: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="예: 1, 2, 3..."
                  min="1"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  {editingHistory ? '수정' : '생성'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
