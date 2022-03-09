import React, { useRef, useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import Canvas from '../Components/Canvas/Canvas';
import './Room.css';
import { useNavigate, useParams } from 'react-router-dom';
import { codeContext } from '../Context/ContextProvider';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import Save from '../Components/Save/Save';
import RecordModal from '../Components/RecordModal/RecordModal';
import html2canvas from 'html2canvas';
import AbsoluteUI from '../Components/AbsoluteUI/AbsoluteUI';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import * as mediasoupClient from 'mediasoup-client';

let doc;
let provider;
let awareness;
let yLines;
let undoManager;

let producerTransport;
let consumerTransport;

let consumers = new Map();
let producers = new Map();

let screenTrackHolder = null;
let producerLabel = new Map();

// Media-server
const socket = io.connect('https://aglio-olio.shop', {
  withCredentials: false,
});

/* Change the values below to adjust video quality. */
const displayMediaOptions = {
  video: {
    width: { max: 1920 },
    height: { max: 1080 },
    frameRate: 20,
  },
  audio: false,
};

const mediaType = {
  audio: 'audioType',
  video: 'videoType',
  screen: 'screenType',
  allAudio: 'allAudio',
};

const Room = () => {
  const socketRef = useRef();
  const { roomID } = useParams();
  const [peers, setPeers] = useState([]);
  const [isEraser, setIsEraser] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const {
    getCompileResult,
    getRoomInfo,
    getUrl,
    addAudioStream,
    persistUser,
    persistEmail,
    docGenerateCount,
    setDocGCount,
  } = useContext(codeContext);

  const remoteAudiosRef = useRef();
  const startAudioButtonRef = useRef();
  const stopAudioButtonRef = useRef();
  const startRecordButtonRef = useRef();
  const stopRecordButtonRef = useRef();
  const deviceRef = useRef();
  const isRecordingRef = useRef(false);

  const [peerAudios, setPeerAudios] = useState(new Map());
  const peerAudioUpsert = (key, value) => {
    setPeerAudios((prev) => new Map(prev).set(key, value));
  };
  const peerAudioDelete = (key) => {
    setPeerAudios((prev) => {
      const newState = new Map(prev);
      newState.delete(key);
      return newState;
    });
  };

  socket.request = (type, data = {}) => {
    return new Promise((resolve, reject) => {
      socket.emit(type, data, (data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      });
    });
  };

  useEffect(() => {
    if (persistUser === '') {
      return;
    }

    createRoom(roomID).then(async () => {
      await join(persistUser, persistEmail, roomID);
      initSockets();
    });

    // startAudioButtonRef.current.addEventListener('click', () => {
    //   produce(mediaType.audio);
    // });
    // stopAudioButtonRef.current.addEventListener('click', () => {
    //   closeProducer(mediaType.audio, false)
    // });
  }, [persistUser]);

  ////////// INIT /////////

  const createRoom = async (room_id) => {
    await socket
      .request('createRoom', {
        room_id,
      })
      .then((data) => {
        console.log(`Room "${room_id}" ${data}`);
      })
      .catch((err) => {
        console.log('Create room error:', err);
      });
  };

  const join = async (name, email, room_id) => {
    socket
      .request('join', {
        name,
        email,
        room_id,
      })
      .then(async function (roomObject) {
        console.log('Joined the following room: ', roomObject);
        const data = await socket.request('getRouterRtpCapabilities');
        deviceRef.current = await loadDevice(data);
        await initTransports(deviceRef);
        await socket.request('getProducers');
        produce(mediaType.audio);
      })
      .catch((err) => {
        console.log('Join error:', err);
      });
  };

  const loadDevice = async (routerRtpCapabilities) => {
    let device;
    try {
      device = new mediasoupClient.Device();
    } catch (error) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported');
        alert('Browser not supported');
      }
      console.error(error);
    }
    await device.load({
      routerRtpCapabilities,
    });
    return device;
  };

  const initTransports = async (deviceRef) => {
    // init producerTransport
    let device = deviceRef.current;
    {
      const data = await socket.request('createWebRtcTransport', {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities,
      });

      if (data.error) {
        console.error(data.error);
        return;
      }

      producerTransport = device.createSendTransport(data);

      producerTransport.on(
        'connect',
        async function ({ dtlsParameters }, callback, errback) {
          socket
            .request('connectTransport', {
              dtlsParameters,
              transport_id: data.id,
            })
            .then(callback)
            .catch(errback);
        }
      );

      producerTransport.on(
        'produce',
        async function ({ kind, rtpParameters }, callback, errback) {
          try {
            if (isRecordingRef.current === true) {
              const { producer_id } = await socket.request('produce', {
                producerTransportId: producerTransport.id,
                kind,
                rtpParameters,
                isRecording: true,
              });
              callback({
                id: producer_id,
              });
            } else {
              const { producer_id } = await socket.request('produce', {
                producerTransportId: producerTransport.id,
                kind,
                rtpParameters,
                isRecording: false,
              });
              callback({
                id: producer_id,
              });
            }
          } catch (err) {
            errback(err);
          }
        }
      );

      producerTransport.on('connectionstatechange', function (state) {
        switch (state) {
          case 'connecting':
            break;

          case 'connected':
            //localVideo.srcObject = stream
            break;

          case 'failed':
            producerTransport.close();
            break;

          default:
            break;
        }
      });
    }

    // init consumerTransport
    {
      const data = await socket.request('createWebRtcTransport', {
        forceTcp: false,
      });

      if (data.error) {
        console.error(data.error);
        return;
      }

      // only one needed
      consumerTransport = device.createRecvTransport(data);
      consumerTransport.on(
        'connect',
        function ({ dtlsParameters }, callback, errback) {
          socket
            .request('connectTransport', {
              transport_id: consumerTransport.id,
              dtlsParameters,
            })
            .then(callback)
            .catch(errback);
        }
      );

      consumerTransport.on('connectionstatechange', async function (state) {
        switch (state) {
          case 'connecting':
            break;

          case 'connected':
            //remoteVideo.srcObject = await stream;
            //await socket.request('resume');
            break;

          case 'failed':
            consumerTransport.close();
            break;

          default:
            break;
        }
      });
    }
  };

  const initSockets = async () => {
    socket.on('consumerClosed', function ({ consumer_id }) {
      console.log('Closing consumer:', consumer_id);
      removeConsumer(consumer_id);
    });

    /**
     * data: [ {
     *  producer_id:
     *  producer_socket_id:
     * }]
     */
    socket.on('newProducers', async function (producerList) {
      console.log('New producers', producerList);
      for (let { producer_id, peer_id } of producerList) {
        await consume(producer_id, peer_id);
      }
    });

    socket.on('disconnect', function () {
      exit(true);
    });

    socket.on('hello', (new_member) => {
      console.log('name이 찍히는지?', new_member);
      toast.success(`${new_member}님이 입장했습니다`, {
        autoClose: 2000,
        position: toast.POSITION.TOP_RIGHT,
      });
    });

    socket.on('bye', (left_member) => {
      console.log('name이 찍히는지?', left_member);
      toast.error(`${left_member}님이 나갔습니다`, {
        autoClose: 2000,
        position: toast.POSITION.TOP_RIGHT,
      });
    });

    socket.on('code response', (code) => {
      handleCompileResult(code);
    });
  };

  //////// MAIN FUNCTIONS /////////////
  const startRecord = async () => {
    console.log('startRecord()');
    isRecordingRef.current = true;
    await produce(mediaType.screen);
    await produce(mediaType.allAudio);

    socket.emit('start-record', (data) => {
      if (data.error) {
        screenTrackStop();
        closeProducer(mediaType.screen, true);
        closeProducer(mediaType.allAudio, true);
        alert(data.error);
        startRecordButtonRef.current.disabled = false;
        stopRecordButtonRef.current.disabled = true;
        isRecordingRef.current = false;
      } else {
        alert(data.success);
      }
    });
  };

  const stopRecord = () => {
    console.log('stopRecord()');

    socket.emit('stop-record', ({ m3u8Link }) => {
      closeProducer(mediaType.screen, true);
      closeProducer(mediaType.allAudio, true);
      setVideoUrl((prev) => (prev = m3u8Link));
      handleVideoSave();
    });

    isRecordingRef.current = false;
  };

  const produce = async (type) => {
    let mediaConstraints = {};
    let audio = false;
    let screen = false;
    let allAudio = false;
    switch (type) {
      case mediaType.audio:
        mediaConstraints = {
          audio: true,
          video: false,
        };
        audio = true;
        break;
      case mediaType.screen:
        mediaConstraints = displayMediaOptions;
        screen = true;
        break;
      case mediaType.allAudio:
        allAudio = true;
        break;
      default:
        return;
    }
    if (!deviceRef.current.canProduce('video') && !audio) {
      console.error('Cannot produce video');
      return;
    }
    if (producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type);
      return;
    }
    console.log('Mediacontraints:', mediaConstraints);
    let stream;
    try {
      if (type === mediaType.allAudio) {
        // audio Context API로 consumer들에 모은 stream 합치기
        if (consumers.size === 0 && !producerLabel.has(mediaType.audio)) {
          return;
        }
        const audioContext = new AudioContext();
        const acDest = audioContext.createMediaStreamDestination();
        for (const otherStream of consumers.values()) {
          audioContext.createMediaStreamSource(otherStream).connect(acDest);
        }
        if (producerLabel.has(mediaType.audio)) {
          let myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          audioContext.createMediaStreamSource(myStream).connect(acDest);
        }
        stream = new MediaStream([...acDest.stream.getTracks()]);
      } else if (type === mediaType.audio) {
        stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints);
      }
      console.log(
        'supportedConstraints: ' +
          navigator.mediaDevices.getSupportedConstraints()
      );

      let track;
      if (audio || allAudio) {
        track = stream.getAudioTracks()[0];
      } else {
        track = stream.getVideoTracks()[0];
        screenTrackHolder = track;
      }

      const params = {
        track: track,
      };
      let producer = await producerTransport.produce(params);

      console.log('Producer', producer);

      producers.set(producer.id, producer);

      let elem;

      producer.on('trackended', () => {
        closeProducer(type, false);
      });

      producer.on('transportclose', () => {
        console.log('Producer transport close');
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop();
          });
          elem.parentNode.removeChild(elem);
        }
        producers.delete(producer.id);
      });

      producer.on('close', () => {
        console.log('Closing producer');
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop();
          });
          elem.parentNode.removeChild(elem);
        }
        producers.delete(producer.id);
      });

      producerLabel.set(type, producer.id);
    } catch (err) {
      console.log('Produce error:', err);
    }
  };

  const consume = async (producer_id, peer_id) => {
    getConsumeStream(producer_id, peer_id).then(function ({
      consumer,
      stream,
      kind,
      peerName,
    }) {
      consumers.set(consumer.id, stream);

      if (kind === 'video') {
        /* No need */
      } else {
        peerAudioUpsert(consumer.id, { name: peerName, stream: stream });
      }

      consumer.on('trackended', function () {
        removeConsumer(consumer.id);
      });

      consumer.on('transportclose', function () {
        removeConsumer(consumer.id);
      });
    });
  };

  const getConsumeStream = async (producerId, peerId) => {
    const { rtpCapabilities } = deviceRef.current;
    const data = await socket.request('consume', {
      rtpCapabilities,
      consumerTransportId: consumerTransport.id, // might be
      producerId,
      peerId,
    });
    const { consumerId, kind, rtpParameters, peerName } = data;

    let codecOptions = {};
    const consumer = await consumerTransport.consume({
      id: consumerId,
      producerId,
      kind,
      rtpParameters,
      codecOptions,
    });

    const stream = new MediaStream();
    stream.addTrack(consumer.track);

    return {
      consumer,
      stream,
      kind,
      peerName,
    };
  };

  const closeProducer = async (type, isRecording) => {
    if (!producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type);
      return;
    }

    let producer_id = producerLabel.get(type);
    console.log('Close producer', producer_id);

    await socket.request('producerClosed', {
      producer_id,
      isRecording: isRecording,
    });

    producers.get(producer_id).close();
    producers.delete(producer_id);
    producerLabel.delete(type);

    if (type !== mediaType.audio || type !== mediaType.allAudio) {
      screenTrackStop();
    }
  };

  const pauseProducer = (type) => {
    if (!producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type);
      return;
    }

    let producer_id = producerLabel.get(type);
    producers.get(producer_id).pause();
  };

  const resumeProducer = (type) => {
    if (!producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type);
      return;
    }

    let producer_id = producerLabel.get(type);
    producers.get(producer_id).resume();
  };

  const removeConsumer = (consumer_id) => {
    peerAudioDelete(consumer_id);
  };

  const exit = (offline = false) => {
    let clean = function () {
      consumerTransport.close();
      producerTransport.close();
      socket.off('disconnect');
      socket.off('newProducers');
      socket.off('consumerClosed');
    };

    if (!offline) {
      socket
        .request('exitRoom')
        .then((e) => console.log(e))
        .catch((e) => console.warn(e))
        .finally(function () {
          clean();
        });
    } else {
      clean();
    }
  };

  const screenTrackStop = () => {
    if (screenTrackHolder !== null) {
      screenTrackHolder.stop();
      screenTrackHolder = null;
    }
  };

  function handleCompileResult(code) {
    getCompileResult(code);
  }

  ////////////////////////////////////////////////

  // 단 한번만 provider 만들기 : 다중 rendering 방지
  if (docGenerateCount === 0) {
    doc = new Y.Doc();
    provider = new WebrtcProvider(roomID, doc);
    awareness = provider.awareness;
    yLines = doc.getArray('lines~9');
    undoManager = new Y.UndoManager(yLines);
    setDocGCount(1);
  }

  const handleSave = () => {
    // 여기서 모달 열어줌
    onCapture();
    setOpen(true);
  };

  const handleSaveCancel = () => {
    setOpen(false);
  };

  const handleVideoSave = () => {
    // 여기서 RecordModal 열어줌
    setVideoModalOpen((prev) => (prev = true));
  };

  const handleVideoSaveCancel = () => {
    setVideoModalOpen((prev) => (prev = false));
  };

  // function sendCode() {
  //   socketRef.current.emit('code compile', { codes, roomID });
  // }

  // useEffect(() => {
  //   socketRef.current = io.connect('/');
  //   navigator.mediaDevices
  //     .getUserMedia({ audio: true })
  //     .then((stream) => {
  //       addAudioStream(stream);
  //       getRoomInfo(roomID);
  //       console.log('join넘기기전 persistUser : ', persistUser);
  //       if (!!persistUser) {
  //         socketRef.current.emit('join room', {
  //           roomID,
  //           persistUser,
  //           persistEmail,
  //         });
  //       }
  //       socketRef.current.on('all users', (props) => {
  //         const peers = [];
  //         props.users.forEach((userID) => {
  //           //createPeer 함수안에서 서버한테 상대방 소켓 id 담아서 sending signal 날린다.
  //           const peer = createPeer(userID, socketRef.current.id, stream);
  //           peersRef.current.push({
  //             peerID: userID,
  //             peer,
  //           });
  //           const peerName = props.names[userID];
  //           console.log('상대방 이름은', peerName);
  //           //내가 만든 peer 와 상대방 이름이 들어있다.
  //           peers.push({ peer: peer, peerName: peerName });
  //         });
  //         setPeers(peers);
  //         console.log(peers);
  //       });

  //       socketRef.current.on('hello', (new_member) => {
  //         console.log(new_member);
  //         alert(`${new_member} 님이 입장했습니다.`);
  //       });

  //       socketRef.current.on('bye', (left_user) => {
  //         alert(`${left_user} 님이 떠났습니다.`);
  //       });

  //       socketRef.current.on('user joined', (payload) => {
  //         const peer = addPeer(payload.signal, payload.callerID, stream);
  //         peersRef.current.push({
  //           peerID: payload.callerID,
  //           peer,
  //         });
  //         const peerName = payload.names[payload.callerID];
  //         console.log('addPeer할때 peerName은', peerName);
  //         setPeers((users) => [...users, { peer: peer, peerName: peerName }]);
  //       });

  //       socketRef.current.on('code response', (code) => {
  //         handleCompileResult(code);
  //       });

  //       socketRef.current.on('receiving returned signal', (payload) => {
  //         const item = peersRef.current.find((p) => p.peerID === payload.id);
  //         item.peer.signal(payload.signal);
  //       });
  //     })
  //     .catch((error) => {
  //       console.log(`getUserMedia error : ${error}`);
  //     });
  // }, []);

  // /* Below are Simple Peer Library Function */
  // function createPeer(userToSignal, callerID, stream) {
  //   const peer = new Peer({
  //     initiator: true,
  //     trickle: false,
  //     stream,
  //   });
  // }

  const onCapture = async () => {
    let snapshotUrl = '';
    await html2canvas(document.getElementById('onCapture'))
      .then((canvas) => {
        snapshotUrl = canvas.toDataURL('image/png');
        console.log(snapshotUrl, 'snapshot!');
        getUrl(snapshotUrl);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  /* Render */

  return (
    <div>
      {/* <div>
        <button ref={startAudioButtonRef} >
          <i class="fas fa-volume-up"></i> Open audio
        </button>
        <button ref={stopAudioButtonRef}>
          <i class="fas fa-volume-up"></i> Close audio
        </button>
      </div> */}
      <div class="fixed top-0 left-0 right-0 bottom-0 " id="onCapture">
        <AbsoluteUI
          peerAudios={peerAudios}
          handleSave={handleSave}
          doc={doc}
          provider={provider}
          awareness={awareness}
          yLines={yLines}
          undoManager={undoManager}
          setIsEraser={setIsEraser}
          startRecord={startRecord}
          stopRecord={stopRecord}
          socket={socket}
          exit={exit}
        />
        <Canvas
          doc={doc}
          provider={provider}
          awareness={awareness}
          yLines={yLines}
          undoManager={undoManager}
          isEraser={isEraser}
        />
      </div>
      <div>
        <Save
          isOpen={isOpen}
          onCancel={handleSaveCancel}
          yLines={yLines}
          doc={doc}
          peerAudios={peerAudios}
          exit={exit}
        />
        <RecordModal
          isOpen={videoModalOpen}
          onCancel={handleVideoSaveCancel}
          videoUrl={videoUrl}
          peerAudios={peerAudios}
        />
      </div>
      <ToastContainer />
    </div>
  );
};

export default Room;
