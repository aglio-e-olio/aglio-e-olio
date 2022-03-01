import React, { useRef, useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import hark from 'hark';
import Audio from '../Components/Audio/Audio';
import Canvas from '../Components/Canvas/Canvas';
import './Room.css';
import { useNavigate, useParams } from 'react-router-dom';
import CodeEditor from '../Components/CodeEditor/Editor';
import { codeContext } from '../Context/ContextProvider';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import Save from '../Components/Save/Save';
import UrlCopy from '../Components/UrlCopy';
import html2canvas from 'html2canvas';
import Record from '../Components/Record/Record';


let i = 0;
let doc;
let provider;
let awareness;
let yLines;
let undoManager;

const Room = () => {
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const peersRef = useRef([]);
  const { roomID } = useParams();

  const { codes, compileResult, getCompileResult, getRoomInfo, getUrl, addAudioStream } =
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

  const [isOpen, setOpen] = useState(false);
  const [muted, setMute] = useState('Mute');

  const handleSave = () => {
    // 여기서 모달 열어줌
    onCapture();
    // const jsonYLines = yLines
    // console.log(yLines, "보내기 직전 ylines")
    // console.log(jsonYLines, "보내기 직전 yjson")
    setOpen(true);
  };

  const handleSaveCancel = () => {
    setOpen(false);
  };

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
          // alert(`${new_member} 가 입장했습니다.`);
        });

        socketRef.current.on('bye', (left_user) => {
          // alert(`${left_user}가 떠났습니다.`);
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
        callerID, // 내 소켓 id
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

  const onCapture = async () => {
    let snapshotUrl = '';
    console.log('onCapture');
    await html2canvas(document.body)
      .then(async (canvas) => {
        snapshotUrl = canvas.toDataURL('image/png');
        getUrl(snapshotUrl);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  /* Render */
  return (
    <div>

      <div class='flex justify-start'>
        {peers.map((peer, index) => {
          return <Audio key={index} peer={peer} />;
        })}
      </div>
      <div>
        <Record />
        <button class="btn absolute bottom-20 right-4 z-30" onClick={sendCode}>
          Run
        </button>
        <UrlCopy />
        <button
          class="btn btn-success cursor-pointer absolute top-0 right-40"
          onClick={handleSave}
        >
          Save
        </button>
        <button 
          class="btn btn-success cursor-pointer absolute top-0 right-60"
          onClick={() => navigate(-1)}>스터디 끝내기</button>
        <Save isOpen={isOpen} 
        onCancel={handleSaveCancel} 
        yLines={yLines} 
        doc={doc}/>

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


