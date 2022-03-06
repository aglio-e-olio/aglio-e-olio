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

import * as mediasoupClient from 'mediasoup-client';


let i = 0;
let doc;
let provider;
let awareness;
let yLines;
let undoManager;


/* Change the values below to adjust video quality. */
const displayMediaOptions = {
  video: {
    width: { max: 1920 },
    height: { max: 1080 },
    frameRate: 20
  },
  audio: false
};

const mediaType = {
  audio: 'audioType',
  video: 'videoType',
  screen: 'screenType',
  allAudio: 'allAudio'
}


const Room = () => {
  const navigate = useNavigate();
  const socketRef = useRef();
  const { roomID } = useParams();

  const { codes, compileResult, getCompileResult, getRoomInfo, getUrl, addAudioStream } =
    useContext(codeContext);

  const remoteAudiosRef = useRef();
  const startAudioButtonRef = useRef();
  const stopAudioButtonRef = useRef();
  const startRecordButtonRef = useRef();
  const stopRecordButtonRef = useRef();
  const deviceRef = useRef();
  const isRecordingRef = useRef(false);

  const [audioStreams, setAudioStreams] = useState([]);
  // const [audioStreams, setAudioStreams] = useState(new Map());
  // const audioStreamsUpsert = (key, value) => {
  //   setAudioStreams((prev) => new Map(prev).set(key, value));
  // };
  let name;

  let socket = io.connect('https://3.39.27.19:8000', {
    withCredentials: false,
  });;
  let producerTransport;
  let consumerTransport;
  let room_id;

  let consumers = new Map();
  let producers = new Map();

  let screenTrackHolder = null;
  let producerLabel = new Map();

  useEffect(() => {
    socket.request = (type, data = {}) => {
      return new Promise((resolve, reject) => {
        socket.emit(type, data, (data) => {
          if (data.error) {
            reject(data.error)
          } else {
            resolve(data)
          }
        })
      })
    }



    name = "TEST_NAME";
    room_id = "TEST_ROOM_ID_123"
    createRoom(room_id).then(async () => {
      await join(name, room_id);
      initSockets();
    })

    startAudioButtonRef.current.addEventListener('click', () => {
      produce(mediaType.audio);
    });
    stopAudioButtonRef.current.addEventListener('click', () => {
      closeProducer(mediaType.audio, false)
    });
    startRecordButtonRef.current.addEventListener('click', async () => {
      console.log('startRecord()');
      isRecordingRef.current = true;
      await produce(mediaType.screen);
      await produce(mediaType.allAudio);

      socket.emit(
        'start-record',
        (data) => {
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
        }
      );

      startRecordButtonRef.current.disabled = true;
      stopRecordButtonRef.current.disabled = false;
    })
    stopRecordButtonRef.current.addEventListener('click', () => {
      console.log('stopRecord()');

      socket.emit('stop-record', () => {
        closeProducer(mediaType.screen, true);
        closeProducer(mediaType.allAudio, true);
      });
      
      startRecordButtonRef.current.disabled = false;
      stopRecordButtonRef.current.disabled = true;
      isRecordingRef.current = false;
    })
  }, []);

  ////////// INIT /////////

  const createRoom = async (room_id) => {
    await socket
      .request('createRoom', {
        room_id
      }).then((data) => {
        console.log(`Room "${room_id}" ${data}`)
      })
      .catch((err) => {
        console.log('Create room error:', err)
      })
  }

  const join = async (name, room_id) => {
    socket
      .request('join', {
        name,
        room_id
      })
      .then(
        async function (roomObject) {
          console.log('Joined the following room: ', roomObject)
          const data = await socket.request('getRouterRtpCapabilities')
          deviceRef.current = await loadDevice(data)
          await initTransports(deviceRef)
          socket.emit('getProducers')
        }
      )
      .catch((err) => {
        console.log('Join error:', err)
      })
  }

  const loadDevice = async (routerRtpCapabilities) => {
    let device
    try {
      device = new mediasoupClient.Device()
    } catch (error) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported')
        alert('Browser not supported')
      }
      console.error(error)
    }
    await device.load({
      routerRtpCapabilities
    })
    return device
  }

  const initTransports = async (deviceRef) => {
    // init producerTransport
    let device = deviceRef.current;
    {
      const data = await socket.request('createWebRtcTransport', {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      producerTransport = device.createSendTransport(data)

      producerTransport.on(
        'connect',
        async function ({ dtlsParameters }, callback, errback) {
          socket
            .request('connectTransport', {
              dtlsParameters,
              transport_id: data.id
            })
            .then(callback)
            .catch(errback)
        }
      )

      producerTransport.on(
        'produce',
        async function ({ kind, rtpParameters }, callback, errback) {
          try {
            if (isRecordingRef.current === true) {
              const { producer_id } = await socket.request('produce', {
                producerTransportId: producerTransport.id,
                kind,
                rtpParameters,
                isRecording: true
              })
              callback({
                id: producer_id
              })
            } else {
              const { producer_id } = await socket.request('produce', {
                producerTransportId: producerTransport.id,
                kind,
                rtpParameters,
                isRecording: false
              })
              callback({
                id: producer_id
              })
            }

          } catch (err) {
            errback(err)
          }
        }
      )

      producerTransport.on(
        'connectionstatechange',
        function (state) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              //localVideo.srcObject = stream
              break

            case 'failed':
              producerTransport.close()
              break

            default:
              break
          }
        }
      )
    }

    // init consumerTransport
    {
      const data = await socket.request('createWebRtcTransport', {
        forceTcp: false
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      // only one needed
      consumerTransport = device.createRecvTransport(data)
      consumerTransport.on(
        'connect',
        function ({ dtlsParameters }, callback, errback) {
          socket
            .request('connectTransport', {
              transport_id: consumerTransport.id,
              dtlsParameters
            })
            .then(callback)
            .catch(errback)
        }
      )

      consumerTransport.on(
        'connectionstatechange',
        async function (state) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              //remoteVideo.srcObject = await stream;
              //await socket.request('resume');
              break

            case 'failed':
              consumerTransport.close()
              break

            default:
              break
          }
        }
      )
    }
  }

  const initSockets = async () => {
    socket.on(
      'consumerClosed',
      function ({ consumer_id }) {
        console.log('Closing consumer:', consumer_id)
        removeConsumer(consumer_id)
      }
    )

    /**
     * data: [ {
     *  producer_id:
     *  producer_socket_id:
     * }]
     */
    socket.on(
      'newProducers',
      async function (producerList) {
        console.log('New producers', producerList)
        for (let { producer_id } of producerList) {
          await consume(producer_id)
        }
      }
    )

    socket.on(
      'disconnect',
      function () {
        exit(true)
      }
    )
  }

  //////// MAIN FUNCTIONS /////////////

  const produce = async (type) => {
    let mediaConstraints = {}
    let audio = false
    let screen = false
    let allAudio = false
    switch (type) {
      case mediaType.audio:
        mediaConstraints = {
          audio: true,
          video: false
        }
        audio = true
        break
      case mediaType.screen:
        mediaConstraints = displayMediaOptions;
        screen = true
        break
      case mediaType.allAudio:
        allAudio = true
        break
      default:
        return
    }
    if (!deviceRef.current.canProduce('video') && !audio) {
      console.error('Cannot produce video')
      return
    }
    if (producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type)
      return
    }
    console.log('Mediacontraints:', mediaConstraints)
    let stream
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
          let myStream = await navigator.mediaDevices.getUserMedia({audio: true});
          audioContext.createMediaStreamSource(myStream).connect(acDest);
        }
        stream = new MediaStream([...acDest.stream.getTracks()]);
      } else if ( type === mediaType.audio) {
        stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints)
      }
      console.log('supportedConstraints: ' + navigator.mediaDevices.getSupportedConstraints())

      let track;
      if (audio || allAudio) {
        track = stream.getAudioTracks()[0];
      } else {
        track = stream.getVideoTracks()[0];
        screenTrackHolder = track;
      }

      const params = {
        track: track
      }
      let producer = await producerTransport.produce(params)

      console.log('Producer', producer)

      producers.set(producer.id, producer)

      let elem

      producer.on('trackended', () => {
        closeProducer(type, false)
      })

      producer.on('transportclose', () => {
        console.log('Producer transport close')
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop()
          })
          elem.parentNode.removeChild(elem)
        }
        producers.delete(producer.id)
      })

      producer.on('close', () => {
        console.log('Closing producer')
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop()
          })
          elem.parentNode.removeChild(elem)
        }
        producers.delete(producer.id)
      })

      producerLabel.set(type, producer.id)

    } catch (err) {
      console.log('Produce error:', err)
    }
  }

  const consume = async (producer_id) => {
    getConsumeStream(producer_id).then(
      function ({ consumer, stream, kind }) {
        consumers.set(consumer.id, stream)

        let elem
        if (kind === 'video') {
          /* No need */
        } else {
          // audioStreamsUpsert(consumer.id, stream)

          elem = document.createElement('audio')
          elem.srcObject = stream
          elem.id = consumer.id
          elem.playsinline = false
          elem.autoplay = true
          remoteAudiosRef.current.appendChild(elem)
        }

        consumer.on(
          'trackended',
          function () {
            removeConsumer(consumer.id)
          }
        )

        consumer.on(
          'transportclose',
          function () {
            removeConsumer(consumer.id)
          }
        )
      }
    )
  }

  const getConsumeStream = async (producerId) => {
    const { rtpCapabilities } = deviceRef.current;
    const data = await socket.request('consume', {
      rtpCapabilities,
      consumerTransportId: consumerTransport.id, // might be
      producerId
    })
    const { consumerId, kind, rtpParameters } = data;

    let codecOptions = {}
    const consumer = await consumerTransport.consume({
      id: consumerId,
      producerId,
      kind,
      rtpParameters,
      codecOptions
    })

    const stream = new MediaStream()
    stream.addTrack(consumer.track)

    return {
      consumer,
      stream,
      kind
    }
  }

  const closeProducer = async (type, isRecording) => {
    if (!producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = producerLabel.get(type)
    console.log('Close producer', producer_id)

    await socket.request('producerClosed', {
      producer_id,
      isRecording: isRecording
    });

    producers.get(producer_id).close()
    producers.delete(producer_id)
    producerLabel.delete(type)

    if (type !== mediaType.audio || type !== mediaType.allAudio) {
      screenTrackStop();
    }
  }

  const pauseProducer = (type) => {
    if (!producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = producerLabel.get(type)
    producers.get(producer_id).pause()
  }

  const resumeProducer = (type) => {
    if (!producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = producerLabel.get(type)
    producers.get(producer_id).resume()
  }

  const removeConsumer = (consumer_id) => {
    let elem = document.getElementById(consumer_id)
    elem.srcObject.getTracks().forEach(function (track) {
      track.stop()
    })
    elem.parentNode.removeChild(elem)

    consumers.delete(consumer_id)
  }

  const exit = (offline = false) => {
    let clean = function () {
      consumerTransport.close()
      producerTransport.close()
      socket.off('disconnect')
      socket.off('newProducers')
      socket.off('consumerClosed')
    }

    if (!offline) {
      socket
        .request('exitRoom')
        .then((e) => console.log(e))
        .catch((e) => console.warn(e))
        .finally(
          function () {
            clean()
          }
        )
    } else {
      clean()
    }
  }

  const screenTrackStop = () => {
    if (screenTrackHolder !== null) {
      screenTrackHolder.stop();
      screenTrackHolder = null;
    }
  }



  ////////////////////////////////////////////////

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



  // useEffect(() => {
  //   socketRef.current = io.connect('/');
  //   navigator.mediaDevices
  //     .getUserMedia({ audio: true })
  //     .then((stream) => {
  //       addAudioStream(stream);
  //       let options = {};
  //       let speechEvents = hark(stream, options);

  //       speechEvents.on('speaking', function () { });

  //       speechEvents.on('stopped_speaking', () => { });
  //       getRoomInfo(roomID);
  //       socketRef.current.emit('join room', roomID);
  //       socketRef.current.on('all users', (users) => {
  //         const peers = [];
  //         users.forEach((userID) => {
  //           const peer = createPeer(userID, socketRef.current.id, stream);
  //           peersRef.current.push({
  //             peerID: userID,
  //             peer,
  //           });
  //           peers.push(peer);
  //         });
  //         setPeers(peers);
  //         console.log(peers);
  //       });

  //       socketRef.current.on('hello', (new_member) => {
  //         // alert(`${new_member} 가 입장했습니다.`);
  //       });

  //       socketRef.current.on('bye', (left_user) => {
  //         // alert(`${left_user}가 떠났습니다.`);
  //       });

  //       socketRef.current.on('user joined', (payload) => {
  //         const peer = addPeer(payload.signal, payload.callerID, stream);
  //         peersRef.current.push({
  //           peerID: payload.callerID,
  //           peer,
  //         });
  //         setPeers((users) => [...users, peer]);
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

  //   // RTC Connection
  //   peer.on('signal', (signal) => {
  //     socketRef.current.emit('sending signal', {
  //       userToSignal, // 상대방 소켓 id
  //       callerID, // 내 소켓 id
  //       signal,
  //     });
  //   });

  //   return peer;
  // }

  // function addPeer(incomingSignal, callerID, stream) {
  //   const peer = new Peer({
  //     initiator: false,
  //     trickle: false,
  //     stream,
  //   });

  //   peer.on('signal', (signal) => {
  //     socketRef.current.emit('returning signal', { signal, callerID });
  //   });

  //   peer.signal(incomingSignal);

  //   return peer;
  // }

  // function handleCompileResult(code) {
  //   getCompileResult(code);
  // }

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
      </div>
      <div ref={remoteAudiosRef}></div>
      <div>
        {/* audio open and close */}
        <button ref={startAudioButtonRef} >
          <i class="fas fa-volume-up"></i> Open audio
        </button>
        <button ref={stopAudioButtonRef}>
          <i class="fas fa-volume-up"></i> Close audio
        </button>
        <button ref={startRecordButtonRef}>
          <i class="fas fa-volume-up"></i> Record start
        </button>
        <button ref={stopRecordButtonRef}>
          <i class="fas fa-volume-up"></i> Record stop
        </button>
        {/* audio open and close */}

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
          onClick={() => navigate(-1)}>뒤로 가기</button>
        <Save isOpen={isOpen}
          onCancel={handleSaveCancel}
          yLines={yLines}
          doc={doc} />

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