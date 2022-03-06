import React, { useRef, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';

const StyledAudio = styled.audio`
  float: left;
`;

const Audio = (props) => {
  const ref = useRef();

  useEffect(() => {
    ref.current.srcObject = props.stream;
  }, []);
  return (
    <div>
      <StyledAudio autoPlay ref={ref} />
    </div>
  );
};

export default Audio;
