import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import html2canvas from 'html2canvas';
import styled from 'styled-components';

const ImageRendererContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #0070f3;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 16px;
`;

const ImageDisplay = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  
  img {
    max-width: 100%;
    max-height: 100vh;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  text-align: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
`;

function ImageRenderer({ markdown, templateId, templates }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState(null);
  const posterRef = useRef(null);

  useEffect(() => {
    const foundTemplate = templates.find(t => t.id === templateId) || templates[0];
    setTemplate(foundTemplate);
  }, [templateId, templates]);

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
        backgroundColor: null
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

  if (error) {
    return (
      <ImageRendererContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </ImageRendererContainer>
    );
  }

  if (loading) {
    return (
      <ImageRendererContainer>
        <LoadingSpinner />
        <LoadingText>正在生成图片...</LoadingText>
      </ImageRendererContainer>
    );
  }

  if (imageData) {
    return (
      <ImageDisplay>
        <img src={imageData} alt="Markdown Poster" />
      </ImageDisplay>
    );
  }

  return (
    <div style={{ position: 'absolute', left: '-9999px' }}>
      <PosterContainer 
        ref={posterRef}
        template={template}
        style={{ width: '90%' }}
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
  );
}

export default ImageRenderer;
