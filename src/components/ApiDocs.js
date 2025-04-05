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
                <td>显示模式，设置为 "image" 时直接显示海报图片而不是编辑界面</td>
              </tr>
            </tbody>
          </Table>
        </Section>
        
        <Section>
          <h3>使用示例</h3>
          <p>以下是如何使用 URL 参数的示例：</p>
          
          <CodeBlock>{`// 基本 URL 结构 (编辑模式)
https://your-domain.com/#/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID

// 图片预览模式
https://your-domain.com/#/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID&mode=image

// 示例：使用 "dark" 模板显示 "# Hello World" 的 Markdown 内容
// Base64 编码的 "# Hello World" 是 IyBIZWxsbyBXb3JsZA==
https://your-domain.com/#/?md=IyBIZWxsbyBXb3JsZA==&template=dark`}</CodeBlock>
        </Section>
        
        <Section>
          <h3>分享和引用海报</h3>
          <p>你有多种方式分享和引用生成的海报：</p>
          
          <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>1. 海报页面 (类似 ReadPo)</h4>
          <CodeBlock>{`// 分享一个简洁的海报页面
https://your-domain.com/#/p/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID

// 示例：
https://your-domain.com/#/p/?md=IyBIZWxsbyBXb3JsZA==&template=dark`}</CodeBlock>
          
          <h4 style={{ marginTop: '15px', marginBottom: '10px' }}>2. 在 Markdown 中引用图片</h4>
          <CodeBlock>{`// 在 Markdown 文件中直接引用生成的海报图片
![图片描述](https://your-domain.com/#/image/abcd12345)

// 示例：
![Markdown Poster](https://your-domain.com/#/image/abcd12345)`}</CodeBlock>
          
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            注意：所有链接在当前会话有效，页面刷新后需要重新生成。如需长期保存，请下载图片并上传至图床。
          </p>
        </Section>
        
        <Section>
          <h3>使用命令行工具下载图片</h3>
          <p>你可以使用 wget、curl 等命令行工具直接下载生成的图片：</p>
          
          <CodeBlock>{`// 使用 wget 下载
wget "https://your-domain.com/#/download/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID" -O markdown-poster.png

// 使用 curl 下载
curl -o markdown-poster.png "https://your-domain.com/#/download/?md=BASE64_ENCODED_MARKDOWN&template=TEMPLATE_ID"

// 使用 Go HTTP 客户端下载
// 在 Go 代码中使用 http.Get() 访问上述 URL`}</CodeBlock>
          
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            访问下载链接时，系统会自动将 Markdown 内容转换为图片并触发下载。
          </p>
        </Section>
        
        <Section>
          <h3>生成 URL 参数</h3>
          <p>在 JavaScript 中生成 URL 参数的代码示例：</p>
          
          <CodeBlock>{`// 编码 Markdown 内容为 Base64
const markdown = "# Hello World";
const encodedMarkdown = btoa(encodeURIComponent(markdown));

// 生成编辑模式 URL
const templateId = "dark";
const editUrl = \`https://your-domain.com/#/?md=\${encodedMarkdown}&template=\${templateId}\`;

// 生成图片模式 URL
const imageUrl = \`https://your-domain.com/#/?md=\${encodedMarkdown}&template=\${templateId}&mode=image\`;

console.log("编辑链接:", editUrl);
console.log("图片链接:", imageUrl);`}</CodeBlock>
        </Section>
        
        <Section>
          <h3>支持的模板 ID</h3>
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
      </ModalContent>
    </ModalOverlay>
  );
}

export default ApiDocs;
