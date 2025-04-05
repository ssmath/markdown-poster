import React from 'react';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

const TemplatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
`;

const TemplateCard = styled.div`
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid ${props => props.isSelected ? '#0070f3' : 'transparent'};
  box-shadow: ${props => props.isSelected ? '0 0 0 2px rgba(0, 112, 243, 0.2)' : '0 2px 6px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.isSelected 
      ? '0 6px 12px rgba(0, 112, 243, 0.15), 0 0 0 2px rgba(0, 112, 243, 0.2)' 
      : '0 6px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const TemplatePreview = styled.div`
  height: 120px;
  background-color: ${props => props.bgColor || '#ffffff'};
  background-image: ${props => props.bgImage ? `url(${props.bgImage})` : 'none'};
  ${props => props.bgGradient ? `background-image: ${props.bgGradient};` : ''}
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TemplateName = styled.div`
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  background-color: #fff;
  border-top: 1px solid #eaeaea;
`;

function TemplateSelector({ templates, selectedTemplate, onSelectTemplate }) {
  return (
    <SelectorContainer>
      <Title>选择模板</Title>
      <TemplatesGrid>
        {templates.map((template) => (
          <TemplateCard 
            key={template.id}
            isSelected={template.id === selectedTemplate.id}
            onClick={() => onSelectTemplate(template)}
          >
            <TemplatePreview 
              bgColor={template.bgColor}
              bgImage={template.bgImage}
              bgGradient={template.bgGradient}
            >
              <span style={{ color: template.textColor, fontSize: '24px', fontWeight: 'bold' }}>
                Aa
              </span>
            </TemplatePreview>
            <TemplateName>{template.name}</TemplateName>
          </TemplateCard>
        ))}
      </TemplatesGrid>
    </SelectorContainer>
  );
}

export default TemplateSelector;
