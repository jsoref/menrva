import React from "react";
import styled from "react-emotion";
import theme from "../styles/theme";

export default styled("div")`
  background: ${theme.gray3};
  padding: 1.2em 1em 1.5em;
  border-bottom: 1px solid ${theme.gray4};
  color: ${theme.gray5};

  a {
    display: inline-block;
    border-bottom: 1px solid ${theme.gray6};
    padding-bottom: 0.25em;
    text-decoration: none;
    margin: 0 0.5em;
    color: ${theme.gray6};
    font-size: 0.9em;
  }
`;
