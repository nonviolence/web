import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { useFirestore } from '../hooks/useFirestore';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
  isRead?: boolean;
}

interface PosterInfo {
  id: number;
  name: string;
  title: string;
  description: string;
  profession: string;
  position: string;
  faction: string;
  skill: string;
  story: string;
  personality?: string;
  avatarPosition?: {
    top: number;
    scale: number;
  };
  speechStyle: {
    formality: 'formal' | 'casual' | 'mixed';
    emotionality: 'reserved' | 'expressive' | 'balanced';
    tempo: 'quick' | 'measured' | 'deliberate';
  };
  traits: string[];
  quirks: string[];
  relationships: {
    [key: string]: string;
  };
}

const posterData: Record<number, PosterInfo> = {
  1: {
    id: 1,
    name: "凯尔希",
    title: "前路的指引者",
    profession: "医疗",
    position: "高级干员",
    faction: "罗德岛",
    description: "罗德岛医疗部门的领袖，同时也是罗德岛最高决策层的重要成员。",
    skill: "Mon3tr / 断罪影镰 / 死亡判决",
    story: "作为罗德岛的顶尖医疗专家与决策人，凯尔希博士在感染者医疗救治领域拥有无可比拟的权威性。她为人处事严厉认真，对待工作一丝不苟，是罗德岛医疗部门不可或缺的灵魂人物。尽管她时常表现出冷淡疏离的一面，但在重要关头总能给出最准确的判断和最可靠的支持。",
    personality: "严谨认真，冷静理性，关心他人但不轻易表露",
    avatarPosition: {
      top: 20,
      scale: 1.8
    },
    speechStyle: {
      formality: 'formal',
      emotionality: 'reserved',
      tempo: 'measured'
    },
    traits: ['专业', '严谨', '冷静'],
    quirks: ['不喜欢被打扰', '对细节要求极高'],
    relationships: {
      '阿米娅': '作为导师和监护人，对其成长给予指导',
      '博士': '以专业和理性的态度合作，但保持一定距离',
      '华法琳': '医疗部门的重要同事，相互尊重'
    }
  },
  2: {
    id: 2,
    name: "阿米娅",
    title: "罗德岛的希望",
    profession: "术师",
    position: "近卫/术师",
    faction: "罗德岛",
    description: "罗德岛的公开领袖，天才源石技艺术士，同时也是一位可靠的战术指挥。",
    skill: "精神爆发 / 王者之心 / 黑兽暴走",
    story: "阿米娅是罗德岛的灵魂，她年纪轻轻就展现出了惊人的领导才能。作为一名天才源石技艺术士，她不仅具备强大的战斗能力，更重要的是她那颗永远向着希望的心。她坚信通过努力可以改变感染者的命运，这份信念感染着罗德岛的每一个人。",
    personality: "温柔坚定，充满希望，富有同理心和领导才能",
    avatarPosition: {
      top: 30,
      scale: 1.6
    },
    speechStyle: {
      formality: 'casual',
      emotionality: 'expressive',
      tempo: 'quick'
    },
    traits: ['温柔', '坚定', '有领导才能'],
    quirks: ['经常忘记时间', '对感染者问题非常关心'],
    relationships: {
      '博士': '深深信任并愿意追随',
      '凯尔希': '视为重要的导师和长辈',
      '罗德岛员工': '以领袖身份关心每一位员工'
    }
  },
  3: {
    id: 3,
    name: "陈",
    title: "龙门近卫局特别督察组组长",
    profession: "近卫",
    position: "高级干员",
    faction: "龙门近卫局",
    description: "龙门近卫局特别督察组组长，精通各类剑术，尤其擅长快速斩击。",
    skill: "赤霄·拔刀 / 赤霄·绝影 / 赤霄·无归",
    story: "陈是龙门近卫局的精英干员，作为特别督察组的组长，她以雷厉风行的作风和精湛的剑术闻名。她对龙门的安全抱有强烈的责任感，同时也在寻找着自己的武道真谛。虽然表面冷峻，但内心深处却有着对正义的执着追求。",
    personality: "雷厉风行，正直果断，对正义有着执着的追求",
    avatarPosition: {
      top: 25,
      scale: 1.7
    },
    speechStyle: {
      formality: 'formal',
      emotionality: 'reserved',
      tempo: 'measured'
    },
    traits: ['雷厉风行', '正直', '对正义有执着追求'],
    quirks: ['不喜欢被打扰', '对细节要求极高'],
    relationships: {
      '博士': '保持专业的工作关系',
      '魏彦吾': '对龙门近卫局局长保持敬重',
      '星熊': '共事的同僚，相互信任'
    }
  },
  4: {
    id: 4,
    name: "能天使",
    title: "企鹅物流的王牌",
    profession: "狙击",
    position: "高级干员",
    faction: "企鹅物流",
    description: "来自拉特兰的神秘使者，现为企鹅物流的王牌快递员。",
    skill: "速射模式 / 凝滞射击 / 榴弹扫射",
    story: "能天使是企鹅物流中最为活跃的成员之一。她开朗活泼的性格和专业的投递能力让她在龙门和罗德岛都收获了不少好评。作为一名精通速射的狙击手，她在战场上总能给敌人带来意想不到的惊喜。她热爱美食，尤其喜欢各种零食，经常能在任务之余看到她享用小吃的身影。",
    personality: "开朗活泼，热爱美食，做事专业且充满热情",
    avatarPosition: {
      top: 20,
      scale: 1.8
    },
    speechStyle: {
      formality: 'casual',
      emotionality: 'expressive',
      tempo: 'quick'
    },
    traits: ['开朗', '热爱美食', '专业'],
    quirks: ['经常忘记时间', '对细节要求极高'],
    relationships: {
      '德克萨斯': '亲密的工作搭档',
      '拉普兰德': '关系复杂的老相识',
      '博士': '保持友好的合作关系'
    }
  },
  5: {
    id: 5,
    name: "白面鸮",
    title: "罗德岛医疗主任",
    profession: "医疗",
    position: "高级干员",
    faction: "罗德岛",
    description: "罗德岛医疗部门的主要负责人之一，专精于神经系统治疗。",
    skill: "医疗力场 / 治愈之光 / 涤罪之光",
    story: "白面鸮是罗德岛医疗部门的中坚力量，作为一名经验丰富的神经科专家，她在治疗源石病方面有着独特的见解。她性格温和，对待病人总是充满耐心，但在必要时也能展现出专业人士的严厉。在工作之余，她喜欢研究医学文献，始终保持着对医学的热情。",
    personality: "温和耐心，专业严谨，对医学充满热情",
    avatarPosition: {
      top: 25,
      scale: 1.7
    },
    speechStyle: {
      formality: 'formal',
      emotionality: 'balanced',
      tempo: 'measured'
    },
    traits: ['温和', '耐心', '专业'],
    quirks: ['对细节要求极高', '不喜欢被打扰'],
    relationships: {
      '凯尔希': '尊重的上级',
      '病人们': '以医者之心关怀每位病人',
      '博士': '专业的医疗顾问关系'
    }
  },
  6: {
    id: 6,
    name: "德克萨斯",
    title: "企鹅物流信任的副手",
    profession: "先锋",
    position: "高级干员",
    faction: "企鹅物流",
    description: "企鹅物流的副队长，冷静可靠的战术家。",
    skill: "剑雨 / 二重打击 / 霜华",
    story: "德克萨斯是企鹅物流的副队长，以其冷静的判断力和精湛的剑术闻名。她行事果断，作风干练，是企鹅物流不可或缺的中坚力量。虽然平时给人以生人勿近的印象，但她对同伴却抱有极强的责任感和保护欲。在战斗中，她总是冷静地分析局势，用最有效的方式解决问题。",
    personality: "冷静可靠，行事果断，对同伴有保护欲",
    avatarPosition: {
      top: 20,
      scale: 1.8
    },
    speechStyle: {
      formality: 'formal',
      emotionality: 'reserved',
      tempo: 'measured'
    },
    traits: ['冷静', '行事果断', '对同伴有保护欲'],
    quirks: ['不喜欢被打扰', '对细节要求极高'],
    relationships: {
      '能天使': '搭档关系，但时常感到头疼',
      '拉普兰德': '复杂的过往',
      '博士': '保持专业距离的合作关系'
    }
  }
};

