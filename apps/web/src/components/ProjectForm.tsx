'use client';

import { useState, useEffect, ChangeEvent } from 'react';

interface ProjectFormData {
  title: string;
  description: string;
  keywords: string[];
  start_date: string;
  end_date: string;
  github_url: string;
  demo_url: string;
  panel_url: string;
  gen?: number;
  status: 'active' | 'completed' | 'paused';
}

interface ProjectFormProps {
  initial?: Partial<ProjectFormData>;
  mode?: 'create' | 'edit';
  showStatus?: boolean;
  onSubmit: (data: ProjectFormData) => void;
}

export default function ProjectForm({ 
  initial = {}, 
  mode = 'create', 
  showStatus = false, 
  onSubmit 
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    keywords: [],
    start_date: '',
    end_date: '',
    github_url: '',
    demo_url: '',
    panel_url: '',
    gen: undefined,
    status: 'active'
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const applyInitial = (p: Partial<ProjectFormData>) => {
      setFormData({
        title: p?.title || '',
        description: p?.description || '',
        keywords: Array.isArray(p?.keywords) ? [...p.keywords] : [],
        start_date: p?.start_date ? String(p.start_date).substring(0, 10) : '',
        end_date: p?.end_date ? String(p.end_date).substring(0, 10) : '',
        github_url: p?.github_url || '',
        demo_url: p?.demo_url || '',
        panel_url: p?.panel_url || '',
        gen: p?.gen ?? undefined,
        status: p?.status || 'active'
      });
    };
    
    applyInitial(initial);
  }, [initial]);

  const updateFormData = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeywordFromInput = () => {
    const raw = (keywordInput || '').split(',').map(s => s.trim()).filter(Boolean);
    const newKeywords = [...formData.keywords];
    
    for (const r of raw) {
      if (!newKeywords.includes(r)) {
        newKeywords.push(r);
      }
    }
    
    updateFormData('keywords', newKeywords);
    setKeywordInput('');
  };

  const removeKeyword = (index: number) => {
    const newKeywords = [...formData.keywords];
    newKeywords.splice(index, 1);
    updateFormData('keywords', newKeywords);
  };

  const handleKeywordKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeywordFromInput();
    }
  };

  const handlePanelFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/image/upload/project', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('업로드 실패');
      
      const data = await response.json();
      const imageUrl = data.url || data.name || data.id;
      updateFormData('panel_url', imageUrl);
    } catch (err: any) {
      alert('이미지 업로드 실패: ' + (err?.message || err));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.start_date) {
      alert('제목과 시작일은 필수입니다.');
      return;
    }
    
    const payload: ProjectFormData = {
      title: formData.title,
      description: formData.description || '',
      keywords: formData.keywords.length ? formData.keywords : [],
      start_date: formData.start_date,
      end_date: formData.end_date || '',
      github_url: formData.github_url || '',
      demo_url: formData.demo_url || '',
      panel_url: formData.panel_url || '',
      gen: typeof formData.gen === 'number' ? formData.gen : undefined,
      status: formData.status,
      ...(showStatus ? { status: formData.status } : {})
    };
    
    onSubmit(payload);
  };

  return (
    <div className="space-y-4 bg-white border rounded-lg p-6">
      <input
        value={formData.title}
        onChange={(e) => updateFormData('title', e.target.value)}
        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="제목 (필수)"
      />
      
      <textarea
        value={formData.description}
        onChange={(e) => updateFormData('description', e.target.value)}
        className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={6}
        placeholder="설명"
      />

      <div>
        <label className="block text-sm mb-1 font-medium text-gray-700">키워드</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.keywords.map((keyword, i) => (
            <span
              key={keyword + i}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-700"
            >
              {keyword}
              <button
                type="button"
                className="ml-1 text-xs text-gray-500 hover:text-gray-700"
                onClick={() => removeKeyword(i)}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <input
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={handleKeywordKeydown}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="키워드를 입력하고 Enter로 추가"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) => updateFormData('start_date', e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="시작일(필수)"
        />
        <input
          type="date"
          value={formData.end_date}
          onChange={(e) => updateFormData('end_date', e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="종료일"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          value={formData.github_url}
          onChange={(e) => updateFormData('github_url', e.target.value)}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="GitHub URL"
        />
        <input
          value={formData.demo_url}
          onChange={(e) => updateFormData('demo_url', e.target.value)}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Demo URL"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept="image/*"
            onChange={handlePanelFileChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploading && <span className="text-sm text-gray-400">업로드 중...</span>}
        </div>
        {formData.panel_url && (
          <div className="mt-2">
            <img
              src={formData.panel_url}
              alt="panel"
              className="max-h-48 rounded border object-cover"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="number"
          value={formData.gen || ''}
          onChange={(e) => updateFormData('gen', e.target.value ? Number(e.target.value) : undefined)}
          className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="기수 (숫자)"
        />
        {showStatus && (
          <select
            value={formData.status}
            onChange={(e) => updateFormData('status', e.target.value as 'active' | 'completed' | 'paused')}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">진행중</option>
            <option value="completed">완료</option>
            <option value="paused">중지</option>
          </select>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {mode === 'edit' ? '저장' : '생성'}
        </button>
      </div>
    </div>
  );
}
