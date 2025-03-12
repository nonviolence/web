// AI 响应模板
const responses = [
  {
    keywords: ['你好', '嗨', 'hi', 'hello'],
    responses: [
      '博士，今天过得如何？罗德岛的工作还顺利吗？',
      '博士，很高兴见到您！今天的数据分析工作进展得不错。',
      '博士！我刚完成了一批源石技艺的研究报告，要看看吗？'
    ]
  },
  {
    keywords: ['源石', '矿石病', '感染者'],
    responses: [
      '博士，源石技艺的研究一直是罗德岛的重点项目。我们在寻找治愈矿石病的道路上永不停歇。',
      '每一位感染者都值得被温柔以待。这也是罗德岛存在的意义，不是吗？',
      '博士，我们一定能找到治愈矿石病的方法。这是我的信念。'
    ]
  },
  {
    keywords: ['罗德岛', '基建', '工作'],
    responses: [
      '博士，基建运转正常，所有干员都在各自的岗位上尽职工作。',
      '今天的会议记录我已经整理好了，需要我为您汇报吗？',
      '博士，您太辛苦了。要记得适当休息哦。'
    ]
  },
  {
    keywords: ['战斗', '作战', '任务'],
    responses: [
      '博士，新的作战任务已经准备就绪。您随时可以查看作战简报。',
      '作战方案我已经仔细研究过了，请博士放心指挥。',
      '无论面对什么样的敌人，有博士在，我们一定能赢。'
    ]
  }
];

// 获取随机回复
export const getRandomResponse = (message: string): string => {
  // 将输入消息转换为小写以进行匹配
  const lowercaseMessage = message.toLowerCase();
  
  // 查找匹配的关键词组
  const matchingGroup = responses.find(group =>
    group.keywords.some(keyword => lowercaseMessage.includes(keyword))
  );

  if (matchingGroup) {
    // 从匹配的回复中随机选择一个
    return matchingGroup.responses[Math.floor(Math.random() * matchingGroup.responses.length)];
  }

  // 默认回复
  const defaultResponses = [
    '博士，您说得很有道理。让我想想...',
    '这个问题很有趣，博士。我需要进一步分析。',
    '博士的想法总是那么独特。这正是罗德岛需要的。',
    '嗯...这确实值得深入研究，博士。',
    '博士说得对。不如我们一起讨论这个问题？'
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}; 