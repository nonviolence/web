import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';

export default function OperatorGallery() {
  const [operators, setOperators] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const operatorNumbers = [
      18, 19, 20, 23, 24, 25, 27, 28,
      30, 31, 32, 34, 35, 36, 37, 38,
      39, 40, 42, 43, 53, 54, 55
    ];
    
    const operatorImages = operatorNumbers.map(num => `/images/operator_${num}.png`);
    setOperators(operatorImages);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm"
    >
      <div className="relative max-w-7xl mx-auto h-full">
        <div 
          ref={containerRef}
          className="h-full overflow-x-auto scrollbar-hide"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="flex items-center space-x-4 p-4 h-full">
            {operators.map((src, index) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05
                }}
                className="relative flex-none w-24 h-24 rounded-lg overflow-hidden cursor-grab group"
              >
                <Image
                  src={src}
                  alt={`Operator ${index + 1}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                  draggable={false}
                  priority={index < 8}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 