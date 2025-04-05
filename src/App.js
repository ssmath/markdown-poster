import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Editor from './components/Editor';
import Preview from './components/Preview';
import TemplateSelector from './components/TemplateSelector';
import PosterImage from './components/PosterImage';
import ImageRenderer from './components/ImageRenderer';
import ImageViewer from './components/ImageViewer';
import AutoDownloadImage from './components/AutoDownloadImage';
import PosterPage from './components/PosterPage';
import { templates } from './data/templates';
import styled from 'styled-components';
import ApiDocs from './components/ApiDocs';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 40px 0;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const defaultMarkdown = '# 这是标题\n\n这是一段文字。\n\n> 这是一段引用\n\n- 列表项 1\n- 列表项 2\n- 列表项 3\n\n```javascript\nconsole.log("Hello, world!");\n```';

function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [isDirectImageMode, setIsDirectImageMode] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);

  useEffect(() => {
  // 检查是否是特殊路径
  if (window.location.hash.startsWith('#/image/') || 
      window.location.hash.startsWith('#/download/') ||
      window.location.hash.startsWith('#/p/')) {
    // 不执行其他逻辑，将由特定组件处理
    return;
  }
    
    // 从URL参数获取markdown内容和模式
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const mdContent = queryParams.get('md');
    const templateId = queryParams.get('template');
    const mode = queryParams.get('mode');
    const download = queryParams.get('download');
    const output = queryParams.get('output');
    
    // 检查是否是直接图片输出模式
    if (output === 'direct' && mdContent) {
      setIsDirectImageMode(true);
    }
    // 检查是否是图片模式
    else if (mode === 'image' && mdContent) {
      setIsImageMode(true);
    }
    
    // 检查是否需要自动下载
    if (download === 'true') {
      setAutoDownload(true);
    }
    
    if (mdContent) {
      try {
        // 解码Base64编码的内容
        const decodedContent = decodeURIComponent(atob(mdContent));
        setMarkdown(decodedContent);
      } catch (e) {
        console.error('解析URL参数失败:', e);
      }
    }
    
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, []);

  // 更新URL，便于分享
  const updateUrl = (mdContent, templateId, mode = '', download = false, output = '') => {
    const encodedContent = btoa(encodeURIComponent(mdContent));
    let newUrl = `${window.location.pathname}#/?md=${encodedContent}&template=${templateId}`;
    if (mode) {
      newUrl += `&mode=${mode}`;
    }
    if (download) {
      newUrl += `&download=true`;
    }
    if (output) {
      newUrl += `&output=${output}`;
    }
    window.history.replaceState({}, document.title, newUrl);
  };

  const handleMarkdownChange = (newMarkdown) => {
    setMarkdown(newMarkdown);
    updateUrl(newMarkdown, selectedTemplate.id);
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    updateUrl(markdown, template.id);
  };

  // 切换到编辑模式
  const handleEdit = () => {
    setIsImageMode(false);
    setIsDirectImageMode(false);
    updateUrl(markdown, selectedTemplate.id);
  };

  // 生成图片模式的分享链接
  const getImageShareableLink = (withDownload = false, directOutput = false) => {
    const encodedContent = btoa(encodeURIComponent(markdown));
    let url = `${window.location.origin}${window.location.pathname}#/?md=${encodedContent}&template=${selectedTemplate.id}`;
    
    if (directOutput) {
      url += `&output=direct`;
    } else {
      url += `&mode=image`;
      if (withDownload) {
        url += `&download=true`;
      }
    }
    
    return url;
  };

  // 如果是直接图片输出模式，使用图片渲染器
  if (isDirectImageMode) {
    return (
      <ImageRenderer 
        markdown={markdown}
        templateId={selectedTemplate.id}
        templates={templates}
      />
    );
  }
  
  // 如果是图片模式，只渲染海报图片
  if (isImageMode) {
    return (
      <PosterImage 
        markdown={markdown} 
        templateId={selectedTemplate.id} 
        templates={templates}
        onEdit={handleEdit}
        autoDownload={autoDownload}
      />
    );
  }

  // 检查是否是海报页面路径
  if (window.location.hash.startsWith('#/p/')) {
    return (
      <PosterPage 
        markdown={markdown}
        templateId={selectedTemplate.id}
        templates={templates}
      />
    );
  }
  
  // 检查是否是下载请求路径
  if (window.location.hash.startsWith('#/download/')) {
    return (
      <AutoDownloadImage 
        markdown={markdown}
        templateId={selectedTemplate.id}
        templates={templates}
      />
    );
  }
  
  // 检查是否是图片查看路径
  if (window.location.hash.startsWith('#/image/')) {
    return <ImageViewer />;
  }
  
  return (
    <AppContainer>
      <Header onShowApiDocs={() => setShowApiDocs(true)} />
      
      <MainContent className="container">
        <TemplateSelector 
          templates={templates} 
          selectedTemplate={selectedTemplate} 
          onSelectTemplate={handleTemplateChange}
        />
        
        <ContentWrapper>
          <Editor markdown={markdown} setMarkdown={handleMarkdownChange} />
          <Preview 
            markdown={markdown} 
            template={selectedTemplate} 
            getShareableLink={getImageShareableLink}
          />
        </ContentWrapper>
        
        {showApiDocs && (
          <ApiDocs onClose={() => setShowApiDocs(false)} />
        )}
      </MainContent>
      
      <Footer />
    </AppContainer>
  );
}

export default App;
