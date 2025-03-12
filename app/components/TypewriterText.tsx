'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  onType?: () => void;
}

export default function TypewriterText({ 
  text, 
  delay = 50, 
  className = "",
  onComplete,
  onType
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        // 播放打字音效
        onType?.();
      }, delay);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete, onType]);

  // 光标闪烁效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCursor(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {displayedText}
      <AnimatePresence>
        {cursor && currentIndex < text.length && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-primary"
          >
            ▋
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
} 