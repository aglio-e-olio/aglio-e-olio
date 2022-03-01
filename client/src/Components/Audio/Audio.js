import React, { useRef, useContext, useState, useEffect } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import styled from 'styled-components';
import hark from 'hark';

const StyledAudio = styled.audio`
  float: left;
`;

const Audio = (props) => {
  const ref = useRef();
  const { addAudioStream } = useContext(codeContext);

  const [color, setColor] = useState(false);

  useEffect(() => {
    props.peer.on('stream', (stream) => {
      addAudioStream(stream);
      ref.current.srcObject = stream;
      let options = {};
      let speechEvents = hark(stream, options);

      speechEvents.on('speaking', function () {
        setColor(true);
      });

      speechEvents.on('stopped_speaking', function () {
        setColor(false);
      });
    });
  }, []);
  return (
    <div>
      <StyledAudio autoPlay ref={ref} />
      {color ? (
        <div class="avatar online placeholder">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12">
            <span>ON</span>
          </div>
        </div>
      ) : (
        <div class="avatar placeholder">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12">
            <span>OFF</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audio;
