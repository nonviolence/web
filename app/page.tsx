'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import TypewriterText from './components/TypewriterText';
import OperatorGallery from './components/OperatorGallery';
import Image from 'next/image';
import { getRandomResponse } from './utils/responses';
import { useSound } from './hooks/useSound';
import PosterGallery from './components/PosterGallery';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  typing?: boolean;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [isGreetingDone, setIsGreetingDone] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '博士，欢迎回到罗德岛。我是您的智能助手阿米娅，有什么我可以帮您的吗？',
      sender: 'ai',
      typing: true
    }
  ]);

  const { playSendSound, playReceiveSound, playTypeSound } = useSound();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isGreetingDone) return;

    // 播放发送音效
    playSendSound();

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // 添加AI正在输入的消息
    const tempAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '正在思考...',
      sender: 'ai',
      typing: true
    };
    setMessages(prev => [...prev, tempAiMessage]);

    // 模拟AI响应
    setTimeout(() => {
      playReceiveSound();
      const aiResponse = getRandomResponse(userMessage.text);
      setMessages(prev => prev.map(msg => 
        msg.id === tempAiMessage.id 
          ? { ...msg, text: aiResponse, typing: true }
          : msg
      ));
    }, 1000);
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* Logo */}
      <div className="fixed top-8 right-8 w-40 h-40">
        <Image
          src="/images/logo_50.png"
          alt="Rhodes Island Logo"
          width={160}
          height={160}
          className="w-full h-full object-contain opacity-80"
          priority
        />
      </div>

      {/* 左侧海报展示 */}
      <PosterGallery />

      {/* 底部干员列表 */}
      <OperatorGallery />
    </main>
  );
}
