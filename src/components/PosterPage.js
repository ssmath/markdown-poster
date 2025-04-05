import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import html2canvas from 'html2canvas';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

import PosterContainer from './PosterContainer';

const MarkdownContent = styled.div`
  padding: 20px;
  line-height: 1.6;
  
  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.headingColor || props.textColor || '#333333'};
    margin-top: 1.5em;
    margin-bottom: 0.75em;
    font-weight: 600;
  }
  
  h1 {
    font-size: 2em;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 0.3em;
  }
  
  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 0.3em;
  }
  
  p {
    margin: 1em 0;
  }
  
  ul, ol {
    padding-left: 2em;
    margin: 1em 0;
  }
  
  blockquote {
    border-left: 4px solid ${props => props.accentColor || '#0070f3'};
    margin: 1em 0;
    padding: 0.5em 1em;
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
    font-size: 85%;
  }
  
  pre {
    margin: 1em 0;
    border-radius: 6px;
    overflow: auto;
  }
  
  img {
    max-width: 100%;
    border-radius: 4px;
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  
  img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #0070f3;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Footer = styled.footer`
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
  
  a {
    color: #0070f3;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  
  button {
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    
    &:hover {
      background: #f0f0f0;
    }
    
    &.primary {
      background: #0070f3;
      color: white;
      border-color: #0070f3;
      
      &:hover {
        background: #0058c1;
      }
    }
  }
`;

function PosterPage({ markdown, templateId, templates }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState(null);
  const posterRef = useRef(null);

  useEffect(() => {
    // 找到对应的模板
    const foundTemplate = templates.find(t => t.id === templateId) || templates[0];
    setTemplate(foundTemplate);
  }, [templateId, templates]);

  // 当模板加载完成后，生成图片
  useEffect(() => {
    if (template && posterRef.current) {
      const timer = setTimeout(() => {
        generateImage();
      }, 1000); // 给DOM足够的时间渲染
      
      return () => clearTimeout(timer);
    }
  }, [template]);

  const generateImage = async () => {
    if (!posterRef.current) {
      setError('无法生成图片，请刷新页面重试');
      setLoading(false);
      return;
    }

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setImageData(dataUrl);
      setLoading(false);
    } catch (err) {
      console.error('生成图片失败:', err);
      setError('生成图片失败，请刷新页面重试');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageData) return;
    
    // Create a blob from the data URL
    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'markdown-poster.png';
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleEdit = () => {
    // 重定向到编辑页面
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split('#')[0];
    const params = currentUrl.split('#/p/')[1];
    window.location.href = `${baseUrl}#/?${params}`;
  };

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: 'red' }}>
          <h3>出错了</h3>
          <p>{error}</p>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <LoadingMessage>
          <h3>正在生成海报</h3>
          <div className="spinner"></div>
        </LoadingMessage>
      </Container>
    );
  }

  if (imageData) {
    return (
      <Container>
        <ImageContainer>
          <img src={imageData} alt="Markdown Poster" />
        </ImageContainer>
        
        <ActionButtons>
          <button onClick={handleEdit}>编辑</button>
          <button className="primary" onClick={handleDownload}>下载图片</button>
        </ActionButtons>
        
        <Footer>
          由 <a href={window.location.origin + window.location.pathname}>Markdown Poster Generator</a> 生成
        </Footer>
      </Container>
    );
  }

  return (
    <Container>
      <PosterContainer 
        ref={posterRef}
        template={template}
      >
        <MarkdownContent
          headingColor={template?.headingColor}
          accentColor={template?.accentColor}
          textColor={template?.textColor}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {markdown}
          </ReactMarkdown>
        </MarkdownContent>
      </PosterContainer>
    </Container>
  );
}

export default PosterPage;
