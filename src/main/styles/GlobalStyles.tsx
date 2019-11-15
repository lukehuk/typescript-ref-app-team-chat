import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`

    body {
        font-family: 'Roboto', sans-serif;
        font-weight:400;
        margin: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      * {
        box-sizing: border-box;
      }
      
      body,
      html,
      #root {
        height: 100%;
      }
    
    :root {
      --accent-color-1: #ff8833;
      --accent-color-2: #ff8833;
      --accent-color-3: #02b9c1;
      --accent-color-4: #979797;
      --accent-color-5: #f0f3f7;
      --logo-content: url('/company_logo.svg')
    }
`;

export default GlobalStyles;
