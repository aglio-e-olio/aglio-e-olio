import React, { useRef, useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import styled from 'styled-components';
import hark from 'hark';

import Canvas from '../Components/Canvas/Canvas';
import './Room.css';
import { useParams } from 'react-router-dom';
import CodeEditor from '../Components/CodeEditor/Editor';
import { codeContext } from '../Context/ContextProvider';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import Save from '../Components/Save/Save';
import Record from '../Components/Record/Record';

import { uploadFile } from 'react-s3';

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

    return () => { };
  }, []);
  return (
    <div>
      <StyledAudio autoPlay ref={ref} />
      <button style={{ backgroundColor: color, float: 'left' }}>
        상대방 버튼
      </button>
    </div>
  );
};

let i = 0;
let doc;
let provider;
let awareness;
let yLines;
let undoManager;

const Room = () => {
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const { roomID } = useParams();

  const { codes, compileResult, getCompileResult, getRoomInfo, allAudioStreams, addAudioStream } =
    useContext(codeContext);

  // 단 한번만 provider 만들기 : 다중 rendering 방지
  if (i === 0) {
    doc = new Y.Doc();
    provider = new WebrtcProvider(roomID, doc);
    awareness = provider.awareness;
    yLines = doc.getArray('lines~9');
    undoManager = new Y.UndoManager(yLines);
  }
  i++;

  const [muted, setMute] = useState('Mute');

  function sendCode() {
    socketRef.current.emit('code compile', { codes, roomID });
  }

  useEffect(() => {
    socketRef.current = io.connect('/');
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        addAudioStream(stream);
        let options = {};
        let speechEvents = hark(stream, options);

        speechEvents.on('speaking', function () { });

        speechEvents.on('stopped_speaking', () => { });
        getRoomInfo(roomID);
        socketRef.current.emit('join room', roomID);
        socketRef.current.on('all users', (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
          console.log(peers);
        });

        socketRef.current.on('hello', (new_member) => {
          alert(`${new_member} 가 입장했습니다.`);
        });

        socketRef.current.on('bye', (left_user) => {
          alert(`${left_user}가 떠났습니다.`);
        });

        socketRef.current.on('user joined', (payload) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });
          setPeers((users) => [...users, peer]);
        });

        socketRef.current.on('code response', (code) => {
          handleCompileResult(code);
        });

        socketRef.current.on('receiving returned signal', (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      })
      .catch((error) => {
        console.log(`getUserMedia error : ${error}`);
      });
  }, []);

  /* Below are Simple Peer Library Function */
  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    // RTC Connection
    peer.on('signal', (signal) => {
      socketRef.current.emit('sending signal', {
        userToSignal, // 상대방 소켓 id
        callerID,// 내 소켓 id
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit('returning signal', { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function handleCompileResult(code) {
    getCompileResult(code);
  }

  useEffect(() => {
    const startElem = document.getElementById("start");
    const stopElem = document.getElementById("stop");

    /* Change the below values to improve video quality. */
    const displayMediaOptions = {
      video: {
        cursor: "always",
        width: { max: 1920 },
        height: { max: 1080 },
        frameRate: 20
      }
    };

    startElem.onclick = async (e) => {
      var chunks = [];

      const audioContext = new AudioContext();
      const acDest = audioContext.createMediaStreamDestination();
      for (let i = 0; i < allAudioStreams.length; i++) {
        audioContext.createMediaStreamSource(allAudioStreams[i]).connect(acDest);
      }
      const screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      const mergedStream = new MediaStream([...screenStream.getTracks(), ...acDest.stream.getTracks()]);

      const mediaRecorder = new MediaRecorder(mergedStream, {
        mimeType: 'video/webm; codecs=vp8'
      });
      mediaRecorder.start();

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      }

      stopElem.onclick = () => {
        mediaRecorder.stop();
      }

      mediaRecorder.onstop = async (e) => {
        const blob = new Blob(chunks, { 'type': 'video/webm' })
        const fileName = prompt("녹화 파일의 이름을 적어주세요.");
        const newFile = new File([blob], fileName + ".webm", {
          type: blob.type,
        })
        console.log(newFile);
        const screenURL = window.URL.createObjectURL(newFile);
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

        uploadFile(newFile, config)
          .then(data => console.log(data))
          .catch(err => console.log(err))
      }
    }
  }, [allAudioStreams]);

  /* Render */
  return (
    <div>
      <div>
        <p><button id="start">Start Capture</button>&nbsp;<button id="stop">Stop Capture</button></p>
      </div>
      <div>
        {peers.map((peer, index) => {
          return <Audio key={index} peer={peer} />;
        })}
      </div>
      <div>
        <button className="run-button" onClick={sendCode}>
          Run
        </button>
        <Save />
        <Record />
        <Canvas
          doc={doc}
          provider={provider}
          awareness={awareness}
          yLines={yLines}
          undoManager={undoManager}
        />
        <CodeEditor doc={doc} provider={provider} />
      </div>
      <div>
        <textarea
          className="code-result"
          value={compileResult}
          placeholder={
            '코드 결과 출력 창입니다. \n현재 Javascript만 지원중입니다.'
          }
        />
      </div>
    </div>
  );
};

export default Room;
