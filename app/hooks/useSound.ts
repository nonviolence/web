'use client';

import { useEffect, useRef } from 'react';

interface AudioContext extends BaseAudioContext {
  webkitAudioContext?: typeof AudioContext;
}

// 创建音频上下文和音调生成器
const createTone = (frequency: number, duration: number) => {
  const audioContext = new (window.AudioContext || (window as unknown as AudioContext).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};

export function useSound(soundUrl: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(soundUrl);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundUrl]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error: Error) => {
        console.error('播放音频失败:', error);
      });
    }
  };

  return { play };
}

export const useSoundOld = () => {
  // 发送消息音效
  const playSendSound = () => {
    createTone(880, 0.1); // A5音，持续0.1秒
  };

  // 接收消息音效
  const playReceiveSound = () => {
    createTone(587.33, 0.1); // D5音，持续0.1秒
  };

  // 打字音效
  const playTypeSound = () => {
    createTone(1760, 0.02); // A6音，持续0.02秒
  };

  return {
    playSendSound,
    playReceiveSound,
    playTypeSound
  };
}; 