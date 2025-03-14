'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  isRead?: boolean;
}

export function useFirestore(characterId: number | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !characterId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const chatsRef = collection(db, 'chats');
    
    // 尝试使用简化的查询，直到索引准备就绪
    const q = query(
      chatsRef,
      where('userId', '==', user.uid),
      where('characterId', '==', characterId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          const newMessages = snapshot.docs
            .map(doc => {
              const data = doc.data();
              return {
                ...data,
                timestamp: data.timestamp instanceof Timestamp 
                  ? data.timestamp.toMillis() 
                  : data.timestamp,
              } as Message;
            })
            .sort((a, b) => a.timestamp - b.timestamp); // 在内存中排序

          setMessages(newMessages);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing messages:', err);
          setError('处理消息时出错');
          setLoading(false);
        }
      }, 
      (error) => {
        console.error('Error fetching messages:', error);
        setError('获取消息时出错，请稍后再试');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, characterId]);

  const saveMessage = async (message: Omit<Message, 'timestamp'>) => {
    if (!user || !characterId) return;

    try {
      setError(null);
      await addDoc(collection(db, 'chats'), {
        ...message,
        userId: user.uid,
        characterId,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving message:', error);
      setError('保存消息时出错，请重试');
      throw error;
    }
  };

  const updateMessageStatus = async (messageId: string, status: Message['status']) => {
    if (!user || !characterId) return;

    try {
      setError(null);
      const messageRef = doc(db, 'chats', messageId);
      await setDoc(messageRef, { status }, { merge: true });
    } catch (error) {
      console.error('更新消息状态失败:', error);
      setError('更新消息状态时出错');
      throw error;
    }
  };

  return {
    messages,
    loading,
    error,
    saveMessage,
    updateMessageStatus
  };
} 