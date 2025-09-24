'use client';

import { useState } from 'react';
import { useLanding } from '@prometheus-fe/hooks';
import { LandingSponsor, LandingSponsorCreateRequest } from '@prometheus-fe/types';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import SponsorModal from './SponsorModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faHandshake } from '@fortawesome/free-solid-svg-icons';

interface SponsorsTabProps {
  isLoading: boolean;
  sponsors: LandingSponsor[];
  onRefresh: () => void;
}

export default function SponsorsTab({ isLoading, sponsors, onRefresh }: SponsorsTabProps) {
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<LandingSponsor | null>(null);
  
  const { createSponsor, deleteSponsor } = useLanding();

  const handleCreateSponsor = async (data: LandingSponsorCreateRequest) => {
    try {
      await createSponsor(data);
      await onRefresh(); // 목록 새로고침
      alert('후원사가 추가되었습니다!');
    } catch (error) {
      console.error('후원사 생성 실패:', error);
      throw error;
    }
  };

  const openSponsorModal = (sponsor?: LandingSponsor) => {
    setSelectedSponsor(sponsor || null);
    setShowSponsorModal(true);
  };

  const closeSponsorModal = () => {
    setShowSponsorModal(false);
    setSelectedSponsor(null);
  };

  return (
    <>
      <GlassCard className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">후원사 목록</h2>
              <RedButton
                onClick={() => openSponsorModal()}
                className="inline-flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                후원사 추가
              </RedButton>
            </div>
            
            {sponsors.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faHandshake} className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">후원사가 없습니다</h3>
                <p className="text-gray-300">첫 번째 후원사를 추가해보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsors.map((sponsor) => (
                  <GlassCard key={sponsor.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{sponsor.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openSponsorModal(sponsor)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          수정
                        </button>
                        <button
                          onClick={() => deleteSponsor(sponsor.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-1" />
                          삭제
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="font-medium">목적:</span> {sponsor.purpose}</p>
                      <p><span className="font-medium">금액:</span> {sponsor.amount?.toLocaleString() || '0'}원</p>
                      <p><span className="font-medium">후원일:</span> {new Date(sponsor.sponsored_at).toLocaleDateString()}</p>
                      {sponsor.note && <p><span className="font-medium">비고:</span> {sponsor.note}</p>}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* 후원사 모달 */}
      <SponsorModal
        isOpen={showSponsorModal}
        sponsor={selectedSponsor}
        onClose={closeSponsorModal}
        onSubmit={handleCreateSponsor}
      />
    </>
  );
}
