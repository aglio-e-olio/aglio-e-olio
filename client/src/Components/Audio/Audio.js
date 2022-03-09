import React, { useRef, useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import hark from 'hark';

const StyledAudio = styled.audio`
  float: left;
`;

const Audio = (props) => {
  const audioRef = useRef();
  const nameRef = useRef();
  const [color, setColor] = useState(false);
  
  useEffect(() => {
    const peerName = props.peerAudio.name;
    nameRef.current.textContent = peerName;
    let stream = props.peerAudio.stream;
    audioRef.current.srcObject = stream;
    
    let options = {};
    let speechEvents = hark(stream, options);
    
    speechEvents.on('speaking', function () {
      setColor(true);
    });

    speechEvents.on('stopped_speaking', function () {
      setColor(false);
    });

  }, []);
  return (
    <div>
      <StyledAudio autoPlay ref={audioRef} />
      {/* <button>{props.peer.peerID}</button> */}
      {color ? (
        <div class="avatar placeholder m-1">
          <div class="bg-neutral-focus text-neutral-content ring ring-primary ring-offset-2 rounded-full w-12 h-12">
            <span ref={nameRef}></span>
          </div>
        </div>
      ) : (
        <div class="avatar placeholder m-1">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12">
            <span ref={nameRef}></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audio;
