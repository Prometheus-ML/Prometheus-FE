'use client';

import { useAuthStore } from '@prometheus-fe/stores';
import { useProject } from '@prometheus-fe/hooks';
import GlassCard from '@/src/components/GlassCard';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

export default function ProjectPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchMyProjectHistory } = useProject();
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMyProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMyProjectHistory();
      setMyProjects(data.items || []);
    } catch (error) {
      console.error('내 프로젝트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMyProjectHistory]);

  useEffect(() => {
    if (isAuthenticated() && user) {
      loadMyProjects();
    }
  }, [isAuthenticated, user, loadMyProjects]);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">내 프로젝트</h2>
          <div className="text-gray-300 text-center py-8">
            로그인이 필요합니다.
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">내 프로젝트</h2>
        
        {isLoading ? (
          <div className="text-gray-300 text-center py-8">
            프로젝트를 불러오는 중...
          </div>
        ) : myProjects.length === 0 ? (
          <div className="text-gray-300 text-center py-8">
            참여한 프로젝트가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {myProjects.map((projectWithMembers) => {
              const project = projectWithMembers.project;
              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="block bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg mb-2 group-hover:text-blue-300 transition-colors">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2 group-hover:text-gray-200 transition-colors">
                          {project.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.keywords?.map((keyword: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{project.gen}기</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'active' ? 'bg-green-500/20 text-green-300' :
                          project.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {project.status === 'active' ? '진행중' :
                           project.status === 'completed' ? '완료' : '일시정지'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          GitHub →
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Demo →
                        </a>
                      )}
                      <div className="text-gray-400 text-sm group-hover:text-blue-300 transition-colors">
                        상세보기 →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
