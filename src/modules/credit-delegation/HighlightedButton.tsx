import { Button, keyframes, styled } from '@mui/material';

const animation = keyframes`
    0% {
        background-position: 0% 0%;
    }

    100% {
        background-position: 100% 0%;
    }
`;

export const HighlightedButton = styled(Button)`
  background: linear-gradient(220.27deg, #e78aff99, #00f7da99, #e78aff99, #00f7da99);
  background-size: 400% 100%;
  animation: ${animation} 5s linear infinite;
  will-change: background-position;
  border-radius: 15px;
  text-transform: uppercase;
  font-weight: 600;

  &:hover {
    background: linear-gradient(220.27deg, #e78aff, #00f7da, #e78aff, #00f7da);
    background-size: 400% 100%;
    animation-play-state: paused;
  }
`;
