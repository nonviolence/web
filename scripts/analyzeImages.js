const fs = require('fs');
const path = require('path');

// 图片分类规则
const imagePatterns = {
  // 立绘图片特征
  character: {
    keywords: ['立绘', '干员', '人物', '角色'],
    prefix: 'operator_'
  },
  // 海报和装饰图片特征
  poster: {
    keywords: ['海报', '背景', 'banner', '装饰'],
    prefix: 'poster_'
  },
  // Logo和图标特征
  logo: {
    keywords: ['logo', '图标', '标志'],
    prefix: 'logo_'
  }
};

// 读取图片目录
const imagesDir = path.join(__dirname, '../public/images');
const files = fs.readdirSync(imagesDir);

// 分析和重命名图片
files.forEach((file, index) => {
  if (file.startsWith('character_') && (file.endsWith('.png') || file.endsWith('.jpg'))) {
    const oldPath = path.join(imagesDir, file);
    const stats = fs.statSync(oldPath);
    
    // 基于文件大小和命名规则进行简单分类
    let newPrefix = 'misc_'; // 默认前缀
    
    // 文件大小超过500KB可能是立绘
    if (stats.size > 500 * 1024) {
      newPrefix = 'operator_';
    } 
    // 文件大小在100KB-500KB之间可能是海报
    else if (stats.size > 100 * 1024) {
      newPrefix = 'poster_';
    }
    // 小文件可能是logo或图标
    else {
      newPrefix = 'logo_';
    }
    
    const newName = `${newPrefix}${index + 1}.png`;
    const newPath = path.join(imagesDir, newName);
    
    try {
      fs.renameSync(oldPath, newPath);
      console.log(`重命名 ${file} -> ${newName}`);
    } catch (err) {
      console.error(`重命名失败 ${file}:`, err);
    }
  }
});

console.log('图片分析和重命名完成！'); 