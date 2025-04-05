import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 0;
  margin: 0;
  background-color: transparent;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Loading = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0070f3;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 一个简化的图片输出组件，使用iframe方式嵌入图片预览模式
function SimpleImageOutput({ markdown, templateId }) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 给iframe一些时间加载
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // 构建图片预览模式的URL
  const generatePreviewUrl = () => {
    const encodedContent = btoa(encodeURIComponent(markdown));
    return `${window.location.origin}${window.location.pathname}#/?md=${encodedContent}&template=${templateId}&mode=image`;
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  // 使用iframe加载图片预览模式，然后使用CSS隐藏界面元素
  return (
    <Container>
      <iframe 
        src={generatePreviewUrl()}
        style={{
          border: 'none',
          width: '100%',
          height: '100vh',
          overflow: 'hidden'
        }}
        title="Markdown Poster"
      />
    </Container>
  );
}

export default SimpleImageOutput;
