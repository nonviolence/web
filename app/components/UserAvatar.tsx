'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';

interface UserAvatarProps {
  onLoginClick: () => void;
}

export default function UserAvatar({ onLoginClick }: UserAvatarProps) {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center space-x-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
      >
        <span className="text-primary">主策登录</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-2 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center overflow-hidden">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt="User Avatar"
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <span className="text-primary text-sm">
              {user.email?.[0].toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <span className="text-primary">{user.email?.split('@')[0] || '主策'}</span>
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 py-2 bg-gray-900 rounded-lg shadow-xl border border-primary/20"
          >
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-primary hover:bg-primary/20 transition-colors"
            >
              退出登录
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 