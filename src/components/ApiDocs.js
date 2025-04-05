import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    background: linear-gradient(90deg, #0070f3, #00c6ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
`;

const Section = styled.section`
  margin-bottom: 30px;
  
  h3 {
    font-size: 18px;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eaeaea;
  }
  
  h4 {
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  p {
    margin-bottom: 15px;
    line-height: 1.6;
  }
`;

const CodeBlock = styled.pre`
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 15px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  th, td {
    border: 1px solid #eaeaea;
    padding: 10px;
    text-align: left;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  tr:nth-child(even) {
    background-color: #fafafa;
  }
`;

function ApiDocs({ onClose }) {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>API 文档</h2>
          <button onClick={onClose}>×</button>
        </ModalHeader>
        
        <Section>
          <h3>概述</h3>
          <p>Markdown Poster 是一个将 Markdown 内容转换为精美海报图片的工具。它提供了多种分享和使用方式，支持多种模板样式，可以满足不同场景的需求。</p>
        </Section>
        
        <Section>
          <h3>URL 参数</h3>
          <p>你可以通过 URL 参数来预设 Markdown 内容和模板，方便分享特定内容的海报。</p>
          
          <Table>
            <thead>
              <tr>
                <th>参数名</th>
                <th>类型</th>
                <th>描述</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>md</td>
                <td>string (Base64)</td>
                <td>Base64 编码的 Markdown 内容</td>
              </tr>
              <tr>
                <td>template</td>
                <td>string</td>
                <td>模板 ID，如 default、dark、sepia 等</td>
              </tr>
              <tr>
                <td>mode</td>
                <td>string</td>
                <td>显示模式：<br/>
                    - "image": 显示海报图片，带编辑和下载按钮<br/>
                    - "view": 只读视图，不显示编辑和下载按钮</td>
              </tr>
            </tbody>
          </Table>
        </Section>
        
        <Section>
          <h3>使用示例</h3>
          <p>以下是如何使用 URL 参数的各种示例：</p>
          
          <h4>基本编辑模式</h4>
          <CodeBlock>{`// 基本 URL 结构 (编辑模式)
https://your-domain.com/#/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID

// 示例：使用 "dark" 模板显示 "# Hello World" 的 Markdown 内容
// Base64 编码的 "# Hello World" 是 IyBIZWxsbyBXb3JsZA==
https://your-domain.com/#/?md=IyBIZWxsbyBXb3JsZA==&template=dark`}</CodeBlock>

          <h4>图片预览模式</h4>
          <CodeBlock>{`// 图片预览模式 (带编辑和下载按钮)
https://your-domain.com/#/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID&mode=image`}</CodeBlock>

          <h4>只读视图模式</h4>
          <CodeBlock>{`// 只读视图模式 (不显示编辑和下载按钮)
https://your-domain.com/#/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID&mode=view`}</CodeBlock>
        </Section>
        
        <Section>
          <h3>特殊页面路径</h3>
          <p>系统提供了多种特殊的页面路径，用于不同的展示和功能需求：</p>
          
          <Table>
            <thead>
              <tr>
                <th>路径</th>
                <th>描述</th>
                <th>示例</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#/p/</td>
                <td>海报页面模式，类似 ReadPo，显示带有编辑和下载按钮的海报</td>
                <td>https://your-domain.com/#/p/?md=BASE64_ENCODED_MARKDOWN&template=dark</td>
              </tr>
            </tbody>
          </Table>
        </Section>
        
        <Section>
          <h3>分享和引用海报</h3>
          <p>你有多种方式分享和引用生成的海报：</p>
          
          <h4>1. 海报页面链接（类似 ReadPo）</h4>
          <CodeBlock>{`// 分享一个简洁的海报页面
https://your-domain.com/#/p/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID

// 示例：
https://your-domain.com/#/p/?md=IyBIZWxsbyBXb3JsZA==&template=dark`}</CodeBlock>
          
          <h4>2. 只读视图链接（无编辑和下载按钮）</h4>
          <CodeBlock>{`// 分享一个只读视图（适合展示场景）
https://your-domain.com/#/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID&mode=view

// 示例：
https://your-domain.com/#/?md=IyBIZWxsbyBXb3JsZA==&template=dark&mode=view`}</CodeBlock>
        </Section>
                
        <Section>
          <h3>支持的模板 ID</h3>
          <p>系统内置了多种精美模板，可以通过模板 ID 在 URL 中指定：</p>
          
          <Table>
            <thead>
              <tr>
                <th>模板 ID</th>
                <th>名称</th>
                <th>描述</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>default</td>
                <td>默认白</td>
                <td>白色背景，黑色文字</td>
              </tr>
              <tr>
                <td>dark</td>
                <td>暗黑</td>
                <td>黑色背景，白色文字</td>
              </tr>
              <tr>
                <td>sepia</td>
                <td>复古</td>
                <td>米色背景，棕色文字</td>
              </tr>
              <tr>
                <td>gradient-blue</td>
                <td>蓝色渐变</td>
                <td>蓝色渐变背景，白色文字</td>
              </tr>
              <tr>
                <td>gradient-purple</td>
                <td>紫色渐变</td>
                <td>紫色渐变背景，白色文字</td>
              </tr>
              <tr>
                <td>minimal</td>
                <td>简约</td>
                <td>浅灰色背景，黑色文字</td>
              </tr>
              <tr>
                <td>nature</td>
                <td>自然</td>
                <td>自然风景背景图，白色文字</td>
              </tr>
              <tr>
                <td>city</td>
                <td>城市</td>
                <td>城市夜景背景图，白色文字</td>
              </tr>
            </tbody>
          </Table>
        </Section>

        <Section>
          <h3>技术实现说明</h3>
          <p>Markdown Poster 使用以下关键技术实现：</p>
          <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
            <li>基于 React 和 styled-components 构建用户界面</li>
            <li>使用 react-markdown 解析和渲染 Markdown 内容</li>
            <li>使用 html2canvas 将 DOM 元素转换为图片</li>
            <li>使用 sessionStorage 存储生成的图片数据，实现跨页面访问</li>
            <li>通过 URL hash 路由实现不同的应用模式</li>
          </ul>
        </Section>
        
        <Section>
          <h3>兼容性与限制</h3>
          <p>使用 Markdown Poster 时，请注意以下限制：</p>
          <ul style={{ marginLeft: '20px', lineHeight: '1.6' }}>
            <li>图片链接在当前会话有效，页面刷新后需要重新生成</li>
            <li>较大的 Markdown 内容可能导致 URL 过长，超出浏览器限制</li>
            <li>包含远程图片的 Markdown 可能受到跨域限制</li>
          </ul>
        </Section>
      </ModalContent>
    </ModalOverlay>
  );
}

export default ApiDocs;
