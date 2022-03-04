import React, { useRef, useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import hark from 'hark';
import { codeContext } from '../../Context/ContextProvider';

const StyledAudio = styled.audio`
  float: left;
`;

const MyAudio = () => {
  const { persistUser } = useContext(codeContext);
  const ref = useRef();
  const [color, setColor] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
      <StyledAudio autoPlay muted ref={ref} />

      {color ? (
        <div class="avatar placeholder m-1">
          <div class="bg-neutral-focus text-neutral-content ring ring-secondary ring-offset-0 rounded-full w-12 h-12">
            <span>{persistUser}</span>
          </div>
        </div>
      ) : (
        <div class="avatar placeholder m-1">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12">
            <span>{persistUser}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAudio;
