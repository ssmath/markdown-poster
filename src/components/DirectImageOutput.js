import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import html2canvas from 'html2canvas';
import styled from 'styled-components';

// 这个组件的样式需要全屏无边距
const Container = styled.div`
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
`;

const PosterContainer = styled.div`
  padding: 40px;
  background-color: ${props => props.bgColor || '#ffffff'};
  background-image: ${props => props.bgImage ? `url(${props.bgImage})` : 'none'};
  background-size: cover;
  background-position: center;
  color: ${props => props.textColor || '#333333'};
  font-family: ${props => props.fontFamily || 'Inter, "Noto Sans SC", sans-serif'};
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

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

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
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

// 这个组件会渲染一个纯净的海报，并在渲染完成后将其转换为图片数据URL
function DirectImageOutput({ markdown, templateId, templates }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageData, setImageData] = useState(null);
  const posterRef = useRef(null);

  useEffect(() => {
    // 找到对应的模板
    const foundTemplate = templates.find(t => t.id === templateId) || templates[0];
    setTemplate(foundTemplate);
    
    // 给DOM足够的时间来渲染内容
    console.log('Setting up render timer...');
    const timer = setTimeout(() => {
      console.log('Timer triggered, checking if poster ref exists:', !!posterRef.current);
      if (posterRef.current) {
        generateImage();
      } else {
        console.error('Poster ref not available');
        setLoading(false);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [templateId, templates, markdown]);

  // 生成图片
  const generateImage = async () => {
    if (!posterRef.current) return;

    try {
      console.log('Starting image generation...');
      
      // 确保内容已渲染
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(posterRef.current, {
            scale: 2,
            backgroundColor: null,
            logging: true, // 启用日志以便调试
            useCORS: true,
            allowTaint: true, // 允许跨域图片
          });
          
          console.log('Canvas generated successfully');
          
          const dataUrl = canvas.toDataURL('image/png');
          setImageData(dataUrl);
          setLoading(false);
          
          // 清理React的渲染并显示纯图片
          // 使用更安全的方式替换内容
          const root = document.getElementById('root');
          if (root) {
            root.innerHTML = '';
            
            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100vh';
            img.style.display = 'block';
            img.style.margin = '0 auto';
            root.appendChild(img);
            
            // 设置页面样式
            document.body.style.margin = '0';
            document.body.style.padding = '0';
            document.body.style.backgroundColor = 'transparent';
            document.body.style.overflow = 'auto';
            document.body.style.display = 'flex';
            document.body.style.alignItems = 'center';
            document.body.style.justifyContent = 'center';
            document.documentElement.style.height = '100%';
            document.body.style.height = '100%';
          } else {
            console.error('Root element not found');
          }
        } catch (error) {
          console.error('Error in delayed image generation:', error);
          setLoading(false);
        }
      }, 1500); // 给更多时间让内容渲染
      
    } catch (error) {
      console.error('Error starting image generation:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <Loading />
      </LoadingWrapper>
    );
  }

  // 这个组件实际上不会渲染这部分，因为在生成图片后会直接替换整个body内容
  return (
    <Container>
      <PosterContainer 
        ref={posterRef}
        bgColor={template?.bgColor}
        bgImage={template?.bgImage}
        textColor={template?.textColor}
        fontFamily={template?.fontFamily}
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

export default DirectImageOutput;
