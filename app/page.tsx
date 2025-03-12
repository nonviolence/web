'use client';

import Image from 'next/image';
import Link from 'next/link';
import PosterGallery from './components/PosterGallery';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900" />
      
      {/* 顶部导航 */}
      <nav className="w-full flex justify-between items-center p-4 relative z-10">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo_50.png"
            alt="Rhodes Island Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-xl font-bold text-primary">Rhodes Island</span>
        </Link>
      </nav>

      {/* 主要内容 */}
      <div className="flex-1 w-full relative">
        <PosterGallery />
      </div>
    </main>
  );
}
