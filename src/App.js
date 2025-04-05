import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Editor from './components/Editor';
import Preview from './components/Preview';
import TemplateSelector from './components/TemplateSelector';
import PosterImage from './components/PosterImage';
import ImageViewer from './components/ImageViewer';
import PosterPage from './components/PosterPage';
import ViewOnlyPoster from './components/ViewOnlyPoster';
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
  const [isViewOnlyMode, setIsViewOnlyMode] = useState(false);
  const [encodedMarkdown, setEncodedMarkdown] = useState('');

  useEffect(() => {
    // 检查是否是特殊路径
    if (window.location.hash.startsWith('#/image/') || 
        window.location.hash.startsWith('#/p/')) {
      // 不执行其他逻辑，将由特定组件处理
      return;
    }
    
    // 从URL参数获取markdown内容和模式
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const mdContent = queryParams.get('md');
    const templateId = queryParams.get('template');
    const mode = queryParams.get('mode');
    
    // 检查是否是图片模式
    if (mode === 'image' && mdContent) {
      setIsImageMode(true);
    }
    // 检查是否是只读视图模式
    else if (mode === 'view' && mdContent) {
      setIsViewOnlyMode(true);
    }
    
    if (mdContent) {
      try {
        // 解码Base64编码的内容
        const decodedContent = decodeURIComponent(atob(mdContent));
        setMarkdown(decodedContent);
        setEncodedMarkdown(mdContent);
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

  useEffect(() => {
    try {
      const encodedContent = btoa(encodeURIComponent(markdown));
      setEncodedMarkdown(encodedContent);
    } catch (e) {
      console.error('编码内容失败:', e);
    }
  }, [markdown]);

  // 更新URL，便于分享
  const updateUrl = (mdContent, templateId, mode = '') => {
    try {
      const encodedContent = btoa(encodeURIComponent(mdContent));
      setEncodedMarkdown(encodedContent);
      let newUrl = `${window.location.pathname}#/?md=${encodedContent}&template=${templateId}`;
      if (mode) {
        newUrl += `&mode=${mode}`;
      }
      window.history.replaceState({}, document.title, newUrl);
    } catch (e) {
      console.error('更新URL失败:', e);
    }
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
    setIsViewOnlyMode(false);
    updateUrl(markdown, selectedTemplate.id);
  };

  // 生成图片模式的分享链接
  const getImageShareableLink = () => {
    return `${window.location.origin}${window.location.pathname}#/?md=${encodedMarkdown}&template=${selectedTemplate.id}&mode=image`;
  };
  
  // 生成只读视图模式的分享链接
  const getViewOnlyShareableLink = () => {
    return `${window.location.origin}${window.location.pathname}#/?md=${encodedMarkdown}&template=${selectedTemplate.id}&mode=view`;
  };
  
  // 如果是图片模式，只渲染海报图片
  if (isImageMode) {
    return (
      <PosterImage 
        markdown={markdown} 
        templateId={selectedTemplate.id} 
        templates={templates}
        onEdit={handleEdit}
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
  
  // 检查是否是图片查看路径
  if (window.location.hash.startsWith('#/image/')) {
    return <ImageViewer />;
  }
  
  // 检查是否是只读视图模式
  if (isViewOnlyMode) {
    return (
      <ViewOnlyPoster 
        markdown={markdown}
        template={selectedTemplate}
      />
    );
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
            getViewOnlyLink={getViewOnlyShareableLink}
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
