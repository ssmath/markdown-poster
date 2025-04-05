// 这个文件将作为处理图片请求的服务端代码
// 在浏览器环境中，我们需要模拟这种行为

/**
 * 检测请求是否来自命令行工具
 * @param {string} userAgent - 用户代理字符串
 * @returns {boolean} 是否是命令行工具
 */
export const isCliClient = (userAgent) => {
  const cliClients = [
    'wget', 'curl', 'httpie', 'go-http-client', 'python-requests',
    'node-fetch', 'axios', 'java', 'ruby', 'perl'
  ];
  
  if (!userAgent) return false;
  
  const lowerUA = userAgent.toLowerCase();
  return cliClients.some(client => lowerUA.includes(client.toLowerCase()));
};

/**
 * 响应不同类型的客户端请求
 * @param {string} imageId - 图片ID
 * @param {string} userAgent - 用户代理字符串
 * @returns {Object} 响应对象
 */
export const handleImageRequest = (imageId, userAgent) => {
  // 是否是命令行工具请求
  const isCliRequest = isCliClient(userAgent);
  
  return {
    isCliRequest,
    imageId
  };
};
