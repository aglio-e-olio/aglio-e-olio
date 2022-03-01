import React, {useRef, useContext, useState, useEffect } from 'react'
import { codeContext } from '../../Context/ContextProvider';
import styled from 'styled-components';
import hark from 'hark';

const StyledAudio = styled.audio`
  float: left;
`;

const Audio = (props) => {
    const ref = useRef();
    const { addAudioStream } = useContext(codeContext);
  
    const [color, setColor] = useState('black');
  
    useEffect(() => {
      props.peer.on('stream', (stream) => {
        addAudioStream(stream);
        ref.current.srcObject = stream;
        let options = {};
        let speechEvents = hark(stream, options);
  
        speechEvents.on('speaking', function () {
          setColor('yellow');
        });
  
        speechEvents.on('stopped_speaking', function () {
          setColor('black');
        });
      });
    }, []);
    return (
      <div>
        <StyledAudio  autoPlay ref={ref} />
        <button style={{ backgroundColor: color, float: 'left' }}>
          상대방 버튼
        </button>
      </div>
    );
  };

export default Audio