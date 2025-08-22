'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInstagram, 
  faGithub, 
  faDiscord 
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import GlassCard from '../src/components/GlassCard';
import RedButton from '../src/components/RedButton';
import Navigation from '../src/components/Navigation';
import { useProject, useLanding } from '@prometheus-fe/hooks';
import { Project } from '@prometheus-fe/types';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [hoveredActivity, setHoveredActivity] = useState<number | null>(null);
  const [currentProjectSlide, setCurrentProjectSlide] = useState<number>(0);
  const { fetchProjects } = useProject();
  const { 
    sponsors, 
    getSponsors, 
    isLoadingSponsors
  } = useLanding();

  const sections = [
    { id: 'hero', name: 'HOME' },
    { id: 'we-are', name: 'ACTIVITY' },
    { id: 'projects', name: 'PROJECT' },
    { id: 'sponsors', name: 'SPONSOR' },
  ];

  const intro = [
    {
      summary: "SEMINAR",
      img: "/images/seminar.png",
      title: "정기 세미나",
      desc: "정기 세미나를 통해 프로젝트 및 스터디 발표를 합니다.",
    },
    {
      summary: "VOLUNTEER",
      img: "/images/volunteer.png",
      title: "교육 봉사",
      desc: "고등학생들에게 프로그래밍, 인공지능이라는 좋은 도구를 가르쳐 학생들이 꿈꾸는 무언가에 도전하게 하고 싶습니다.",
    },
    {
      summary: "HACKATHON",
      img: "/images/hackathon.png",
      title: "해커톤",
      desc: "내부 해커톤과 외부 해커톤을 통해 인공지능의 활용을 함께 고민하고 소통하여 미래 사회에 힘이 되고자합니다.",
    },
    {
      summary: "DEMODAY",
      img: "/images/demoday.png",
      title: "데모데이",
      desc: "분기마다 프로젝트 결과물을 발표하는 데모데이를 진행합니다.",
    },
  ];

  const handleScroll = () => {
    let foundActiveSection = false;
    sections.forEach((section) => {
      const sectionElement = document.getElementById(section.id);
      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          setActiveSection(section.id);
          foundActiveSection = true;
        }
      }
    });

    if (!foundActiveSection) {
      setActiveSection(null);
    }
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  const fetchRecentProjects = async () => {
    try {
      const data = await fetchProjects({ size: 9, status: 'completed' });
      setRecentProjects(data.projects || []);
    } catch (error) {
      console.error('최근 프로젝트 조회 실패:', error);
    }
  };

  const fetchSponsors = async () => {
    try {
      await getSponsors({ page: 1, size: 3 });
    } catch (error) {
      console.error('후원사 조회 실패:', error);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    fetchRecentProjects();
    fetchSponsors();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 자동 슬라이드 기능
  useEffect(() => {
    if (recentProjects.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentProjectSlide(prev => {
        const maxSlide = Math.ceil(recentProjects.length / 3) - 1;
        return prev >= maxSlide ? 0 : prev + 1;
      });
    }, 4000); // 4초마다 자동 넘김

    return () => clearInterval(interval);
  }, [recentProjects.length]);

  return (
    <div className="max-w-full mx-auto min-h-screen text-white w-full bg-black">
      {/* Navigation */}
      <Navigation />
      
      {/* Side Navigation */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50">
        <ul className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`transition-all font-kimm-bold duration-500 transform cursor-pointer px-2 rounded-l-full ${
                activeSection === section.id
                  ? 'w-20 md:w-32 -translate-x-4 bg-[#BA281E]'
                  : 'w-14 md:w-24 translate-x-0 text-[#222222] bg-[#7D7D7D] opacity-80'
              }`}
              onClick={() => scrollToSection(section.id)}
            >
              <span className="text-xs md:text-sm font-medium">{section.name}</span>
            </div>
          ))}
        </ul>
      </div>

      {/* Hero Section */}
      <section id="hero" className="h-screen flex items-center justify-center px-4 w-full relative" style={{ marginBottom: '0.5vh' }}>
        <div 
          className="absolute inset-0 bg-center bg-no-repeat opacity-20"
          style={{ 
            backgroundImage: 'url(/images/landing.png)',
            backgroundSize: 'cover'
          }}
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mt-12 mb-36 relative -ml-8">
              <Image
                src="/icons/logo.png"
                alt="Prometheus Logo"
                width={120}
                height={120}
                className="w-24 h-24 md:w-32 md:h-32"
              />
              <div className="relative">
                <div className="absolute -top-4 right-1 md:right-2 text-right">
                  <p className="md:text-sm text-xs text-[#e0e0e0] font-medium">대학생 인공지능 단체</p>
                </div>
                <h1 className="text-5xl md:text-7xl font-kimm-bold bg-gradient-to-r from-[#8B0000] from-20% via-[#c2402a] to-[#FFFFFF] bg-clip-text text-transparent tracking-wider -ml-5">
                  rometheus
                </h1>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-[#e0e0e0] mb-6 font-pretendard">
              프로메테우스는 인공지능으로 가치 있는 도전과 경험을 하고자 하는<br />
              <span className="text-[#e83225]">UP</span>에 대한 열정을 지닌 대학생들이 모인 인공지능 동아리입니다.
            </p>
          </div>
        </div>
      </section>

      {/* WE ARE Section */}
      <section id="we-are" className="h-screen flex items-center justify-center px-4 relative w-full" style={{ marginBottom: '0.5vh' }}>
        <div 
          className="absolute inset-0 bg-center bg-no-repeat opacity-20"
          style={{ 
            backgroundImage: 'url(/images/landing2.png)',
            backgroundSize: '100% 100%'
          }}
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs md:text-lg lg:text-xl font-bold mb-1 md:mb-2.5 text-red-700 uppercase tracking-wider font-kimm-light">
              WE ARE
            </h2>
            <p className="text-sm md:text-xl lg:text-4xl font-bold text-[#e0e0e0] mb-1 md:mb-2.5 font-pretendard">
              협업과 도전으로
            </p>
            <p className="text-sm md:text-xl lg:text-4xl font-bold text-[#e0e0e0] mb-6 md:mb-10 font-pretendard">
              이루어지는 활동들
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-5 max-w-4xl mx-auto mb-10">
            {intro.map((section, index) => (
              <div key={index} className="relative">
                <div 
                  className="rounded-lg relative h-[150px] md:h-[200px] lg:h-[250px] bg-center bg-cover cursor-pointer transition-all duration-300"
                  style={{ backgroundImage: `url(${section.img})` }}
                  onMouseEnter={() => setHoveredActivity(index)}
                  onMouseLeave={() => setHoveredActivity(null)}
                >
                  {/* 빨간 반투명 배경 */}
                  <div className={`absolute inset-0 bg-red-600 transition-opacity duration-300 z-10 rounded-lg ${
                    hoveredActivity === index ? 'opacity-50' : 'opacity-0'
                  }`}></div>
                  
                  {/* 텍스트 컨텐츠 */}
                  <div className="absolute w-full h-full z-20 flex flex-col justify-center items-center text-center pt-[20%] px-[15%] md:px-[10%] lg:px-[15%]">
                    <p className={`text-xs md:text-xl lg:text-2xl transition-all duration-300 font-bold text-white mb-1 md:mb-3 font-kimm-light ${
                      hoveredActivity === index ? 'translate-y-[-1rem] lg:translate-y-[-2rem]' : ''
                    }`}>
                      {section.summary}
                    </p>
                    <p className={`font-bold text-xs md:text-xl lg:text-2xl transition-all duration-300 text-white mb-1 md:mb-3 font-pretendard ${
                      hoveredActivity === index ? 'translate-y-[-1rem] lg:translate-y-[-2rem]' : ''
                    }`}>
                      {section.title}
                    </p>
                    <p className={`text-3xs md:text-sm lg:text-base transition-all duration-300 text-white font-pretendard ${
                      hoveredActivity === index ? 'translate-y-[-1rem] lg:translate-y-[-2rem] opacity-100' : 'opacity-0'
                    }`}>
                      {section.desc}
                    </p>
                  </div>
              </div>
              </div>
            ))}
              </div>

          <div className="text-center">
            <Link href="/about">
              <div className="inline-flex items-center justify-center font-medium text-xs md:text-base lg:text-lg rounded-full w-[40%] md:w-[25%] lg:w-[20%] mx-auto bg-red-700 text-white py-2 px-4 mt-4 hover:opacity-80 hover:-translate-y-0.5 hover:scale-105 duration-200">
                더 알아보기
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* PROJECTS Section */}
      <section id="projects" className="h-screen flex items-center justify-center px-4 w-full relative" style={{ marginBottom: '0.5vh' }}>
        <div 
          className="absolute inset-0 bg-center bg-no-repeat opacity-20"
          style={{ 
            backgroundImage: 'url(/images/landing3.png)',
            backgroundSize: 'cover'
          }}
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
          <h2 className="text-xs md:text-lg lg:text-xl font-bold mb-1 md:mb-2.5 text-red-700 uppercase tracking-wider font-kimm-light">
            PROJECTS
          </h2>
          <p className="text-sm md:text-xl lg:text-4xl font-bold text-[#e0e0e0] mb-1 md:mb-2.5 font-pretendard">
            멤버들의 활동을
          </p>
          <p className="text-sm md:text-xl lg:text-4xl font-bold text-[#e0e0e0] mb-6 md:mb-10 font-pretendard">
            확인해보세요
          </p>
          
          {/* 프로젝트 카드들 */}
          <div className="relative max-w-6xl mx-auto mb-8 overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentProjectSlide * 33.333}%)` }}
            >
              {recentProjects.map((project) => (
                <div key={project.id} className="w-full md:w-1/3 flex-shrink-0 px-3">
                  <div className="p-6 h-full">
                    <div 
                      className="rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => window.location.href = `/project/${project.id}`}
                    >
                      {/* 프로젝트 이미지 */}
                      <div className="mb-4">
                        <div className="w-full h-48 rounded-lg overflow-hidden bg-white/10">
                          {project.thumbnail_url ? (
                            <Image
                              src={project.thumbnail_url}
                              alt={project.title}
                              width={300}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/10">
                              <span className="text-gray-400 text-4xl">🚀</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 프로젝트 정보 */}
                      <div className="space-y-3">
                        {/* 제목과 기수 */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <h3 className="text-lg font-semibold text-white line-clamp-2 font-pretendard">
                              {project.title}
                            </h3>
                          </div>
                        </div>

                        {/* 설명 (두 줄 고정) */}
                        {project.description && (
                          <div className="h-10">
                            <p className="text-gray-300 text-sm line-clamp-2 font-pretendard text-left">
                              {project.description}
                            </p>
                          </div>
                        )}

                        {/* 키워드 */}
                        <div className="flex flex-wrap gap-1">
                          {project.keywords && project.keywords.length > 0 ? (
                            project.keywords.slice(0, 3).map((keyword, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-white/20 text-white rounded-full"
                              >
                                #{keyword}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">키워드 없음</span>
                          )}
                          {project.keywords && project.keywords.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-white/20 text-white rounded-full">
                              +{project.keywords.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 슬라이드 네비게이션 */}
            {recentProjects.length > 3 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(recentProjects.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentProjectSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentProjectSlide === index ? 'bg-[#B91C1C]' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          <Link href="/project">
            <RedButton>더 알아보기</RedButton>
          </Link>
        </div>
      </section>

      {/* SPONSORS Section */}
      <section id="sponsors" className="h-screen flex items-center justify-center px-4 w-full" style={{ marginBottom: '0.5vh' }}>
        <div className="w-full max-w-6xl mx-auto text-center">
          <h2 className="text-xs md:text-lg lg:text-xl font-bold mb-1 md:mb-2.5 text-red-700 uppercase tracking-wider font-kimm-light">
            SPONSOR
          </h2>
          <p className="text-sm md:text-xl lg:text-4xl font-bold text-[#e0e0e0] mb-6 md:mb-10 font-pretendard">
            후원사
          </p>
          
          {isLoadingSponsors ? (
            <div className="bg-gray-900 rounded-lg p-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">로딩 중...</h3>
              </div>
              </div>
          ) : sponsors.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="flex items-center justify-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-300">
                  {sponsor.logo_url ? (
                    <Image
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      width={160}
                      height={80}
                      className="max-w-full max-h-20 object-contain filter brightness-90 hover:brightness-100 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-32 h-20 flex items-center justify-center text-gray-400 text-sm font-pretendard">
                      {sponsor.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#404040] w-full">
        <div className="w-full max-w-6xl mx-auto text-center">
          <div className="flex justify-center space-x-8 mb-6">
            <a href="#" className="text-[#e0e0e0] hover:text-[#ffa282] transition-colors">
              <FontAwesomeIcon icon={faInstagram as any} className="w-6 h-6" />
            </a>
            <a href="#" className="text-[#e0e0e0] hover:text-[#ffa282] transition-colors">
              <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6" />
            </a>
            <a href="#" className="text-[#e0e0e0] hover:text-[#ffa282] transition-colors">
              <FontAwesomeIcon icon={faDiscord as any} className="w-6 h-6" />
            </a>
            <a href="#" className="text-[#e0e0e0] hover:text-[#ffa282] transition-colors">
              <FontAwesomeIcon icon={faGithub as any} className="w-6 h-6" />
            </a>
          </div>
          <p className="text-[#e0e0e0] text-sm">
            ©Prometheus 2022–{new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}