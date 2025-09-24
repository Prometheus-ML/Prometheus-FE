'use client';

import { useState } from 'react';
import { useLanding } from '@prometheus-fe/hooks';
import { LandingHonorHall, LandingHonorHallCreateRequest } from '@prometheus-fe/types';
import GlassCard from '@/src/components/GlassCard';
import RedButton from '@/src/components/RedButton';
import HonorHallModal from './HonorHallModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faCrown } from '@fortawesome/free-solid-svg-icons';

interface HonorHallTabProps {
  isLoading: boolean;
  honorHall: LandingHonorHall[];
  onRefresh: () => void;
}

export default function HonorHallTab({ isLoading, honorHall, onRefresh }: HonorHallTabProps) {
  const [showHonorHallModal, setShowHonorHallModal] = useState(false);
  const [selectedHonorHall, setSelectedHonorHall] = useState<LandingHonorHall | null>(null);
  
  const { createHonorHall, deleteHonorHall } = useLanding();

  const handleCreateHonorHall = async (data: LandingHonorHallCreateRequest) => {
    try {
      await createHonorHall(data);
      await onRefresh(); // 목록 새로고침
      alert('명예의전당이 추가되었습니다!');
    } catch (error) {
      console.error('명예의전당 생성 실패:', error);
      throw error;
    }
  };

  const openHonorHallModal = (honorHall?: LandingHonorHall) => {
    setSelectedHonorHall(honorHall || null);
    setShowHonorHallModal(true);
  };

  const closeHonorHallModal = () => {
    setShowHonorHallModal(false);
    setSelectedHonorHall(null);
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
              <h2 className="text-lg font-semibold text-white">명예의전당 목록</h2>
              <RedButton
                onClick={() => openHonorHallModal()}
                className="inline-flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                명예의전당 추가
              </RedButton>
            </div>
            
            {honorHall.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCrown} className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">명예의전당이 없습니다</h3>
                <p className="text-gray-300">첫 번째 명예의전당을 추가해보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {honorHall.map((honor, index) => (
                  <GlassCard key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">{honor.name}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openHonorHallModal(honor)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          수정
                        </button>
                        <button
                          onClick={() => deleteHonorHall(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          <FontAwesomeIcon icon={faTrash} className="mr-1" />
                          삭제
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><span className="font-medium">기여 목적:</span> {honor.purpose}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* 명예의전당 모달 */}
      <HonorHallModal
        isOpen={showHonorHallModal}
        honorHall={selectedHonorHall}
        onClose={closeHonorHallModal}
        onSubmit={handleCreateHonorHall}
      />
    </>
  );
}