// 修改 TypewriterText 组件的接口定义
interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
  onComplete?: () => void;
  messageId: number; // 添加消息ID用于跟踪
}

// 提取 markdownComponents 到组件外部
const markdownComponents: Partial<Components> = {
  code: ({className, children}) => {
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto">
        <code className={className}>
          {children}
        </code>
      </pre>
    ) : (
      <code className="bg-black/30 px-1 rounded">
        {children}
      </code>
    );
  },
  a: ({children, href}) => (
    <a href={href} className="text-primary hover:text-primary/80 underline">
      {children}
    </a>
  ),
  ul: ({children}) => (
    <ul className="list-disc list-inside my-2">
      {children}
    </ul>
  ),
  ol: ({children}) => (
    <ol className="list-decimal list-inside my-2">
      {children}
    </ol>
  ),
  table: ({children}) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-primary/20">
        {children}
      </table>
    </div>
  ),
  th: ({children}) => (
    <th className="px-4 py-2 bg-primary/10 text-left">
      {children}
    </th>
  ),
  td: ({children}) => (
    <td className="px-4 py-2 border-t border-primary/10">
      {children}
    </td>
  )
};

// TypewriterText 组件
const TypewriterText: React.FC<TypewriterTextProps> = ({ text, delay = 0.05, className = "", onComplete, messageId }) => {
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdRef = useRef(messageId);
  const textRef = useRef(text);
  const displayTextRef = useRef(displayText);
  const isActiveRef = useRef(true);
  const isTypingRef = useRef(false);

  useEffect(() => {
    isActiveRef.current = true;
    
    // 重置状态
    if (messageIdRef.current !== messageId || textRef.current !== text) {
      messageIdRef.current = messageId;
      textRef.current = text;
      setDisplayText("");
      setIsTypingComplete(false);
      displayTextRef.current = "";
      isTypingRef.current = false;
    }

    // 如果已经完成打字或已经在打字中，则不重新开始
    if (isTypingComplete || displayTextRef.current === text) return;

    let currentIndex = displayTextRef.current.length;
    
    const typeNextChar = () => {
      if (!isActiveRef.current) return;
      
      if (currentIndex < text.length) {
        const newText = text.slice(0, currentIndex + 1);
        setDisplayText(newText);
        displayTextRef.current = newText;
        currentIndex++;

        // 只在打字效果进行时才执行滚动
        if (!isTypingComplete && currentIndex < text.length) {
          requestAnimationFrame(() => {
            const chatContainer = document.querySelector('.custom-scrollbar');
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          });
        }

        timeoutRef.current = setTimeout(typeNextChar, delay * 1000);
      } else {
        setIsTypingComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    timeoutRef.current = setTimeout(typeNextChar, delay * 1000);

    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, delay, onComplete, messageId, isTypingComplete]);

  return (
    <div className={`inline-block w-full ${className}`}>
      <div 
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          width: "100%"
        }}
        className="prose prose-invert max-w-none"
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {displayText}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// 添加头像组件
const CharacterAvatar: React.FC<{ posterId: number; className?: string }> = ({ posterId, className = "" }) => {
  return (
    <div className={`relative w-12 h-12 rounded-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-primary/20" />
      <div className="absolute inset-0">
        <Image
          src={`/images/poster_${posterId}.png`}
          alt="Character Avatar"
          fill
          sizes="(max-width: 768px) 40px, 48px"
          className="object-cover"
          style={{
            objectPosition: `center ${posterData[posterId]?.avatarPosition?.top || 20}%`,
            transform: `scale(${posterData[posterId]?.avatarPosition?.scale || 1.5})`
          }}
        />
      </div>
    </div>
  );
};

// 添加本地存储相关的常量和工具函数
const STORAGE_KEY = 'rhodesAI_chatHistories';

// 用于保存聊天记录到 localStorage
const saveToLocalStorage = (histories: Record<number, Message[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
  } catch (error) {
    console.error('保存聊天记录失败:', error);
  }
};

// 从 localStorage 加载聊天记录
const loadFromLocalStorage = (): Record<number, Message[]> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error('加载聊天记录失败:', error);
    return {};
  }
};

// 在 TypewriterText 组件之前添加
interface ChatHistoryProps {
  messages: Message[];
  selectedId: number | null;
  isTyping: boolean;
  isTypingComplete: boolean;
  onScrollToBottom: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  messages,
  selectedId,
  isTyping,
  isTypingComplete,
  onScrollToBottom
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef<number | undefined>(undefined);

  // 添加平滑滚动函数
  const smoothScroll = useCallback((element: HTMLElement, target: number, duration: number) => {
    const start = element.scrollTop;
    const distance = target - start;
    const startTime = performance.now();

    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
    }

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      element.scrollTop = start + distance * progress;

      if (progress < 1) {
        scrollAnimationRef.current = requestAnimationFrame(animateScroll);
      }
    };

    scrollAnimationRef.current = requestAnimationFrame(animateScroll);
  }, []);

  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      // 首次加载时,直接设置滚动位置到底部
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
      setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  useEffect(() => {
    // 如果在底部且收到新消息,使用自定义平滑滚动
    if (isAtBottom && listRef.current) {
      smoothScroll(
        listRef.current,
        listRef.current.scrollHeight,
        1000 // 1秒完成滚动
      );
    }
  }, [messages, isAtBottom, smoothScroll]);

  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={listRef}
        className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.timestamp}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} relative group w-full`}
          >
            {message.role === 'assistant' && selectedId && (
              <CharacterAvatar posterId={selectedId} className="w-8 h-8 mr-2 flex-shrink-0" />
            )}
            <div className={`max-w-[calc(100%-80px)] rounded-lg px-4 py-2 ${
              message.role === 'user' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-gray-800/60 text-white prose prose-invert prose-sm max-w-none'
            }`}>
              <div className="text-sm relative min-h-[1.25rem] break-words">
                {message.role === 'assistant' ? (
                  message === messages[messages.length - 1] && isTyping ? (
                    <TypewriterText 
                      messageId={message.timestamp}
                      text={message.content} 
                      delay={0.02} 
                      onComplete={() => {
                        onScrollToBottom();
                      }}
                      className="prose-headings:mt-0 prose-headings:mb-2 prose-p:my-1 prose-hr:my-2"
                    />
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )
                ) : (
                  message.content
                )}
              </div>
              <div className="flex items-center justify-end mt-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary/50">
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                {message.role === 'user' && (
                  <span>
                    {message.status === 'sending' && '发送中...'}
                    {message.status === 'sent' && '已发送'}
                    {message.status === 'error' && '发送失败'}
                  </span>
                )}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ml-2 flex-shrink-0">
                <span className="text-sm text-primary">我</span>
              </div>
            )}
          </motion.div>
        ))}

        {/* 打字中状态组件 */}
        {isTyping && !isTypingComplete && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex justify-start items-center"
          >
            <CharacterAvatar posterId={selectedId || 1} className="w-8 h-8 mr-2" />
            <div className="bg-gray-800/60 rounded-lg px-4 py-2">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-primary/70">
                  {selectedId && (
                    <>
                      {selectedId === 1 && "博士，请稍等片刻，让我仔细思考一下这个问题..."}
                      {selectedId === 2 && "博士，我需要一点时间来整理思绪..."}
                      {selectedId === 3 && "博士稍等，我正在分析这个情况。"}
                      {selectedId === 4 && "哎呀博士，让我想想看~"}
                      {selectedId === 5 && "博士请稍候，我正在认真思考这个问题。"}
                      {selectedId === 6 && "......（正在思考）"}
                    </>
                  )}
                </p>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

interface PosterGalleryProps {
  onSelectPoster?: (id: number) => void;
}

export default function PosterGallery({ onSelectPoster }: PosterGalleryProps) {
  const { user, signOut } = useAuth();
  const [posters, setPosters] = useState<string[]>([]);
  const [selectedPoster, setSelectedPoster] = useState<PosterInfo | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string; }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPosterId = useRef<number | null>(null);
  const touchMoveHandler = useRef<((e: TouchEvent) => void) | null>(null);
  
  const { messages, loading, error, saveMessage } = useFirestore(selectedId);

  // 将 scrollToBottom 移到这里
  const scrollToBottom = useCallback(() => {
    setIsTypingComplete(true);
  }, []);

  useEffect(() => {
    // 预加载图片并只保留成功加载的
    const posterIds = Object.keys(posterData).map(Number);
    const posterImages = posterIds.map(id => `/images/poster_${id}.png`);
    
    Promise.all(
      posterImages.map(src => 
        new Promise<string>((resolve, reject) => {
          const img = new globalThis.Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject();
          img.src = src;
        }).catch(() => null)
      )
    ).then(results => {
      const validImages = results.filter((src): src is string => src !== null);
      setPosters(validImages);
      setLoadedImages(new Set(validImages));
    });
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile(); // 初始检查
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('退出失败:', error);
      setErrorMessage('退出失败，请稍后重试');
    }
  };

  // 如果用户未登录，不显示任何内容
  if (!user) {
    return null;
  }

  const handlePosterClick = (index: number) => {
    if (isDragging) return;
    const src = posters[index];
    const posterId = parseInt(src.match(/poster_(\d+)/)?.[1] || '0');
    const newPoster = posterData[posterId];
    
    if (newPoster) {
      if (selectedId !== posterId) {
        setInputMessage('');
        setIsTyping(false);
        setIsTypingComplete(true);
        setConversationHistory([]);
        setSelectedId(posterId);
        setSelectedPoster(null);
        
        setTimeout(() => {
          setSelectedPoster(newPoster);
        }, 300);
        
        onSelectPoster?.(posterId);
      } else {
        setSelectedPoster(selectedPoster === null ? newPoster : null);
      }
      lastPosterId.current = posterId;
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    const currentPoster = selectedId ? posterData[selectedId] : null;
    
    if (!trimmedMessage || !currentPoster || isTyping || !user) {
      return;
    }

    setInputMessage('');
    setIsTyping(true);
    setIsTypingComplete(false);
    setErrorMessage(null);

    try {
      // 保存用户消息到 Firestore
      await saveMessage({
        role: 'user',
        content: trimmedMessage,
        status: 'sending'
      });

      const newHistory = [
        { role: 'system', content: generateSystemPrompt(currentPoster) },
        ...conversationHistory,
        { role: 'user', content: trimmedMessage }
      ];

      const data = await fetchWithRetry('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newHistory }),
      });

      setConversationHistory([
        ...newHistory,
        { role: 'assistant', content: data.content }
      ]);

      // 保存助手回复到 Firestore
      await saveMessage({
        role: 'assistant',
        content: data.content,
        status: 'sent',
        isRead: false
      });

      setTimeout(() => {
        setIsTyping(false);
      }, data.content.length * 20 + 500);

    } catch (error) {
      console.error('发送消息失败:', error);
      
      let errorMsg = '发送失败，请稍后重试';
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('504')) {
          errorMsg = '请求超时，请稍后重试';
        } else if (error.message.includes('429')) {
          errorMsg = '请求过于频繁，请稍后再试';
        } else if (error.message.includes('401')) {
          errorMsg = 'API认证失败，请联系管理员';
        }
      }
      
      setErrorMessage(errorMsg);
      setIsTyping(false);
    }
  };

  const generateSystemPrompt = (character: PosterInfo) => {
    const formalityGuide = {
      formal: '使用正式、礼貌的语言，保持专业性',
      casual: '使用轻松、自然的语言，语气亲和',
      mixed: '根据场合灵活调整语言的正式程度'
    };

    const emotionalityGuide = {
      reserved: '情感表达克制，保持理性和冷静',
      expressive: '情感表达丰富，自然流露感情',
      balanced: '情感表达适度，保持平衡'
    };

    const tempoGuide = {
      quick: '语速较快，反应敏捷',
      measured: '语速适中，思考后再说',
      deliberate: '语速从容，深思熟虑'
    };

    return `你现在扮演明日方舟中的角色"${character.name}"进行对话。

角色设定：
- 名字：${character.name}
- 职位：${character.title}
- 性格：${character.personality}
- 背景：${character.story}

详细性格指南：
1. 说话风格：
   - ${formalityGuide[character.speechStyle.formality]}
   - ${emotionalityGuide[character.speechStyle.emotionality]}
   - ${tempoGuide[character.speechStyle.tempo]}

2. 核心性格特质：
${character.traits.map(trait => `   - ${trait}`).join('\n')}

3. 独特习惯：
${character.quirks.map(quirk => `   - ${quirk}`).join('\n')}

4. 与他人关系：
${Object.entries(character.relationships).map(([name, relation]) => `   - 与${name}：${relation}`).join('\n')}

交互准则：
1. 严格遵循角色的性格特点和说话风格
2. 保持对话的连贯性和角色特征的一致性
3. 根据场景和对话内容适当展现角色的独特习惯
4. 回应要自然，避免过于做作
5. 在保持角色特征的同时，确保回答的实用性和帮助性

请以此角色身份进行对话，确保每次回应都符合上述设定。`;
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 50000); // 50秒超时
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (detailsRef.current?.contains(e.target as Node)) {
      return;
    }
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (detailsRef.current?.contains(e.target as Node)) {
      return;
    }
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePosterHover = (index: number) => {
    if (isDragging) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      const src = posters[index];
      const posterId = parseInt(src.match(/poster_(\d+)/)?.[1] || '0');
      const newPoster = posterData[posterId];
      
      if (newPoster) {
        setSelectedPoster(newPoster);
        lastPosterId.current = posterId;
      }
    }, 300);
  };

  const handlePosterHoverEnd = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    setErrorMessage(null);

    const touchMoveListener = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = (e as TouchEvent).touches[0].pageX;
      const walk = (startX - x) * 2;
      if (containerRef.current) {
        containerRef.current.scrollLeft = scrollLeft + walk;
      }
    };

    touchMoveHandler.current = touchMoveListener;

    if (containerRef.current) {
      containerRef.current.addEventListener('touchmove', touchMoveListener, { passive: false });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (containerRef.current && touchMoveHandler.current) {
      containerRef.current.removeEventListener('touchmove', touchMoveHandler.current);
      touchMoveHandler.current = null;
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* 背景图层 */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* 后景层 */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/chat_bg.png"
                alt="Background"
                className="object-cover md:object-contain opacity-5"
                sizes="100vw"
                fill
                priority
                style={{
                  objectPosition: 'center'
                }}
              />
            </div>
          </div>
        </div>
        {/* 前景层 */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/chat_bg.png"
                alt="Foreground"
                className="object-cover md:object-contain opacity-10"
                sizes="100vw"
                fill
                priority
                style={{
                  objectPosition: 'center'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 添加错误提示 */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        </div>
      )}

      {/* 移动端四行布局 */}
      {isMobile ? (
        <div className="fixed inset-0 z-10 flex flex-col h-screen">
          {/* 第一行：Logo (8%的高度) */}
          <div className="h-[8vh] bg-black/40 backdrop-blur-sm flex items-center justify-between relative px-4">
            <div className="absolute inset-0 bg-black/40" />
            <h1 className="text-2xl font-bold text-primary relative z-10">罗德岛终端</h1>
            <button
              onClick={handleSignOut}
              className="relative z-10 px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
            >
              退出登录
            </button>
          </div>

          {/* 第二行：海报列表 (15%的高度) */}
          <div className="h-[15vh] bg-black/40 backdrop-blur-sm">
            <div className="h-full px-2 py-1">
              <div 
                ref={containerRef}
                className="h-full overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing whitespace-nowrap"
                onWheel={(e) => {
                  e.preventDefault();
                  if (containerRef.current) {
                    containerRef.current.scrollLeft += e.deltaY;
                  }
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="flex space-x-2 h-full items-center min-w-max">
                  {posters.map((src, index) => (
                    loadedImages.has(src) && (
                      <motion.div
                        key={src}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative rounded-lg overflow-hidden cursor-pointer group flex-none w-[70px] h-[130px]"
                        onClick={() => !isDragging && handlePosterClick(index)}
                        onMouseEnter={() => handlePosterHover(index)}
                        onMouseLeave={handlePosterHoverEnd}
                      >
                        <Image
                          src={src}
                          alt={`Poster ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 70px, 80px"
                          className={`object-contain transition-all duration-300 ${
                            selectedPoster?.id === index + 1 ? 'scale-105' : 'group-hover:scale-105'
                          }`}
                          priority={index < 4}
                          draggable={false}
                        />
                      </motion.div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 第三行：详情弹窗 (22%的高度) */}
          <div className="h-[22vh] bg-black/30 backdrop-blur-sm overflow-hidden">
            <AnimatePresence>
              {selectedPoster && (
                <motion.div
                  ref={detailsRef}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full w-full overflow-y-auto custom-scrollbar"
                  onWheel={(e) => {
                    const element = e.currentTarget;
                    if (element.scrollHeight > element.clientHeight) {
                      e.stopPropagation();
                    } else {
                      e.preventDefault();
                    }
                  }}
                  onTouchStart={(e) => {
                    const element = e.currentTarget;
                    if (element.scrollHeight > element.clientHeight) {
                      e.stopPropagation();
                    }
                  }}
                  onTouchMove={(e) => {
                    const element = e.currentTarget;
                    if (element.scrollHeight > element.clientHeight) {
                      e.stopPropagation();
                    }
                  }}
                >
                  <div className="p-3 space-y-2">
                    <div>
                      <h2 className="text-lg font-bold text-primary mb-1">{selectedPoster.name}</h2>
                      <p className="text-xs text-primary/70">{selectedPoster.title}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-primary/70">{selectedPoster.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="px-1.5 py-0.5 bg-primary/10 rounded-full text-[10px] text-primary">
                          {selectedPoster.profession}
                        </span>
                        <span className="px-1.5 py-0.5 bg-primary/10 rounded-full text-[10px] text-primary">
                          {selectedPoster.position}
                        </span>
                        <span className="px-1.5 py-0.5 bg-primary/10 rounded-full text-[10px] text-primary">
                          {selectedPoster.faction}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-primary">技能</h3>
                      <p className="text-xs text-primary/70">{selectedPoster.skill}</p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-primary">性格特征</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedPoster.traits.map((trait, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-primary/10 rounded-full text-[10px] text-primary">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-primary">背景故事</h3>
                      <p className="text-xs text-primary/70">{selectedPoster.story}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 第四行：聊天窗口 (5.5/10的高度) */}
          <div className="h-[55vh] bg-black/40 backdrop-blur-md border-t border-white/10">
            <div className="h-full flex flex-col">
              {selectedId ? (
                <>
                  {/* 头部信息 */}
                  <div className="flex-none p-3 border-b border-white/10 flex items-center">
                    <CharacterAvatar posterId={selectedId} className="w-10 h-10" />
                    <div className="ml-3">
                      <h3 className="text-base font-bold text-primary">
                        {posterData[selectedId].name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {posterData[selectedId].title}
                      </p>
                    </div>
                  </div>

                  {/* 聊天历史记录 */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <ChatHistory
                      messages={messages}
                      selectedId={selectedId}
                      isTyping={isTyping}
                      isTypingComplete={isTypingComplete}
                      onScrollToBottom={scrollToBottom}
                    />
                  </div>

                  {/* 在聊天窗口的输入框上方添加错误消息显示 */}
                  {errorMessage && (
                    <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg mx-3 mb-2">
                      {errorMessage}
                    </div>
                  )}

                  {/* 输入框区域 */}
                  <div className="flex-none p-3 border-t border-white/10">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex space-x-2"
                    >
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`与 ${posterData[selectedId].name} 对话...`}
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400"
                        disabled={isTyping}
                      />
                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isTyping}
                        className="px-3 py-2 bg-primary/20 text-primary rounded-lg disabled:opacity-50 text-sm"
                      >
                        发送
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                    <span className="text-xl text-primary">👋</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">欢迎来到罗德岛</h3>
                  <p className="text-xs text-gray-400">
                    请从上方选择一位干员开始对话
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // 桌面端布局
        <>
          {/* 添加退出按钮到桌面端布局 */}
          <div className="fixed top-4 right-4 z-30">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
            >
              退出登录
            </button>
          </div>

          {/* 聊天界面 */}
          <div className="fixed top-0 right-0 h-screen w-[400px] bg-black/40 backdrop-blur-md border-l border-white/10 z-20">
            {/* ... existing desktop chat interface code ... */}
          </div>

          {/* 海报展示区域 */}
          <div className="fixed left-8 top-32 w-[30vw] z-40">
            {/* ... existing desktop poster gallery code ... */}
          </div>
        </>
      )}
    </div>
  );
}