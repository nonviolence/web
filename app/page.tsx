'use client';

import Image from 'next/image';
import Link from 'next/link';
import PosterGallery from './components/PosterGallery';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { loadGrayscaleImage } from './utils/imageProcessing';
import LoginModal from './components/LoginModal';
import UserAvatar from './components/UserAvatar';
import { useAuth } from './contexts/AuthContext';

// 添加大图组件
const PosterBigDisplay = ({ selectedId }: { selectedId: number | null }) => {
  const [grayscaleImage, setGrayscaleImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageCache, setImageCache] = useState<Record<number, { 
    grayscale: string; 
    original: string;
    dimensions: { width: number; height: number } 
  }>>({});

  // 检测视窗宽度
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // 初始检查
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 预加载下一张图片
  const preloadNextImage = useCallback((currentId: number) => {
    const nextId = currentId % 6 + 1; // 假设有6张图片
    if (!imageCache[nextId]) {
      const img = new globalThis.Image();
      img.src = `/images/poster_${nextId}_big.png`;
      
      Promise.all([
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          img.onload = () => {
            // 创建一个 canvas 来缓存原始图片
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve({ 
                width: img.width, 
                height: img.height,
              });
            } else {
              reject(new Error('无法创建 canvas context'));
            }
          };
          img.onerror = () => reject(new Error('图片加载失败'));
        }),
        loadGrayscaleImage(`/images/poster_${nextId}_big.png`, 1)
      ]).then(([dimensions, grayscale]) => {
        setImageCache(prev => ({
          ...prev,
          [nextId]: { 
            grayscale,
            original: `/images/poster_${nextId}_big.png`,
            dimensions 
          }
        }));
      }).catch(error => {
        console.error('预加载失败:', error);
      });
    }
  }, [imageCache]);
  
  useEffect(() => {
    if (selectedId) {
      // 如果缓存中有数据，直接使用
      if (imageCache[selectedId]) {
        setGrayscaleImage(imageCache[selectedId].grayscale);
        setImageDimensions(imageCache[selectedId].dimensions);
        setIsLoading(false);
        // 预加载下一张
        preloadNextImage(selectedId);
        return;
      }

      setIsLoading(true);
      
      const img = new globalThis.Image();
      img.src = `/images/poster_${selectedId}_big.png`;
      
      Promise.all([
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          img.onload = () => {
            // 创建一个 canvas 来缓存原始图片
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              console.log('图片加载成功:', {
                width: img.width,
                height: img.height,
                src: img.src
              });
              resolve({ 
                width: img.width, 
                height: img.height,
              });
            } else {
              reject(new Error('无法创建 canvas context'));
            }
          };
          img.onerror = () => reject(new Error('图片加载失败'));
        }),
        loadGrayscaleImage(`/images/poster_${selectedId}_big.png`, 1)
      ]).then(([dimensions, grayscale]) => {
        console.log('灰度图生成成功:', {
          dimensions,
          grayscaleUrl: grayscale.slice(0, 100) + '...' // 只显示URL的前100个字符
        });
        // 更新缓存
        setImageCache(prev => ({
          ...prev,
          [selectedId]: { 
            grayscale,
            original: `/images/poster_${selectedId}_big.png`,
            dimensions 
          }
        }));
        setGrayscaleImage(grayscale);
        setImageDimensions(dimensions);
        setIsLoading(false);
        // 预加载下一张
        preloadNextImage(selectedId);
      }).catch(error => {
        console.error('图片加载失败:', error);
        setIsLoading(false);
      });
    } else {
      // 重置状态但保留缓存
      setGrayscaleImage(null);
      setImageDimensions(null);
      setIsLoading(false);
    }
  }, [selectedId, imageCache, preloadNextImage]);

  if (!selectedId || !imageDimensions) return null;

  // 使用1024为基准尺寸
  const baseSize = 1024;
  // 手机模式下缩小尺寸
  const scaleFactor = isMobile ? 0.5 : 1;
  // 前景图使用原始尺寸
  const fgSize = Math.round(baseSize * scaleFactor);
  // 背景图使用1.4倍尺寸
  const bgSize = Math.round(baseSize * 1.4 * scaleFactor);

  return (
    <div className="fixed inset-0 z-0 overflow-visible pointer-events-none">
      <AnimatePresence mode="wait">
        {/* 背景图（灰度） */}
        <motion.div
          key={`bg-${selectedId}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 0.5, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ 
            duration: 0.5,
            ease: "linear"
          }}
          className="absolute left-1/2"
          style={{ 
            transform: `translate(calc(-50% + ${isMobile ? '-150px' : '100px'}), ${isMobile ? '600px' : '1400px'})`
          }}
        >
          {grayscaleImage ? (
            <div className="relative group">
              {/* 主图像 */}
              <div className="relative" style={{ width: bgSize, height: bgSize }}>
                {/* 主图像 */}
                <Image
                  src={grayscaleImage}
                  alt="Character Background"
                  fill
                  className={`
                    select-none pointer-events-none
                    ${isLoading ? 'opacity-0' : 'opacity-50'}
                    relative z-10 object-contain
                  `}
                  style={{
                    filter: 'blur(1px)'
                  }}
                  sizes={`${bgSize}px`}
                  priority
                  unoptimized
                />

                {/* 位移效果阴影 */}
                <div 
                  className="absolute inset-0 z-0"
                  style={{
                    backgroundImage: `url(${grayscaleImage})`,
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    filter: 'blur(1px)',
                    opacity: 0.5
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-black/20" style={{ width: bgSize, height: bgSize }} />
          )}
        </motion.div>

        {/* 前景图（原图） */}
        <motion.div
          key={`main-${selectedId}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ 
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="absolute origin-bottom-right z-10"
          style={{ 
            right: isMobile ? '50%' : '-100px', 
            bottom: isMobile ? '-100px' : '-300px',
            transform: isMobile ? 'translateX(50%)' : 'none'
          }}
        >
          <div className="relative" style={{ width: fgSize, height: fgSize }}>
            <Image
              src={imageCache[selectedId]?.original || `/images/poster_${selectedId}_big.png`}
              alt="Character"
              fill
              className={`select-none pointer-events-none transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'} object-contain`}
              priority
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();

  // 添加自动显示登录模态框的逻辑
  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // 初始检查
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-gray-900" />
      
      {/* 顶部导航 */}
      <nav className={`w-full flex justify-between items-center ${isMobile ? 'p-4' : 'p-8'} relative z-10`}>
        <Link href="/" className="flex items-center space-x-6">
          <Image
            src="/images/logo_50.png"
            alt="Rhodes Island Logo"
            width={isMobile ? 80 : 160}
            height={isMobile ? 80 : 160}
            className="rounded-full border-4 border-primary/30 hover:border-primary/50 transition-colors"
          />
          <span className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-primary tracking-wide hover:text-primary/80 transition-colors`}>
            Rhodes Island
          </span>
        </Link>

        {/* 用户头像/登录按钮 */}
        <UserAvatar onLoginClick={() => setShowLoginModal(true)} />
      </nav>

      {/* 主要内容 */}
      <div className="flex-1 w-full relative">
        <PosterGallery onSelectPoster={(id) => setSelectedId(id)} />
      </div>

      {/* 大图展示 */}
      <PosterBigDisplay selectedId={selectedId} />

      {/* 登录模态框 */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </main>
  );
}
