import styled from '@emotion/styled';
import { LinearProgress, linearProgressClasses, Theme } from '@mui/material';

const GREEN_SECTION_BORDER = 40;
const RED_SECTION_BORDER = 80;

const getColorByValue = (value = 0) => {
  if (value < GREEN_SECTION_BORDER) {
    return 'success';
  }

  if (value < RED_SECTION_BORDER) {
    return 'warning';
  }

  return 'error';
};

export const BatteryProgress = styled(LinearProgress)((props) => ({
  background: '#fff',
  border: `1px solid ${(props.theme as Theme).palette.divider}`,
  height: 10,
  borderRadius: 2,
  width: '100%',
  [`& .${linearProgressClasses.bar}`]: {
    padding: 1,
    background: `linear-gradient(90deg, #ffffff 49%, ${
      (props.theme as Theme).palette[getColorByValue(props.value)].main
    } 50%)`,
    backgroundRepeat: 'repeat-x',
    backgroundSize: '5px',
    backgroundClip: 'content-box',
  },
}));
