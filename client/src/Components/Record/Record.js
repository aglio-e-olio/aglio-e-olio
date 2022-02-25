import React, { useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { uploadFile } from 'react-s3';
import { codeContext } from '../../Context/ContextProvider';


const StyledSave = styled.div`
  position : absolute;
  margin-top : 5px;
  margin-left: 1200px;
`;

/* Change the values below to adjust video quality. */
const displayMediaOptions = {
  video: {
    cursor: "always",
    width: { max: 1920 },
    height: { max: 1080 },
    frameRate: 20
  }
};

const Record = () => {
  const recordRef = useRef();
  const stopRef = useRef();
  const { allAudioStreams } = useContext(codeContext);

  useEffect(() => {
    recordRef.current.onclick = async (e) => {
      /* Merge all relevant streams including audio and screen into a single stream*/
      const audioContext = new AudioContext();
      const acDest = audioContext.createMediaStreamDestination();
      for (let i = 0; i < allAudioStreams.length; i++) {
        audioContext.createMediaStreamSource(allAudioStreams[i]).connect(acDest);
      }
      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      const mergedStream = new MediaStream([...screenStream.getTracks(), ...acDest.stream.getTracks()]);

      /* Initialize media recorder based on the merged stream above 
       * and register event handlers for starting and stopping recording.
       */
      var chunks = [];
      const mediaRecorder = new MediaRecorder(mergedStream, {
        mimeType: 'video/webm; codecs=vp8'
      });

      mediaRecorder.start();

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      }

      stopRef.current.onclick = () => {
        mediaRecorder.stop();
      }

      mediaRecorder.onstop = async (e) => {
        screenStream.getTracks()[0].stop();
        
        const blob = new Blob(chunks, { 'type': 'video/webm' })
        const fileName = prompt("녹화 파일의 이름을 적어주세요.");
        const recordFile = new File([blob], fileName + ".webm", {
          type: blob.type,
        })
        console.log(recordFile);
        const screenURL = window.URL.createObjectURL(recordFile);
        console.log(screenURL);

        const S3_BUCKET = 'screen-audio-record';
        const REGION = 'ap-northeast-2';
        const ACCESS_KEY = prompt("AWS ACCESS_KEY를 입력해주세요.");
        const SECRET_ACCESS_KEY = prompt('AWS SECRET_ACCESS_KEY를 입력해주세요.');

        const config = {
          bucketName: S3_BUCKET,
          region: REGION,
          accessKeyId: ACCESS_KEY,
          secretAccessKey: SECRET_ACCESS_KEY,
        }

        uploadFile(recordFile, config)
          .then(data => console.log(data))
          .catch(err => console.log(err))
      }
    }
  }, [allAudioStreams]);

  return (
    <StyledSave>
      <button className="record-button" ref={recordRef}>
        Record
      </button>
      <button className="record-button" ref={stopRef}>
        Stop
      </button>
    </StyledSave>
  );
};

export default Record;
