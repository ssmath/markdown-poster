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
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f9f9f9;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &.primary {
    background-color: #0070f3;
    color: white;
    
    &:hover {
      background-color: #0058c1;
    }
  }
  
  &.secondary {
    background-color: #f5f5f5;
    color: #333;
    
    &:hover {
      background-color: #e0e0e0;
    }
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
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

function PosterImage({ markdown, templateId, templates, onEdit }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const posterRef = useRef(null);

  // 生成并下载图片的函数
  const generateAndDownload = async () => {
    if (!posterRef.current) return;

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'markdown-poster.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('生成海报时出错，请稍后再试。');
    }
  };

  // 处理下载按钮点击
  const handleDownload = () => {
    generateAndDownload();
  };

  useEffect(() => {
    // 找到对应的模板
    const foundTemplate = templates.find(t => t.id === templateId) || templates[0];
    setTemplate(foundTemplate);
    setLoading(false);
  }, [templateId, templates]);

  if (loading || !template) {
    return (
      <Container>
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
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
          headingColor={template.headingColor}
          accentColor={template.accentColor}
          textColor={template.textColor}
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
      
      <ActionButtons>
        <Button className="secondary" onClick={onEdit}>
          编辑
        </Button>
        <Button className="primary" onClick={handleDownload}>
          下载图片
        </Button>
      </ActionButtons>
    </Container>
  );
}

export default PosterImage;
