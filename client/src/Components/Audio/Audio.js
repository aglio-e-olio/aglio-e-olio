import React, { useRef, useContext, useState, useEffect } from 'react';
import { codeContext } from '../../Context/ContextProvider';
import styled from 'styled-components';
import hark from 'hark';

const StyledAudio = styled.audio`
  float: left;
`;

const Audio = (props) => {
  const peerName = props.peer_info.peerName;
  console.log('audio 안 peer이름은?', peerName);
  const ref = useRef();
  const { addAudioStream } = useContext(codeContext);

  const [color, setColor] = useState(false);

  // props.peer_info.peer.on('disconnect', () => {
  //   console.log('audio안 peer연결이 끊겼습니다.');
  //   props.peer_info.peer.destroy();
  // });

  useEffect(() => {
    props.peer_info.peer.on('stream', (stream) => {
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
        <div class="avatar placeholder">
          <div class="bg-neutral-focus text-neutral-content ring ring-primary ring-offset-2 rounded-full w-12 h-12">
            <span>{peerName}</span>
          </div>
        </div>
      ) : (
        <div class="avatar placeholder ">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-12 h-12">
            <span>{peerName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audio;
