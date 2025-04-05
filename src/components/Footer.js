import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #f5f5f5;
  padding: 30px 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
`;

const Copyright = styled.div`
  color: #666;
  
  a {
    color: #0070f3;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FooterNav = styled.nav`
  ul {
    display: flex;
    list-style: none;
    
    li {
      margin-left: 20px;
      
      @media (max-width: 768px) {
        margin: 0 10px;
      }
      
      a {
        color: #666;
        text-decoration: none;
        
        &:hover {
          color: #0070f3;
        }
      }
    }
  }
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterContent className="container">
        <Copyright>
          © {new Date().getFullYear()} Markdown Poster Generator. 基于 <a href="https://react-markdown.dev/" target="_blank" rel="noopener noreferrer">react-markdown</a> 和 <a href="https://html2canvas.hertzen.com/" target="_blank" rel="noopener noreferrer">html2canvas</a> 构建。
        </Copyright>
        <FooterNav>
          <ul>
            <li><a href="#">隐私政策</a></li>
            <li><a href="#">使用条款</a></li>
            <li><a href="#">联系我们</a></li>
          </ul>
        </FooterNav>
      </FooterContent>
    </FooterContainer>
  );
}

export default Footer;
