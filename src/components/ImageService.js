import html2canvas from 'html2canvas';

// 将DOM元素转换为Blob URL
export const generateBlobUrl = async (element) => {
  if (!element) {
    throw new Error('Element is required');
  }
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false
    });
    
    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          
          const url = URL.createObjectURL(blob);
          resolve(url);
        }, 'image/png', 0.95);
      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};

// 将DOM元素转换为Data URL，带进度回调
export const generateDataUrl = async (element, progressCallback = null) => {
  if (!element) {
    throw new Error('Element is required');
  }
  
  try {
    // 创建一个模拟的进度更新
    let progressInterval;
    if (progressCallback) {
      let progress = 0;
      progressInterval = setInterval(() => {
        // 模拟进度，最大到0.95，剩下的0.05在实际完成时设置
        progress += (0.95 - progress) * 0.1;
        if (progress > 0.94) progress = 0.94;
        progressCallback(progress);
      }, 100);
    }

    // 优化html2canvas选项以提高性能
    const canvas = await html2canvas(element, {
      scale: 1.5, // 降低分辨率以提高性能
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 0, // 不超时
      removeContainer: true, // 清理临时DOM
      ignoreElements: (element) => {
        // 忽略不可见元素以提高性能
        const style = window.getComputedStyle(element);
        return style.display === 'none' || style.visibility === 'hidden';
      }
    });
    
    // 清除进度更新定时器
    if (progressInterval) {
      clearInterval(progressInterval);
      // 设置为100%完成
      if (progressCallback) progressCallback(1.0);
    }
    
    // 使用较低的质量以加快处理速度
    return canvas.toDataURL('image/png', 0.85);
  } catch (error) {
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};

// 下载图片
export const downloadImage = (url, filename = 'markdown-poster.png') => {
  // 检查URL类型
  if (url.startsWith('data:')) {
    // 如果是Data URL，转换为Blob
    const byteString = atob(url.split(',')[1]);
    const mimeString = url.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    url = URL.createObjectURL(blob);
  }
  
  // 创建并触发下载链接
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, 100);
};

// 创建一个简单的图片服务器
class ImageStore {
  constructor() {
    this.images = new Map();
    this.baseUrl = window.location.origin + window.location.pathname;
  }
  
  // 存储图片并返回访问URL
  storeImage(id, dataUrl) {
    this.images.set(id, dataUrl);
    // 同时存储到sessionStorage以便在页面刷新后恢复
    try {
      sessionStorage.setItem(`md_poster_img_${id}`, dataUrl);
    } catch (e) {
      console.warn('Failed to store image in sessionStorage:', e);
    }
    return `${this.baseUrl}#/image/${id}`;
  }
  
  // 获取图片
  getImage(id) {
    // 先从内存中获取
    if (this.images.has(id)) {
      return this.images.get(id);
    }
    
    // 如果内存中没有，尝试从sessionStorage获取
    try {
      const storedImage = sessionStorage.getItem(`md_poster_img_${id}`);
      if (storedImage) {
        // 恢复到内存中
        this.images.set(id, storedImage);
        return storedImage;
      }
    } catch (e) {
      console.warn('Failed to retrieve image from sessionStorage:', e);
    }
    
    return null;
  }
  
  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  // 获取API端点URL (用于命令行工具)
  getApiUrl(id) {
    return `${this.baseUrl}api/image/${id}`;
  }
}

// 预先加载html2canvas以提高首次生成速度
export const preloadHtml2canvas = () => {
  // 创建一个小的测试元素并转换它
  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  testElement.style.top = '-9999px';
  testElement.textContent = 'Preload';
  document.body.appendChild(testElement);
  
  // 静默执行html2canvas
  html2canvas(testElement, {
    scale: 1,
    logging: false
  }).then(() => {
    document.body.removeChild(testElement);
    console.log('html2canvas preloaded');
  }).catch(() => {
    document.body.removeChild(testElement);
  });
};

// 创建全局单例
export const imageStore = new ImageStore();

// 预加载html2canvas
setTimeout(preloadHtml2canvas, 2000); // 页面加载2秒后预加载
