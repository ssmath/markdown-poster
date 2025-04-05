import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px 0;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  
  h1 {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(90deg, #0070f3, #00c6ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  span {
    font-size: 14px;
    color: #666;
    margin-left: 10px;
    padding: 2px 6px;
    background-color: #f0f0f0;
    border-radius: 4px;
  }
`;

const Nav = styled.nav`
  ul {
    display: flex;
    list-style: none;
    
    li {
      margin-left: 24px;
      
      a {
        color: #333;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
        cursor: pointer;
        
        &:hover {
          color: #0070f3;
        }
      }
    }
  }
`;

function Header({ onShowApiDocs }) {
  return (
    <HeaderContainer>
      <HeaderContent className="container">
        <Logo>
          <h1>Markdown Poster</h1>
          <span>Beta</span>
        </Logo>
        <Nav>
          <ul>
            <li><a onClick={onShowApiDocs}>API 文档</a></li>
            <li><a href="#">关于</a></li>
            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;
