import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import html2canvas from 'html2canvas';
import styled from 'styled-components';
import { generateDataUrl, imageStore } from './ImageService';

const PreviewContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #eaeaea;
`;

const PreviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const PreviewControls = styled.div`
  display: flex;
  gap: 10px;
`;

const ControlButton = styled.button`
  background-color: transparent;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
  
  &.primary {
    background-color: #0070f3;
    color: white;
    
    &:hover {
      background-color: #0058c1;
    }
  }
`;

const ShareModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ShareModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const ShareModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }
`;

const ShareInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const ShareButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ShareOptions = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  
  input {
    margin-right: 8px;
  }
`;

const RadioGroup = styled.div`
  margin-top: 8px;
  padding-left: 20px;
`;

const InfoText = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: #f0f7ff;
  border-left: 4px solid #0070f3;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
`;

const ProgressContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 15px;
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: #eaeaea;
  border-radius: 3px;
  overflow: hidden;
  
  .progress-inner {
    height: 100%;
    background-color: #0070f3;
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
`;

const CodeSnippet = styled.code`
  background-color: #f1f1f1;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
`;

const ImageServiceUrl = styled.div`
  margin-top: 10px;
  font-size: 13px;
  
  a {
    color: #0070f3;
    text-decoration: none;
    word-break: break-all;
    
    &:hover {
      text-decoration: underline;
    }
  }
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

function Preview({ markdown, template, getShareableLink }) {
  const posterRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharableLink, setSharableLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);
  const [directOutput, setDirectOutput] = useState(false);
  const [showImageUrl, setShowImageUrl] = useState(false);

  const handleDownload = async () => {
    if (!posterRef.current) return;

    try {
      console.log('Starting download process...');
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: true, // Enable logging for debugging
        useCORS: true,
        allowTaint: true, // Allow cross-origin images
      });
      
      console.log('Canvas generated successfully');
      
      // Create a blob from the canvas
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          alert('生成图片失败，请稍后再试。');
          return;
        }
        
        console.log('Blob created successfully');
        
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
          console.log('Download completed and resources cleaned up');
        }, 100);
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Error generating poster:', error);
      alert('生成海报时出错，请稍后再试。');
    }
  };

  const handleShare = () => {
    const link = getShareableLink(autoDownload, directOutput);
    setSharableLink(link);
    setShowShareModal(true);
    
    // 如果选择了直接图片模式，重置图片URL，以便重新生成
    if (directOutput) {
      setImageUrl('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharableLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAutoDownloadChange = (e) => {
    setAutoDownload(e.target.checked);
    // 更新链接
    if (showShareModal) {
      const link = getShareableLink(e.target.checked, directOutput);
      setSharableLink(link);
    }
  };
  
  const handleDirectOutputChange = (e) => {
    setDirectOutput(e.target.checked);
    // 如果选择了直接输出，自动下载选项无效
    if (e.target.checked) {
      setAutoDownload(false);
      setShowImageUrl(true);
    } else {
      setShowImageUrl(false);
    }
    // 更新链接
    if (showShareModal) {
      const link = getShareableLink(e.target.checked ? false : autoDownload, e.target.checked);
      setSharableLink(link);
    }
  };
  
  const [imageUrl, setImageUrl] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  
  // 生成图片URL和下载URL
  const generateUrls = async () => {
    if (!posterRef.current || generatingImage) return;
    
    setGeneratingImage(true);
    setProgressPercent(0);
    setProgressStatus('准备生成图片...');
    
    try {
      // 分步骤执行，提供进度反馈
      
      // 步骤1: 准备渲染
      setProgressPercent(10);
      setProgressStatus('准备渲染内容...');
      await new Promise(resolve => setTimeout(resolve, 100)); // 给UI时间更新
      
      // 步骤2: 生成图片
      setProgressPercent(30);
      setProgressStatus('生成图片中...');
      const dataUrl = await generateDataUrl(posterRef.current, (progress) => {
        // html2canvas不直接提供进度，但我们可以通过回调模拟进度
        const calculatedProgress = 30 + Math.round(progress * 40);
        setProgressPercent(calculatedProgress);
        setProgressStatus(`处理图片内容: ${Math.round(progress * 100)}%`);
      });
      
      // 步骤3: 存储图片数据
      setProgressPercent(75);
      setProgressStatus('处理图片数据...');
      await new Promise(resolve => setTimeout(resolve, 100)); // 给UI时间更新
      
      // 步骤4: 生成各种URL
      setProgressPercent(85);
      setProgressStatus('生成分享链接...');
      
      // 存储图片并获取访问URL
      const imageId = imageStore.generateId();
      const viewUrl = imageStore.storeImage(imageId, dataUrl);
      
      // 生成直接下载URL
      const currentUrl = window.location.origin + window.location.pathname;
      const shareableUrl = getShareableLink(false, false);
      const downloadUrl = `${currentUrl}#/download/?md=${shareableUrl.split('md=')[1]}`;
      
      // 生成海报页面URL
      const posterUrl = `${currentUrl}#/p/?md=${shareableUrl.split('md=')[1]}`;
      
      // 步骤5: 完成
      setProgressPercent(100);
      setProgressStatus('完成！');
      
      setImageUrl({ 
        viewUrl: viewUrl, 
        downloadUrl: downloadUrl,
        posterUrl: posterUrl
      });
      
      // 短暂延迟后重置状态
      setTimeout(() => {
        setProgressPercent(0);
        setProgressStatus('');
        setGeneratingImage(false);
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate image URL:', error);
      setProgressStatus('生成失败，请重试');
      setGeneratingImage(false);
    }
  };
  
  // 当选择直接输出模式时，生成图片URL
  useEffect(() => {
    if (showImageUrl && posterRef.current && !imageUrl) {
      // 短暂延迟以确保UI更新
      const timer = setTimeout(() => {
        generateUrls();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showImageUrl, imageUrl]);

  return (
    <PreviewContainer>
      <PreviewHeader>
        <PreviewTitle>预览</PreviewTitle>
        <PreviewControls>
          <ControlButton onClick={handleShare}>
            分享链接
          </ControlButton>
          <ControlButton className="primary" onClick={handleDownload}>
            下载海报
          </ControlButton>
        </PreviewControls>
      </PreviewHeader>
      
      <PosterContainer 
        ref={posterRef}
        template={template}
        style={{ margin: '16px' }}
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

      {showShareModal && (
        <ShareModal onClick={() => setShowShareModal(false)}>
          <ShareModalContent onClick={(e) => e.stopPropagation()}>
            <ShareModalHeader>
              <h3>分享你的海报</h3>
              <button onClick={() => setShowShareModal(false)}>×</button>
            </ShareModalHeader>
            
            <ShareOptions>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={directOutput}
                  onChange={handleDirectOutputChange}
                />
                纯图片视图（适合嵌入或分享）
              </CheckboxLabel>
              
              {!directOutput && (
                <CheckboxLabel>
                  <input 
                    type="checkbox" 
                    checked={autoDownload} 
                    onChange={handleAutoDownloadChange}
                    disabled={directOutput}
                  />
                  访问链接时自动下载图片
                </CheckboxLabel>
              )}
              
              {showImageUrl && (
                <InfoText>
                  如需在 Markdown 中直接引用图片，可使用以下图片链接：
                  {generatingImage ? (
                    <div>
                      <div style={{ textAlign: 'center', padding: '5px 0 10px' }}>
                        生成图片链接中...
                      </div>
                      <ProgressContainer>
                        <ProgressBar>
                          <div 
                            className="progress-inner" 
                            style={{ width: `${progressPercent}%` }}
                          />
                        </ProgressBar>
                        <ProgressText>
                          <span>{progressStatus}</span>
                          <span>{progressPercent}%</span>
                        </ProgressText>
                      </ProgressContainer>
                    </div>
                  ) : imageUrl ? (
                    <>
                      <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                        <strong>分享方式：</strong>
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <strong>1. 海报页面链接</strong> (类似 ReadPo)：<br />
                        <ImageServiceUrl>
                          <a href={imageUrl.posterUrl} target="_blank" rel="noopener noreferrer">
                            {imageUrl.posterUrl}
                          </a>
                        </ImageServiceUrl>
                        <div style={{ fontSize: '13px', marginTop: '4px', color: '#555' }}>
                          访问此链接将显示一个简洁的海报页面，类似于 ReadPo
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <strong>2. Markdown 图片引用：</strong><br />
                        <ImageServiceUrl>
                          <a href={imageUrl.viewUrl} target="_blank" rel="noopener noreferrer">
                            {imageUrl.viewUrl}
                          </a>
                        </ImageServiceUrl>
                        <div style={{ marginTop: '4px' }}>
                          <CodeSnippet>{`![图片描述](${imageUrl.viewUrl})`}</CodeSnippet>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <strong>3. 自动下载链接：</strong><br />
                        <ImageServiceUrl>
                          <a href={imageUrl.downloadUrl} target="_blank" rel="noopener noreferrer">
                            {imageUrl.downloadUrl}
                          </a>
                        </ImageServiceUrl>
                        <div style={{ marginTop: '4px', fontSize: '13px', color: '#555' }}>
                          适用于命令行工具(wget/curl)和编程语言HTTP客户端(Go/Python)
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                        注意：此图片链接在当前会话有效，页面刷新后需要重新生成
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '10px', color: 'red' }}>
                      图片生成失败，请重试
                    </div>
                  )}
                </InfoText>
              )}
            </ShareOptions>
            
            <ShareInput 
              value={sharableLink}
              readOnly
              onClick={(e) => e.target.select()}
            />
            <ShareButtons>
              <ControlButton onClick={() => setShowShareModal(false)}>
                取消
              </ControlButton>
              <ControlButton className="primary" onClick={copyToClipboard}>
                {copied ? '已复制！' : '复制链接'}
              </ControlButton>
            </ShareButtons>
          </ShareModalContent>
        </ShareModal>
      )}
    </PreviewContainer>
  );
}

export default Preview;
