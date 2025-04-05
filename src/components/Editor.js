import React from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #eaeaea;
`;

const EditorTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

const EditorControls = styled.div`
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
`;

const TextareaWrapper = styled.div`
  flex: 1;
  padding: 16px;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  height: 500px;
  padding: 12px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  resize: vertical;
  outline: none;
  transition: border 0.2s;
  
  &:focus {
    border-color: #0070f3;
    box-shadow: 0 0 0 2px rgba(0, 112, 243, 0.1);
  }
`;

function Editor({ markdown, setMarkdown }) {
  const handleChange = (e) => {
    setMarkdown(e.target.value);
  };

  const handleClear = () => {
    if (window.confirm('确定要清空编辑器内容吗？')) {
      setMarkdown('');
    }
  };

  const handleInsertTemplate = (template) => {
    setMarkdown(template);
  };

  const generateApiUrl = () => {
    try {
      const encodedContent = btoa(encodeURIComponent(markdown));
      // 假设当前URL为基础
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}#/?md=${encodedContent}`;
    } catch (e) {
      console.error('生成API URL失败:', e);
      return '';
    }
  };

  const basicTemplate = `# 这是标题

这是一段文字。

> 这是一段引用

- 列表项 1
- 列表项 2
- 列表项 3

\`\`\`javascript
console.log("Hello, world!");
\`\`\``;

  return (
    <EditorContainer>
      <EditorHeader>
        <EditorTitle>Markdown 编辑器</EditorTitle>
        <EditorControls>
          <ControlButton onClick={() => handleInsertTemplate(basicTemplate)}>插入模板</ControlButton>
          <ControlButton onClick={handleClear}>清空</ControlButton>
        </EditorControls>
      </EditorHeader>
      <TextareaWrapper>
        <StyledTextarea 
          value={markdown} 
          onChange={handleChange}
          placeholder="输入 Markdown 内容..."
        />
      </TextareaWrapper>
    </EditorContainer>
  );
}

export default Editor;
