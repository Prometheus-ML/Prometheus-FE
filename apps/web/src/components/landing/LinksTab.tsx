'use client';

import { useLanding } from '@prometheus-fe/hooks';
import { LandingLink } from '@prometheus-fe/types';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faLink } from '@fortawesome/free-solid-svg-icons';

interface LinksTabProps {
  isLoading: boolean;
  links: LandingLink[];
  onRefresh: () => void;
}

export default function LinksTab({ isLoading, links, onRefresh }: LinksTabProps) {
  const { deleteAdminLink } = useLanding();

  return (
    <GlassCard className="overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">링크 목록</h2>
            <RedButton className="inline-flex items-center">
              <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
              링크 추가
            </RedButton>
          </div>
          
          {links.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faLink} className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">링크가 없습니다</h3>
              <p className="text-gray-300">첫 번째 링크를 추가해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map((link) => (
                <GlassCard key={link.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{link.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => deleteAdminLink(link.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p><span className="font-medium">URL:</span> {link.url}</p>
                    <p><span className="font-medium">생성일:</span> {new Date(link.created_at).toLocaleDateString()}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
