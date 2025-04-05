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
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: 20px;
  
  h3 {
    margin-bottom: 15px;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 10px;
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

const InfoMessage = styled.div`
  background-color: #f0f7ff;
  border-left: 4px solid #0070f3;
  padding: 15px;
  margin-top: 20px;
  font-size: 14px;
  color: #333;
  border-radius: 4px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  a {
    color: #0070f3;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

function AutoDownloadImage({ markdown, templateId, templates }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [error, setError] = useState(null);
  const posterRef = useRef(null);

  useEffect(() => {
    // 找到对应的模板
    const foundTemplate = templates.find(t => t.id === templateId) || templates[0];
    setTemplate(foundTemplate);
  }, [templateId, templates]);

  // 当模板加载完成后，生成并下载图片
  useEffect(() => {
    if (template && posterRef.current && !downloading && !downloaded) {
      const timer = setTimeout(() => {
        generateAndDownloadImage();
      }, 1000); // 给DOM足够的时间渲染
      
      return () => clearTimeout(timer);
    }
  }, [template, downloading, downloaded]);

  const generateAndDownloadImage = async () => {
    if (!posterRef.current) {
      setError('无法生成图片，请稍后再试');
      setLoading(false);
      return;
    }

    setDownloading(true);
    
    try {
      // 生成图片
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });
      
      // 转换为Blob
      canvas.toBlob((blob) => {
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'markdown-poster.png';
        document.body.appendChild(link);
        link.click();
        
        // 清理
        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(link);
          setDownloading(false);
          setDownloaded(true);
          setLoading(false);
        }, 100);
      }, 'image/png', 0.95);
    } catch (err) {
      console.error('生成图片失败:', err);
      setError('生成图片失败，请稍后再试');
      setDownloading(false);
      setLoading(false);
    }
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

  return (
    <Container>
      {loading ? (
        <LoadingMessage>
          <h3>正在准备下载</h3>
          <div className="spinner"></div>
          <p>图片正在生成中，稍后将自动下载...</p>
          {downloading && <p>正在下载图片...</p>}
        </LoadingMessage>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h3>图片已下载</h3>
          <p>如果下载没有自动开始，请点击下方按钮重新下载</p>
          <button 
            style={{
              padding: '10px 16px',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
            onClick={generateAndDownloadImage}
          >
            重新下载
          </button>
          
          <InfoMessage>
            <h4>分享链接</h4>
            <p>
              你可以将此链接发送给他人，他们访问后也会自动下载图片：<br />
              <a href={window.location.href}>{window.location.href}</a>
            </p>
          </InfoMessage>
        </div>
      )}
      
      <div style={{ position: 'absolute', left: '-9999px' }}>
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
      </div>
    </Container>
  );
}

export default AutoDownloadImage;
