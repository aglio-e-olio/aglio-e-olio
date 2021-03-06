import React, { useRef, useEffect, useState, useContext } from 'react';
import io from 'socket.io-client';
import Canvas from '../Components/Canvas/Canvas';
import './Room.css';
import { useParams } from 'react-router-dom';
import { codeContext } from '../Context/ContextProvider';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

import Save from '../Components/Save/Save';
import RecordModal from '../Components/RecordModal/RecordModal';
import html2canvas from 'html2canvas';
import AbsoluteUI from '../Components/AbsoluteUI/AbsoluteUI';
// import Swal from 'sweetalert2';
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
  const { roomID } = useParams();
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
    setIsRecording,
  } = useContext(codeContext);

  // const remoteAudiosRef = useRef();
  // const startAudioButtonRef = useRef();
  // const stopAudioButtonRef = useRef();
  const deviceRef = useRef(undefined);
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
      console.log('name??? ?????????????', new_member);
      toast.success(`${new_member}?????? ??????????????????`, {
        autoClose: 2000,
        position: toast.POSITION.TOP_RIGHT,
      });
    });

    socket.on('bye', (left_member) => {
      console.log('name??? ?????????????', left_member);
      toast.error(`${left_member}?????? ???????????????`, {
        autoClose: 2000,
        position: toast.POSITION.TOP_RIGHT,
      });
    });

    socket.on('code response', (code) => {
      getCompileResult(code);
    });
  };

  //////// MAIN FUNCTIONS /////////////
  const startRecord = async () => {
    console.log('startRecord()');
    if (isRecordingRef.current === true) {
      alert("?????? ????????? ??? ??? ?????? ????????? ??? ????????????.");
      return;
    }
    isRecordingRef.current = true;
    if (deviceRef.current === undefined) {
      isRecordingRef.current = false;
      setIsRecording(false);
      alert("Device??? ????????????????????? ????????? ?????? ?????? ??? ?????? ??????????????????. ?????? 10??? ???????????????.");
      return;
    }
    const successScreen = await produce(mediaType.screen);
    if (successScreen === false) {
      isRecordingRef.current = false;
      setIsRecording(false);
      alert("????????? ????????? ????????? ????????? ????????? ???????????????.");
      return;
    }
    const successAudios = await produce(mediaType.allAudio);
    if (successAudios === false) {
      isRecordingRef.current = false;
      setIsRecording(false);
      alert("??????????????? ?????? ???????????? ????????? ?????? ???????????? ???????????????. ?????? ??????????????????.");
      return;
    }

    socket.emit('start-record', (data) => {
      if (data.error) {
        screenTrackStop();
        closeProducer(mediaType.screen, true);
        closeProducer(mediaType.allAudio, true);
        alert(data.error);
        isRecordingRef.current = false;
      } else {
        console.log(data.success);
        setIsRecording(true);
        setTimeout(() => {
          if (isRecordingRef.current === true) {
            stopRecord();
            alert('10??? ?????? ????????? ?????? ???????????? ???????????? ?????? ??????????????????.');
          } else {
            console.log('?????? ????????? ???????????? ?????? ?????? ?????? ????????? ???????????? ??????')
          }
        }, 600000);
      }
    });
  };

  const stopRecord = () => {
    console.log('stopRecord()');

    socket.emit(
      'stop-record',
      { isRecording: isRecordingRef.current },
      ({ res }) => {
        if (res.error) {
          alert(res.error);
        } else {
          closeProducer(mediaType.screen, true);
          closeProducer(mediaType.allAudio, true);
          setVideoUrl((prev) => (prev = res.m3u8Link));
          handleVideoSave();
          isRecordingRef.current = false;
        }
      });
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
        if (consumers.size === 0 && !producerLabel.has(mediaType.audio)) {
          return new Promise(
            function (resolve, reject) {
              resolve(false);
            }
          );
        }
        // audio Context API??? consumer?????? ?????? stream ?????????
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
        console.log(stream);
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
        if (type === mediaType.screen) {
          alert('????????? ????????? ?????????????????????.\n????????? ???????????? ?????????, ???????????? ????????? ?????????.');
        }
        closeProducer(type, isRecordingRef.current);
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
      return new Promise(
        function (resolve, reject) {
          resolve(true);
        }
      );
    } catch (err) {
      console.log('Produce error:', err);
      return new Promise(
        function (resolve, reject) {
          resolve(false);
        }
      );
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
    console.log(
      'Close producer',
      {
        producer_id: producer_id,
        type: type,
        isRecording, isRecording
      }
    );

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
      producerLabel.clear();
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


  // ??? ????????? provider ????????? : ?????? rendering ??????
  if (docGenerateCount === 0) {
    doc = new Y.Doc();
    provider = new WebrtcProvider(roomID, doc);
    awareness = provider.awareness;
    yLines = doc.getArray('lines~9');
    undoManager = new Y.UndoManager(yLines);
    setDocGCount(1);
  }

  const handleSave = () => {
    // ????????? ?????? ?????????
    onCapture();
    setOpen(true);
  };

  const handleSaveCancel = () => {
    setOpen(false);
  };

  const handleVideoSave = () => {
    // ????????? RecordModal ?????????
    setVideoModalOpen((prev) => (prev = true));
  };

  const handleVideoSaveCancel = () => {
    setVideoModalOpen((prev) => (prev = false));
  };

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
