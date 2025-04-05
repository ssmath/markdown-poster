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

const ShareInput = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const LinkIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  padding: 0 12px;
  height: 38px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #e5e5e5;
  }
  
  svg {
    width: 18px;
    height: 18px;
    color: #555;
  }
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: none;
  font-size: 14px;
  outline: none;
  width: 100%;
  background-color: white;
`;

// SVG图标组件
const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

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

function Preview({ markdown, template, getShareableLink, getViewOnlyLink }) {
  const posterRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharableLink, setSharableLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState('normal'); // 'normal', 'viewOnly'
  const [imageUrl, setImageUrl] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  
  // 生成图片URL
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
      
      // 生成海报页面URL
      const currentUrl = window.location.origin + window.location.pathname;
      const shareableUrl = getShareableLink();
      const posterUrl = `${currentUrl}#/p/?md=${shareableUrl.split('md=')[1]}`;
      
      // 步骤5: 完成
      setProgressPercent(100);
      setProgressStatus('完成！');
      
      setImageUrl({ 
        viewUrl: viewUrl, 
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
  
  // 下载图片
  const handleDownloadImage = async () => {
    if (!posterRef.current) return;
    
    setGeneratingImage(true);
    setProgressPercent(0);
    setProgressStatus('准备下载图片...');
    
    try {
      // 步骤1: 准备渲染
      setProgressPercent(20);
      setProgressStatus('准备渲染内容...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 步骤2: 生成图片
      setProgressPercent(40);
      setProgressStatus('生成图片中...');
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });
      
      // 步骤3: 转换为数据URL
      setProgressPercent(80);
      setProgressStatus('处理图片数据...');
      const dataUrl = canvas.toDataURL('image/png');
      
      // 步骤4: 触发下载
      setProgressPercent(90);
      setProgressStatus('准备下载...');
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'markdown-poster.png';
      document.body.appendChild(link);
      
      // 触发下载
      setProgressPercent(100);
      setProgressStatus('下载中...');
      link.click();
      
      // 清理
      document.body.removeChild(link);
      
      // 完成后重置状态
      setTimeout(() => {
        setProgressPercent(0);
        setProgressStatus('');
        setGeneratingImage(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating poster:', error);
      setProgressStatus('生成海报时出错，请稍后再试');
      setGeneratingImage(false);
      alert('生成海报时出错，请稍后再试。');
    }
  };

  const handleShare = () => {
    // 默认使用普通分享链接
    const link = shareType === 'viewOnly' ? getViewOnlyLink() : getShareableLink();
    setSharableLink(link);
    setShowShareModal(true);
  };

  // 切换分享类型
  const handleShareTypeChange = (type) => {
    setShareType(type);
    const link = type === 'viewOnly' ? getViewOnlyLink() : getShareableLink();
    setSharableLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharableLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <PreviewContainer>
      <PreviewHeader>
        <PreviewTitle>预览</PreviewTitle>
        <PreviewControls>
          <ControlButton onClick={handleShare}>
            分享链接
          </ControlButton>
          <ControlButton className="primary" onClick={handleDownloadImage}>
            下载图片
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
      
      {/* 显示生成图片的进度和结果 */}
      {generatingImage && (
        <div style={{ margin: '20px 16px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px' }}>
          <div style={{ fontWeight: '500', marginBottom: '10px' }}>生成图片中...</div>
          <ProgressContainer>
            <ProgressBar>
              <div className="progress-inner" style={{ width: `${progressPercent}%` }} />
            </ProgressBar>
            <ProgressText>
              <span>{progressStatus}</span>
              <span>{progressPercent}%</span>
            </ProgressText>
          </ProgressContainer>
        </div>
      )}
      
      {imageUrl && !generatingImage && (
        <div style={{ margin: '20px 16px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '8px' }}>
          <div style={{ fontWeight: '500', marginBottom: '10px' }}>图片已生成！</div>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '5px' }}>在 Markdown 中引用:</div>
            <CodeSnippet>{`![图片描述](${imageUrl.viewUrl})`}</CodeSnippet>
          </div>
          <div>
            <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '5px' }}>海报页面链接:</div>
            <ImageServiceUrl>
              <a href={imageUrl.posterUrl} target="_blank" rel="noopener noreferrer">
                {imageUrl.posterUrl}
              </a>
            </ImageServiceUrl>
          </div>
          <div style={{ marginTop: '15px', textAlign: 'right' }}>
            <ControlButton 
              className="primary" 
              onClick={() => window.open(imageUrl.viewUrl, '_blank')}
              style={{ marginRight: '8px' }}
            >
              查看图片
            </ControlButton>
            <ControlButton
              onClick={() => setImageUrl(null)}
            >
              关闭
            </ControlButton>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareModal onClick={() => setShowShareModal(false)}>
          <ShareModalContent onClick={(e) => e.stopPropagation()}>
            <ShareModalHeader>
              <h3>分享你的海报</h3>
              <button onClick={() => setShowShareModal(false)}>×</button>
            </ShareModalHeader>
            
            <ShareOptions>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ marginBottom: '8px', fontWeight: '500' }}>分享类型：</div>
                <RadioGroup>
                  <CheckboxLabel>
                    <input 
                      type="radio" 
                      name="shareType"
                      checked={shareType === 'normal'}
                      onChange={() => handleShareTypeChange('normal')}
                    />
                    普通链接 (显示编辑和下载按钮)
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input 
                      type="radio" 
                      name="shareType"
                      checked={shareType === 'viewOnly'}
                      onChange={() => handleShareTypeChange('viewOnly')}
                    />
                    只读视图 (不显示编辑和下载按钮)
                  </CheckboxLabel>
                </RadioGroup>
              </div>
            </ShareOptions>
            
            <ShareInput>
              <LinkIcon onClick={() => window.open(sharableLink, '_blank', 'noopener,noreferrer')} title="在新窗口打开链接">
                <ExternalLinkIcon />
              </LinkIcon>
              <InputField 
                value={sharableLink}
                readOnly
                onClick={(e) => e.target.select()}
              />
            </ShareInput>
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
