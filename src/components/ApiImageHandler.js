import React, { useEffect } from 'react';
import { imageStore } from './ImageService';

// 这个组件处理API请求，直接输出图片内容
function ApiImageHandler({ imageId }) {
  useEffect(() => {
    // 获取图片数据
    const imageData = imageStore.getImage(imageId);
    
    if (!imageData) {
      // 图片不存在，返回404
      document.body.innerHTML = 'Image not found';
      document.title = '404 Not Found';
      return;
    }
    
    // 清空页面内容
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // 设置正确的Content-Type (虽然在浏览器环境中这不是真正的HTTP头)
    // 但是可以通过模拟来实现类似的行为
    
    // 创建一个隐藏的iframe来模拟二进制响应
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // 将图片数据作为blob URL直接输出到页面
    const img = document.createElement('img');
    img.src = imageData;
    img.style.display = 'block';
    document.body.appendChild(img);
    
    // 对于支持的工具，尝试触发下载
    const dataUrl = imageData;
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const blobUrl = URL.createObjectURL(blob);
    
    // 触发下载
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'markdown-poster.png';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // 清理
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 100);
  }, [imageId]);
  
  return null; // 这个组件不渲染任何UI
}

export default ApiImageHandler;
