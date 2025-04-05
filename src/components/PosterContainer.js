import React from 'react';
import styled from 'styled-components';

const StyledPosterContainer = styled.div`
  padding: 40px;
  background-color: ${props => props.bgColor || '#ffffff'};
  background-image: ${props => props.bgImage ? `url(${props.bgImage})` : 'none'};
  ${props => props.bgGradient ? `background-image: ${props.bgGradient};` : ''}
  background-size: cover;
  background-position: center;
  color: ${props => props.textColor || '#333333'};
  font-family: ${props => props.fontFamily || 'Inter, "Noto Sans SC", sans-serif'};
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
`;

function PosterContainer({ children, template = {}, forwardedRef, ...props }) {
  return (
    <StyledPosterContainer
      ref={forwardedRef}
      bgColor={template?.bgColor}
      bgImage={template?.bgImage}
      bgGradient={template?.bgGradient}
      textColor={template?.textColor}
      fontFamily={template?.fontFamily}
      {...props}
    >
      {children}
    </StyledPosterContainer>
  );
}

export default React.forwardRef((props, ref) => (
  <PosterContainer {...props} forwardedRef={ref} />
));
