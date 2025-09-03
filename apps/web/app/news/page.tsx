'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanding } from '@prometheus-fe/hooks';

export default function NewsPage() {
  const { links, getLinks, isLoadingLinks } = useLanding();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        await getLinks({ page: currentPage, size: itemsPerPage });
      } catch (error) {
        console.error('링크 조회 실패:', error);
      }
    };

    fetchLinks();
  }, [getLinks, currentPage]);

  const totalPages = Math.ceil(links.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen text-white w-full bg-black">
      <div className="pt-16 px-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-kimm-bold mb-4 bg-gradient-to-r from-[#8B0000] via-[#c2402a] to-[#ffa282] bg-clip-text text-transparent">
              NEWS
            </h1>
            <p className="text-xl text-[#e0e0e0]">
              프로메테우스 소식
            </p>
          </div>
          
          {isLoadingLinks ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : links.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {links.map((link) => (
                  <div key={link.id} className="bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:bg-white/20 transition-colors duration-300">
                    <div className="w-full h-48 bg-white/10 relative">
                      {link.image_url ? (
                        <Image
                          src={link.image_url}
                          alt={link.title}
                          width={400}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-gray-400 text-2xl">📰</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                        {link.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(link.created_at).toLocaleDateString()}
                        </span>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#ffa282] hover:text-white text-sm font-medium transition-colors"
                        >
                          자세히 보기 →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      이전
                    </button>
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        className={`px-3 py-2 rounded transition-colors ${
                          currentPage === index + 1
                            ? 'bg-[#8B0000] text-[#ffa282]'
                            : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                        }`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button 
                      className="px-3 py-2 bg-white/10 border border-white/20 text-white rounded hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-2xl">📰</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">아직 뉴스가 없습니다</h3>
              <p className="text-gray-400 text-lg">
                프로메테우스의 최신 소식을 확인해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
