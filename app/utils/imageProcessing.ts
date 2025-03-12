export const loadGrayscaleImage = (src: string, scale: number = 1): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建 canvas context'));
        return;
      }

      // 设置放大后的尺寸
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // 绘制放大的原始图片
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // 获取图片数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 转换为灰度
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        data[i] = gray;     // R
        data[i + 1] = gray; // G
        data[i + 2] = gray; // B
        // 保持原始透明度
      }
      
      // 将处理后的数据放回 canvas
      ctx.putImageData(imageData, 0, 0);
      
      // 转换为 base64
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = src;
  });
}; 