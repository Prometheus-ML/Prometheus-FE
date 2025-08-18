'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInstagram, 
  faGithub, 
  faDiscord 
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import GlassCard from '../../src/components/GlassCard';
import RedButton from '../../src/components/RedButton';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-white w-full">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center px-4 w-full">
        <div className="w-full max-w-6xl mx-auto text-center">
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
            <p className="text-xl md:text-2xl text-[#e0e0e0] mb-6">
              프로메테우스는 인공지능으로 가치 있는 도전과 경험을 하고자 하는<br />
              &apos;업&apos;에 대한 열정을 지닌 대학생들이 모인 인공지능 동아리입니다.
            </p>
          </div>
        </div>
      </section>

      {/* WE ARE Section */}
      <section className="h-screen flex items-center justify-center px-4 relative w-full">
        <div 
          className="absolute inset-0 bg-center bg-no-repeat opacity-20"
          style={{ 
            backgroundImage: 'url(/images/landing2.png)',
            backgroundSize: '100% 100%'
          }}
        />
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-kimm-bold mb-4 bg-gradient-to-r from-[#8B0000] via-[#c2402a] to-[#ffa282] bg-clip-text text-transparent">
              WE ARE
            </h2>
            <p className="text-xl text-[#e0e0e0]">
              협업과 도전으로 이루어지는 활동들
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 bg-[#8B0000] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">SEMINAR</h3>
              <p className="text-[#e0e0e0]">정기세미나</p>
            </GlassCard>
            
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 bg-[#c2402a] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">TUTORING</h3>
              <p className="text-[#e0e0e0]">교육봉사</p>
            </GlassCard>
            
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 bg-[#FF4500] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">HACKATHON</h3>
              <p className="text-[#e0e0e0]">해커톤</p>
            </GlassCard>
            
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 bg-[#ffa282] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">DEMODAY</h3>
              <p className="text-[#e0e0e0]">데모데이</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* PROJECTS Section */}
      <section className="h-screen flex items-center justify-center px-4 w-full">
        <div className="w-full max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-kimm-bold mb-4 bg-gradient-to-r from-[#8B0000] via-[#c2402a] to-[#ffa282] bg-clip-text text-transparent">
            PROJECTS
          </h2>
          <p className="text-xl text-[#e0e0e0] mb-8">
            멤버들의 활동을 확인해보세요
          </p>
          <Link href="/project">
            <RedButton>더 알아보기</RedButton>
          </Link>
        </div>
      </section>

      {/* SPONSORS Section */}
      <section className="h-screen flex items-center justify-center px-4 w-full">
        <div className="w-full max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-kimm-bold mb-4 bg-gradient-to-r from-[#8B0000] via-[#c2402a] to-[#ffa282] bg-clip-text text-transparent">
            SPONSORS
          </h2>
          <p className="text-xl text-[#e0e0e0] mb-12">
            후원사
          </p>
          <p className="text-lg text-[#e0e0e0] mb-16">
            프로메테우스는 다음과 같은 후원사의 도움을 받습니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <GlassCard className="p-8 text-center">
              <div className="w-24 h-24 bg-[#404040] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-[#e0e0e0] text-sm">Sponsor 1</span>
              </div>
              <h3 className="text-lg font-semibold">후원사 1</h3>
            </GlassCard>
            
            <GlassCard className="p-8 text-center">
              <div className="w-24 h-24 bg-[#404040] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-[#e0e0e0] text-sm">Sponsor 2</span>
              </div>
              <h3 className="text-lg font-semibold">후원사 2</h3>
            </GlassCard>
            
            <GlassCard className="p-8 text-center">
              <div className="w-24 h-24 bg-[#404040] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-[#e0e0e0] text-sm">Sponsor 3</span>
              </div>
              <h3 className="text-lg font-semibold">후원사 3</h3>
            </GlassCard>
          </div>
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