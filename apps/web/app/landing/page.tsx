'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faRocket, 
  faGraduationCap, 
  faTrophy, 
  faChartLine,
  faLightbulb,
  faCode,
  faPalette,
  faCalendarAlt,
  faAward,
  faInstagram,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram as faInstagramBrand } from '@fortawesome/free-brands-svg-icons';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: '동아리 개요', icon: faRocket },
    { id: 'members', label: '인원 및 조직', icon: faUsers },
    { id: 'activities', label: '활동', icon: faGraduationCap },
    { id: 'achievements', label: '주요 성과', icon: faTrophy },
    { id: 'datathon', label: '내부 데이터톤', icon: faChartLine },
    { id: 'promotion', label: '홍보 현황', icon: faInstagram }
  ];

  return (
    <div className="min-h-screen font-pretendard bg-gradient-to-br from-[#1A1A1A] via-[#292929] to-[#404040]">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-kimm-bold text-[#FFFFFF] mb-4">
              프로메테우스
            </h1>
            <p className="text-xl md:text-2xl text-[#e0e0e0] mb-6">
              인공지능으로 가치 있는 도전과 경험을 하고자 하는<br />
              '업'에 대한 열정을 지닌 대학생들이 모인 단체
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RedButton asChild>
                <Link href="/auth/login">
                  로그인
                </Link>
              </RedButton>
              <RedButton asChild variant="outline">
                <Link href="/member">
                  멤버 보기
                </Link>
              </RedButton>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-[#FF4500] text-white'
                    : 'bg-white/10 text-[#e0e0e0] hover:bg-white/20'
                }`}
              >
                <FontAwesomeIcon icon={section.icon} className="w-4 h-4" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* 동아리 개요 */}
          {activeSection === 'overview' && (
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <FontAwesomeIcon icon={faRocket} className="w-12 h-12 text-[#FF4500] mb-4" />
                <h2 className="text-3xl font-kimm-bold text-[#FFFFFF] mb-4">동아리 개요</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 text-[#e0e0e0]">
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">명칭</h3>
                    <p className="text-[#ffa282] font-medium">프로메테우스 (Prometheus)</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">성격</h3>
                    <p>인공지능 가치 창출 동아리</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">비전</h3>
                    <p>인공지능으로 가치 있는 도전과 경험을 하고자 '업'에 대한 열정을 지닌 대학생들이 모인 단체</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 인원 및 조직 */}
          {activeSection === 'members' && (
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-[#FF4500] mb-4" />
                <h2 className="text-3xl font-kimm-bold text-[#FFFFFF] mb-4">인원 및 조직</h2>
              </div>
              <div className="space-y-8">
                <div className="text-center">
                  <div className="inline-block p-6 bg-[#8B0000] rounded-lg mb-4">
                    <p className="text-2xl font-bold text-[#ffa282]">총 인원: 69명</p>
                    <p className="text-[#e0e0e0]">(누적 157명)</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">구성</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <FontAwesomeIcon icon={faLightbulb} className="w-5 h-5 text-[#FF4500]" />
                        <div>
                          <p className="font-medium text-[#FFFFFF]">집행부</p>
                          <p className="text-sm text-[#e0e0e0]">동아리 주요 안건 의결 / 주요 행사 총괄</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <FontAwesomeIcon icon={faCode} className="w-5 h-5 text-[#FF4500]" />
                        <div>
                          <p className="font-medium text-[#FFFFFF]">개발부</p>
                          <p className="text-sm text-[#e0e0e0]">기초 스터디 자료 제작 및 관리 / 프로젝트 운영</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5 text-[#FF4500]" />
                        <div>
                          <p className="font-medium text-[#FFFFFF]">기획부</p>
                          <p className="text-sm text-[#e0e0e0]">외부 행사 참여 기획 / 공식 행사 기획 (MT 등)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <FontAwesomeIcon icon={faPalette} className="w-5 h-5 text-[#FF4500]" />
                        <div>
                          <p className="font-medium text-[#FFFFFF]">홍보부</p>
                          <p className="text-sm text-[#e0e0e0]">홍보 게시글, 플랫폼 관리 / 홍보물 제작</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">레벨 체계</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-[#FFFFFF]">비기너</span>
                        <span className="text-[#ffa282] font-bold">9명</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-[#FFFFFF]">주니어</span>
                        <span className="text-[#ffa282] font-bold">13명</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-[#FFFFFF]">시니어</span>
                        <span className="text-[#ffa282] font-bold">40명</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-[#FFFFFF]">디자이너</span>
                        <span className="text-[#ffa282] font-bold">7명</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 활동 */}
          {activeSection === 'activities' && (
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <FontAwesomeIcon icon={faGraduationCap} className="w-12 h-12 text-[#FF4500] mb-4" />
                <h2 className="text-3xl font-kimm-bold text-[#FFFFFF] mb-4">활동</h2>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">스터디 & 프로젝트</h3>
                  <ul className="space-y-2 text-[#e0e0e0]">
                    <li className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-[#FF4500] mt-1 flex-shrink-0" />
                      <span>6개월마다 새로운 기수와 함께 스터디 및 프로젝트 진행</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 text-[#FF4500] mt-1 flex-shrink-0" />
                      <span>다양한 AI 프로덕트 제작</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">내부 해커톤</h3>
                  <p className="text-[#e0e0e0]">매 학기 자체 데이터톤 기획 및 개최</p>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">데모데이</h3>
                  <p className="text-[#e0e0e0]">한 학기 동안 진행한 프로젝트 결과를 공개 공유</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 주요 성과 */}
          {activeSection === 'achievements' && (
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <FontAwesomeIcon icon={faTrophy} className="w-12 h-12 text-[#FF4500] mb-4" />
                <h2 className="text-3xl font-kimm-bold text-[#FFFFFF] mb-4">주요 성과</h2>
              </div>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-[#8B0000] rounded-lg text-center">
                    <h3 className="text-xl font-semibold text-[#ffa282] mb-2">2023년</h3>
                    <div className="space-y-2 text-[#e0e0e0]">
                      <p>지원자 <span className="text-[#ffa282] font-bold">106명</span></p>
                      <p>프로젝트 <span className="text-[#ffa282] font-bold">17개</span></p>
                      <p>경쟁률 <span className="text-[#ffa282] font-bold">6:1</span></p>
                    </div>
                  </div>
                  <div className="p-6 bg-[#8B0000] rounded-lg text-center">
                    <h3 className="text-xl font-semibold text-[#ffa282] mb-2">2024년</h3>
                    <div className="space-y-2 text-[#e0e0e0]">
                      <p>지원자 <span className="text-[#ffa282] font-bold">489명</span></p>
                      <p>프로젝트 <span className="text-[#ffa282] font-bold">96개</span></p>
                      <p>경쟁률 <span className="text-[#ffa282] font-bold">24:1</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">AI 해커톤 개최</h3>
                    <p className="text-[#e0e0e0]">2023, 2024 Prometheus AI Hackathon 주관 (전국 대학(원)생 대상)</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2">데모데이 개최</h3>
                    <p className="text-[#e0e0e0]">2024 상·하반기 2회 개최</p>
                    <div className="mt-2 space-y-1 text-sm text-[#e0e0e0]">
                      <p>2024 상반기 방문자 <span className="text-[#ffa282] font-bold">120명</span></p>
                      <p>2024 하반기 방문자 <span className="text-[#ffa282] font-bold">140명</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 내부 데이터톤 */}
          {activeSection === 'datathon' && (
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <FontAwesomeIcon icon={faChartLine} className="w-12 h-12 text-[#FF4500] mb-4" />
                <h2 className="text-3xl font-kimm-bold text-[#FFFFFF] mb-4">내부 데이터톤</h2>
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">2024 상반기</h3>
                  <div className="space-y-3 text-[#e0e0e0]">
                    <div className="flex justify-between">
                      <span>주제:</span>
                      <span className="text-[#ffa282] font-medium">Food Image Classification</span>
                    </div>
                    <div className="flex justify-between">
                      <span>기간:</span>
                      <span>2024.07.15 ~ 07.21</span>
                    </div>
                    <div className="flex justify-between">
                      <span>상금:</span>
                      <span>1등 20만원 / 2등 10만원</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-white/5 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">2024 하반기</h3>
                  <div className="space-y-3 text-[#e0e0e0]">
                    <div className="flex justify-between">
                      <span>주제:</span>
                      <span className="text-[#ffa282] font-medium">법률안 검토 보고서 요약</span>
                    </div>
                    <div className="flex justify-between">
                      <span>기간:</span>
                      <span>2024.02.21 ~ 02.22</span>
                    </div>
                    <div className="flex justify-between">
                      <span>상금:</span>
                      <span>1등 30만원 / 2등 20만원</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* 홍보 현황 */}
          {activeSection === 'promotion' && (
            <GlassCard className="p-8">
              <div className="text-center mb-8">
                <FontAwesomeIcon icon={faInstagram} className="w-12 h-12 text-[#FF4500] mb-4" />
                <h2 className="text-3xl font-kimm-bold text-[#FFFFFF] mb-4">홍보 현황</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 rounded-lg text-center">
                  <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">소속 대학 수</h3>
                  <p className="text-3xl font-bold text-[#ffa282]">23개</p>
                </div>
                <div className="p-6 bg-white/5 rounded-lg text-center">
                  <h3 className="text-xl font-semibold text-[#FFFFFF] mb-4">인스타 팔로워</h3>
                  <p className="text-3xl font-bold text-[#ffa282]">543명</p>
                  <div className="mt-4">
                    <a 
                      href="https://instagram.com/prometheus_ai_" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#e0e0e0] hover:text-[#ffa282] transition-colors"
                    >
                      <FontAwesomeIcon icon={faInstagramBrand} className="w-5 h-5" />
                      <span>@prometheus_ai_</span>
                    </a>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </section>
    </div>
  );
}