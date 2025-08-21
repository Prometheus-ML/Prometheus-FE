'use client';

import { useState, useEffect } from 'react';
import Navigation from '../../src/components/Navigation';
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
      <Navigation />
      
      <div className="pt-20 px-4">
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
                  <div key={link.id} className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors duration-300">
                    <div className="w-full h-48 bg-gray-800 relative">
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
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                          뉴스
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(link.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2">
                        {link.title}
                      </h3>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-4 text-red-400 hover:text-red-300 text-sm font-medium transition-colors inline-block"
                      >
                        자세히 보기 →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-16">
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button 
                      className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-6">
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
