import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {v1 as uuid} from 'uuid';
import { uploadFile } from 'react-s3';
import { codeContext } from '../../Context/ContextProvider';
import RecordModal from '../RecordModal/RecordModal';


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
  const [isOpen, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const handleSaveCancel = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  }

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
        const fileName = uuid();
        const recordFile = new File([blob], fileName + ".webm", {
          type: blob.type,
        })
        console.log(recordFile);
        const screenURL = window.URL.createObjectURL(recordFile);
        console.log(screenURL);

        const config = {
          bucketName: process.env.REACT_APP_S3_BUCKET,
          region: process.env.REACT_APP_REGION,
          accessKeyId: process.env.REACT_APP_ACCESS_KEY,
          secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
        };

        uploadFile(recordFile, config)
          .then(data => setVideoUrl(data.location))
          .catch(err => console.log(err))
      }
    }
  }, [allAudioStreams]);

  return (
    <StyledSave>
      <button class="btn fixed top-0 right-1/3" ref={recordRef}>
        Record
      </button>
      <button class="btn fixed top-0 right-1/4" ref={stopRef} onClick={handleOpen}>
        Stop
      </button>
      <RecordModal  isOpen={isOpen} onCancel={handleSaveCancel} videoUrl={videoUrl}/>
    </StyledSave>
  );
};

export default Record;


