import React from 'react'
import PropTypes from 'prop-types';
import styled from 'react-emotion';
import { fadeIn } from "../styles/keyframes";
import theme from "../styles/theme";

const LoadingSpinner = (props) => {
  return (
    <StyledSvg {...props} viewBox="0 0 64 64" {...props}>
        <g>
          <defs>
            <linearGradient id="sGD" gradientUnits="userSpaceOnUse" x1="55" y1="46" x2="2" y2="46">
              <stop offset="0.1" stopColor="currentColor"></stop>
              <stop offset="1" stopColor="currentColor"></stop>
            </linearGradient>
          </defs>
          <g strokeWidth="4" strokeLinecap="round" fill="none" transform="rotate(82.912 32 32)">
          <path stroke="url(#sGD)" d="M4,32 c0,15,12,28,28,28c8,0,16-4,21-9"></path>
          <path d="M60,32 C60,16,47.464,4,32,4S4,16,4,32"></path>
          <animateTransform values="0,32,32;360,32,32" attributeName="transform" type="rotate" repeatCount="indefinite" dur="1"></animateTransform>
          </g>
        </g>
      </StyledSvg>
  );
};

const StyledSvg = styled('svg')`
  position: absolute;
  left: 50%;
  top: 50vh;
  transform: translateY(-50%, -50%);
  width: 75px;
  height: 75px;
  opacity: 0;
  animation: 3s forwards ${fadeIn};
  color: ${theme.gray7};
`;

export default LoadingSpinner;
