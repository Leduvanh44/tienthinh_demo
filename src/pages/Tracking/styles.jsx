import styled, { createGlobalStyle } from "styled-components";

export const prefixId = "reactSchedulerOutsideWrapper";

export const GlobalStyle = createGlobalStyle`
  #${prefixId} {
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    margin: 0;
  }
`;
export const StyledSchedulerFrame = styled.div`
  position: relative; 
  top: 0;
  right: 0;
  width: calc(100vw - 100px); 
  height: 100vh; 
  display: flex;
  justify-content: center;
  align-items: center;
  background: #FFFFFF;
  overflow: auto;
  
  // max-width: 1300px; 
  margin-left: auto; 
  margin-right: auto;
`;
