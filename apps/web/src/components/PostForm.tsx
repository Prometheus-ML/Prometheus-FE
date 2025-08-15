import { useState } from 'react';

const CATEGORIES = [
  { value: 'free', label: '자유게시판' },
  { value: 'activity', label: '활동' },
  { value: 'career', label: '진로' },
  { value: 'promotion', label: '홍보' },
  { value: 'announcement', label: '공지사항' },
] as const;

interface PostFormProps {
  onSubmit: (post: { category: string; title: string; content: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function PostForm({ onSubmit, onCancel, isSubmitting = false }: PostFormProps) {
  const [newPost, setNewPost] = useState({
    category: 'free',
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      return;
    }

    await onSubmit(newPost);
    setNewPost({ category: 'free', title: '', content: '' });
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">새 게시글 작성</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <select
            value={newPost.category}
            onChange={(e) => setNewPost((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            value={newPost.title}
            onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="게시글 제목을 입력하세요"
            maxLength={200}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="게시글 내용을 입력하세요"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? '작성 중...' : '게시글 작성'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
