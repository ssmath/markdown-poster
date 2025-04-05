import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { imageStore } from './ImageService';

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: transparent;
  margin: 0;
  padding: 0;
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100vh;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  padding: 20px;
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

function ImageViewer() {
  const [imageData, setImageData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    try {
      // 从URL获取图片ID
      const path = window.location.hash.substring(1); // 去掉 # 符号
      const match = path.match(/\/image\/([a-z0-9]+)/i);
      
      if (!match || !match[1]) {
        setError('Invalid image URL');
        return;
      }
      
      const imageId = match[1];
      const image = imageStore.getImage(imageId);
      
      if (!image) {
        setError('Image not found or expired');
        return;
      }
      
      setImageData(image);
    } catch (err) {
      console.error('Error loading image:', err);
      setError('Failed to load image');
    }
  }, []);
  
  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }
  
  if (!imageData) {
    return <ErrorMessage>Loading image...</ErrorMessage>;
  }
  
  return (
    <ImageContainer>
      <StyledImage src={imageData} alt="Markdown Poster" />
    </ImageContainer>
  );
}

export default ImageViewer;
