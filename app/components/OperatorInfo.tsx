import { motion, AnimatePresence } from 'framer-motion';

interface OperatorInfoProps {
  operatorId: number | null;
  isVisible: boolean;
}

const operatorData: Record<number, {
  name: string;
  title: string;
  description: string;
  faction: string;
  profession: string;
}> = {
  27: {
    name: '凯尔希',
    title: '罗德岛医疗主管',
    description: '罗德岛最高管理者之一，负责罗德岛的医疗部门。拥有渊博的学识和丰富的临床经验，同时也精通战术指挥。',
    faction: '罗德岛',
    profession: '医疗'
  },
  18: {
    name: '能天使',
    title: '企鹅物流投递员',
    description: '来自拉特兰的神秘使者，现为企鹅物流的王牌快递员。性格开朗活泼，热爱美食。精通各种枪械的使用。',
    faction: '企鹅物流',
    profession: '狙击'
  }
};

export default function OperatorInfo({ operatorId, isVisible }: OperatorInfoProps) {
  const operator = operatorId ? operatorData[operatorId] : null;

  return (
    <AnimatePresence>
      {isVisible && operator && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed left-12 bottom-48 w-96 bg-black/40 backdrop-blur-xl rounded-lg p-8 border border-primary/30"
        >
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* 干员名称和职业 */}
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-primary tracking-wider">
                  {operator.name}
                </h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-primary/70 border border-primary/30 px-2 py-0.5 rounded">
                    {operator.profession}
                  </span>
                  <span className="text-sm text-primary/70">
                    {operator.faction}
                  </span>
                </div>
              </div>

              {/* 职位头衔 */}
              <div className="border-l-2 border-primary/30 pl-4">
                <p className="text-lg text-primary/90">
                  {operator.title}
                </p>
              </div>

              {/* 描述文本 */}
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-primary/70">
                  {operator.description}
                </p>
              </div>
            </motion.div>
          </div>

          {/* 装饰背景 */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-full animate-pulse" />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
} 