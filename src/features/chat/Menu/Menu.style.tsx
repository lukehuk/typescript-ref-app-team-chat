import styled from "styled-components/macro";
import posed from "react-pose";

export const Wrapper = styled.section<{ pose: string }>`
  display: ${props => (props.pose === "closed" ? "none" : "flex")};
  flex-direction: column;
  background-color: #ffffff;
  max-width: 290px;
  width: 100%;
  @media (max-width: 480px) {
    max-width: none;
  }
`;

export const AnimatedWrapper = posed(Wrapper)({
  open: { width: "100%", applyAtStart: { display: "flex" } },
  closed: { width: "24px", applyAtEnd: { display: "none" } }
});

export const Logo = styled.img`
  width: 75%;
  margin: 20px auto;
  content: var(--logo-content);
`;
