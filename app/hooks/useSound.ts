'use client';

import { useCallback } from 'react';

// 创建音频上下文和音调生成器
const createTone = (frequency: number, duration: number) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

export const useSound = () => {
  // 发送消息音效
  const playSendSound = useCallback(() => {
    createTone(880, 0.1); // A5音，持续0.1秒
  }, []);

  // 接收消息音效
  const playReceiveSound = useCallback(() => {
    createTone(587.33, 0.1); // D5音，持续0.1秒
  }, []);

  // 打字音效
  const playTypeSound = useCallback(() => {
    createTone(1760, 0.02); // A6音，持续0.02秒
  }, []);

  return {
    playSendSound,
    playReceiveSound,
    playTypeSound
  };
}; 