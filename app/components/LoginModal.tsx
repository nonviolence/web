'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(email, password);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          console.error('该邮箱已被注册');
        } else if (error.message.includes('auth/invalid-credential')) {
          console.error('邮箱或密码错误');
        } else if (error.message.includes('auth/weak-password')) {
          console.error('密码强度不够，请使用至少6位字符');
        } else {
          console.error('登录失败，请检查邮箱和密码是否正确');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('登录失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md p-8 bg-gray-900/90 rounded-xl shadow-2xl border-2 border-primary/30"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary mb-2">罗德岛终端</h2>
              <p className="text-primary/70">请登录以继续访问</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary/40 text-white"
                  placeholder="请输入邮箱"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-black/20 border border-primary/20 rounded-lg focus:outline-none focus:border-primary/40 text-white"
                  placeholder="请输入密码"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-primary/20 hover:bg-primary/30 text-primary font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-primary/50">或</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <span className="text-xl">G</span>
                <span>使用 Google 账号登录</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 