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

let socket;
let producer = null;
let rc = null;

/* Change the values below to adjust video quality. */
const displayMediaOptions = Object.freeze({
  video: {
    width: { max: 1920 },
    height: { max: 1080 },
    frameRate: 20
  },
  audio: false
});


const Room = () => {
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const peersRef = useRef([]);
  const { roomID } = useParams();
  const remoteAudiosRef = useRef();
  const startAudioButtonRef = useRef();
  const stopAudioButtonRef = useRef();
  const startRecordButtonRef = useRef();
  const stopRecordButtonRef = useRef();

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

    socket = io.connect('https://3.39.27.19:8000', {
      withCredentials: false,
    });
    console.log(socket);

    socket.request = function request(type, data = {}) {
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

    function joinRoom(name, room_id) {
      if (rc && rc.isOpen()) {
        console.log('Already connected to a room')
      } else {
        rc = new RoomClient(remoteAudiosRef.current, mediasoupClient, socket, room_id, name)
      }
    }

    joinRoom("peer_name_jun", "room_id_123");


    startAudioButtonRef.current.addEventListener('click', () => {
      rc.produce(RoomClient.mediaType.audio);
    });
    stopAudioButtonRef.current.addEventListener('click', () => {
      rc.closeProducer(RoomClient.mediaType.audio)
    });
    startRecordButtonRef.current.addEventListener('click', async () => {
      console.log('startRecord()');
      await rc.produce(RoomClient.mediaType.screen);

      socket.emit(
        'start-record',
        (data) => {
          if (data.error) {
            rc.screenTrackStop();
            alert(data.error);
            startRecordButtonRef.current.disabled = false;
            stopRecordButtonRef.current.disabled = true;
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
        rc.closeProducer(RoomClient.mediaType.screen);
      });
      startRecordButtonRef.current.disabled = false;
      stopRecordButtonRef.current.disabled = true;
    })
  }, []);

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
        {/* audio open and close */}
        <div ref={remoteAudiosRef}></div>
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


const mediaType = {
  audio: 'audioType',
  video: 'videoType',
  screen: 'screenType'
}
const _EVENTS = {
  exitRoom: 'exitRoom',
  openRoom: 'openRoom',
  startVideo: 'startVideo',
  stopVideo: 'stopVideo',
  startAudio: 'startAudio',
  stopAudio: 'stopAudio',
  startScreen: 'startScreen',
  stopScreen: 'stopScreen'
}

class RoomClient {
  constructor(remoteAudioEl, mediasoupClient, socket, room_id, name) {
    this.name = name
    this.remoteAudioEl = remoteAudioEl
    this.mediasoupClient = mediasoupClient

    this.socket = socket
    this.producerTransport = null
    this.consumerTransport = null
    this.device = null
    this.room_id = room_id

    this.isVideoOnFullScreen = false
    this.isDevicesVisible = false

    this.consumers = new Map()
    this.producers = new Map()

    this.screenTrackHolder = null;

    /**
     * map that contains a mediatype as key and producer_id as value
     */
    this.producerLabel = new Map()

    this._isOpen = false
    this.eventListeners = new Map()

    Object.keys(_EVENTS).forEach(
      function (evt) {
        this.eventListeners.set(evt, [])
      }.bind(this)
    )

    this.createRoom(room_id).then(
      async function () {
        await this.join(name, room_id)
        this.initSockets()
        this._isOpen = true
      }.bind(this)
    )
  }

  ////////// INIT /////////

  async createRoom(room_id) {
    await this.socket
      .request('createRoom', {
        room_id
      }).then((data) => {
        console.log(`Room "${room_id}" ${data}`)
      })
      .catch((err) => {
        console.log('Create room error:', err)
      })
  }

  async join(name, room_id) {
    socket
      .request('join', {
        name,
        room_id
      })
      .then(
        async function (roomObject) {
          console.log('Joined the following room: ', roomObject)
          const data = await this.socket.request('getRouterRtpCapabilities')
          let device = await this.loadDevice(data)
          this.device = device
          await this.initTransports(device)
          this.socket.emit('getProducers')
        }.bind(this)
      )
      .catch((err) => {
        console.log('Join error:', err)
      })
  }

  async loadDevice(routerRtpCapabilities) {
    let device
    try {
      device = new this.mediasoupClient.Device()
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

  async initTransports(device) {
    // init producerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      this.producerTransport = device.createSendTransport(data)

      this.producerTransport.on(
        'connect',
        async function ({ dtlsParameters }, callback, errback) {
          this.socket
            .request('connectTransport', {
              dtlsParameters,
              transport_id: data.id
            })
            .then(callback)
            .catch(errback)
        }.bind(this)
      )

      this.producerTransport.on(
        'produce',
        async function ({ kind, rtpParameters }, callback, errback) {
          try {
            const { producer_id } = await this.socket.request('produce', {
              producerTransportId: this.producerTransport.id,
              kind,
              rtpParameters
            })
            callback({
              id: producer_id
            })
          } catch (err) {
            errback(err)
          }
        }.bind(this)
      )

      this.producerTransport.on(
        'connectionstatechange',
        function (state) {
          switch (state) {
            case 'connecting':
              break

            case 'connected':
              //localVideo.srcObject = stream
              break

            case 'failed':
              this.producerTransport.close()
              break

            default:
              break
          }
        }.bind(this)
      )
    }

    // init consumerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false
      })

      if (data.error) {
        console.error(data.error)
        return
      }

      // only one needed
      this.consumerTransport = device.createRecvTransport(data)
      this.consumerTransport.on(
        'connect',
        function ({ dtlsParameters }, callback, errback) {
          this.socket
            .request('connectTransport', {
              transport_id: this.consumerTransport.id,
              dtlsParameters
            })
            .then(callback)
            .catch(errback)
        }.bind(this)
      )

      this.consumerTransport.on(
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
              this.consumerTransport.close()
              break

            default:
              break
          }
        }.bind(this)
      )
    }
  }

  initSockets() {
    this.socket.on(
      'consumerClosed',
      function ({ consumer_id }) {
        console.log('Closing consumer:', consumer_id)
        this.removeConsumer(consumer_id)
      }.bind(this)
    )

    /**
     * data: [ {
     *  producer_id:
     *  producer_socket_id:
     * }]
     */
    this.socket.on(
      'newProducers',
      async function (producerList) {
        console.log('New producers', producerList)
        for (let { producer_id } of producerList) {
          await this.consume(producer_id)
        }
      }.bind(this)
    )

    this.socket.on(
      'disconnect',
      function () {
        this.exit(true)
      }.bind(this)
    )
  }

  //////// MAIN FUNCTIONS /////////////

  async produce(type) {
    let mediaConstraints = {}
    let audio = false
    let screen = false
    switch (type) {
      case mediaType.audio:
        mediaConstraints = {
          audio: true,
          video: false
        }
        audio = true
        break
      // case mediaType.video:
      //   mediaConstraints = {
      //     audio: false,
      //     video: {
      //       width: {
      //         min: 640,
      //         ideal: 1920
      //       },
      //       height: {
      //         min: 400,
      //         ideal: 1080
      //       },
      //       deviceId: deviceId
      //       /*aspectRatio: {
      //                       ideal: 1.7777777778
      //                   }*/
      //     }
      //   }
      //   break
      case mediaType.screen:
        mediaConstraints = displayMediaOptions;
        screen = true
        break
      default:
        return
    }
    if (!this.device.canProduce('video') && !audio) {
      console.error('Cannot produce video')
      return
    }
    if (this.producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type)
      return
    }
    console.log('Mediacontraints:', mediaConstraints)
    let stream
    try {
      stream = screen
        ? await navigator.mediaDevices.getDisplayMedia(mediaConstraints)
        : await navigator.mediaDevices.getUserMedia(mediaConstraints)
      console.log('supportedConstraints: ' + navigator.mediaDevices.getSupportedConstraints())

      let track;
      if (audio) {
        track = stream.getAudioTracks()[0];
      } else {
        track = stream.getVideoTracks()[0];
        this.screenTrackHolder = track;
      }

      const params = {
        track: track
      }
      // if (!audio && !screen) {
      //   params.encodings = [
      //     {
      //       rid: 'r0',
      //       maxBitrate: 100000,
      //       //scaleResolutionDownBy: 10.0,
      //       scalabilityMode: 'S1T3'
      //     },
      //     {
      //       rid: 'r1',
      //       maxBitrate: 300000,
      //       scalabilityMode: 'S1T3'
      //     },
      //     {
      //       rid: 'r2',
      //       maxBitrate: 900000,
      //       scalabilityMode: 'S1T3'
      //     }
      //   ]
      //   params.codecOptions = {
      //     videoGoogleStartBitrate: 1000
      //   }
      // }
      producer = await this.producerTransport.produce(params)

      console.log('Producer', producer)

      this.producers.set(producer.id, producer)

      let elem

      producer.on('trackended', () => {
        this.closeProducer(type)
      })

      producer.on('transportclose', () => {
        console.log('Producer transport close')
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop()
          })
          elem.parentNode.removeChild(elem)
        }
        this.producers.delete(producer.id)
      })

      producer.on('close', () => {
        console.log('Closing producer')
        if (!audio) {
          elem.srcObject.getTracks().forEach(function (track) {
            track.stop()
          })
          elem.parentNode.removeChild(elem)
        }
        this.producers.delete(producer.id)
      })

      this.producerLabel.set(type, producer.id)

      switch (type) {
        case mediaType.audio:
          this.event(_EVENTS.startAudio)
          break
        case mediaType.video:
          this.event(_EVENTS.startVideo)
          break
        case mediaType.screen:
          this.event(_EVENTS.startScreen)
          break
        default:
          return
      }
    } catch (err) {
      console.log('Produce error:', err)
    }
  }

  async consume(producer_id) {
    //let info = await this.roomInfo()

    this.getConsumeStream(producer_id).then(
      function ({ consumer, stream, kind }) {
        this.consumers.set(consumer.id, consumer)

        let elem
        if (kind === 'video') {
          /* No need */
        } else {
          elem = document.createElement('audio')
          elem.srcObject = stream
          elem.id = consumer.id
          elem.playsinline = false
          elem.autoplay = true
          this.remoteAudioEl.appendChild(elem)
        }

        consumer.on(
          'trackended',
          function () {
            this.removeConsumer(consumer.id)
          }.bind(this)
        )

        consumer.on(
          'transportclose',
          function () {
            this.removeConsumer(consumer.id)
          }.bind(this)
        )
      }.bind(this)
    )
  }

  async getConsumeStream(producerId) {
    const { rtpCapabilities } = this.device
    const data = await this.socket.request('consume', {
      rtpCapabilities,
      consumerTransportId: this.consumerTransport.id, // might be
      producerId
    })
    const { consumerId, kind, rtpParameters } = data;

    let codecOptions = {}
    const consumer = await this.consumerTransport.consume({
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

  closeProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    console.log('Close producer', producer_id)

    this.socket.emit('producerClosed', {
      producer_id
    })

    this.producers.get(producer_id).close()
    this.producers.delete(producer_id)
    this.producerLabel.delete(type)

    if (type !== mediaType.audio) {
      this.screenTrackStop();
    }

    // switch (type) {
    //   case mediaType.audio:
    //     this.event(_EVENTS.stopAudio)
    //     break
    //   case mediaType.video:
    //     this.event(_EVENTS.stopVideo)
    //     break
    //   case mediaType.screen:
    //     this.event(_EVENTS.stopScreen)
    //     break
    //   default:
    //     return
    // }
  }

  pauseProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    this.producers.get(producer_id).pause()
  }

  resumeProducer(type) {
    if (!this.producerLabel.has(type)) {
      console.log('There is no producer for this type ' + type)
      return
    }

    let producer_id = this.producerLabel.get(type)
    this.producers.get(producer_id).resume()
  }

  removeConsumer(consumer_id) {
    let elem = document.getElementById(consumer_id)
    elem.srcObject.getTracks().forEach(function (track) {
      track.stop()
    })
    elem.parentNode.removeChild(elem)

    this.consumers.delete(consumer_id)
  }

  exit(offline = false) {
    let clean = function () {
      this._isOpen = false
      this.consumerTransport.close()
      this.producerTransport.close()
      this.socket.off('disconnect')
      this.socket.off('newProducers')
      this.socket.off('consumerClosed')
    }.bind(this)

    if (!offline) {
      this.socket
        .request('exitRoom')
        .then((e) => console.log(e))
        .catch((e) => console.warn(e))
        .finally(
          function () {
            clean()
          }.bind(this)
        )
    } else {
      clean()
    }

    this.event(_EVENTS.exitRoom)
  }

  screenTrackStop() {
    if (this.screenTrackHolder !== null) {
      this.screenTrackHolder.stop();
      this.screenTrackHolder = null;
    }
  }

  ///////  HELPERS //////////

  async roomInfo() {
    let info = await this.socket.request('getMyRoomInfo')
    return info
  }

  static get mediaType() {
    return mediaType
  }

  event(evt) {
    if (this.eventListeners.has(evt)) {
      this.eventListeners.get(evt).forEach((callback) => callback())
    }
  }

  on(evt, callback) {
    this.eventListeners.get(evt).push(callback)
  }

  //////// GETTERS ////////

  isOpen() {
    return this._isOpen
  }

  static get EVENTS() {
    return _EVENTS
  }

  //////// UTILITY ////////

  // copyURL() {
  //   let tmpInput = document.createElement('input')
  //   document.body.appendChild(tmpInput)
  //   tmpInput.value = window.location.href
  //   tmpInput.select()
  //   document.execCommand('copy')
  //   document.body.removeChild(tmpInput)
  //   console.log('URL copied to clipboard 👍')
  // }

  // showDevices() {
  //   if (!this.isDevicesVisible) {
  //     reveal(devicesList)
  //     this.isDevicesVisible = true
  //   } else {
  //     hide(devicesList)
  //     this.isDevicesVisible = false
  //   }
  // }

  handleFS(id) {
    let videoPlayer = document.getElementById(id)
    videoPlayer.addEventListener('fullscreenchange', (e) => {
      if (videoPlayer.controls) return
      let fullscreenElement = document.fullscreenElement
      if (!fullscreenElement) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('webkitfullscreenchange', (e) => {
      if (videoPlayer.controls) return
      let webkitIsFullScreen = document.webkitIsFullScreen
      if (!webkitIsFullScreen) {
        videoPlayer.style.pointerEvents = 'auto'
        this.isVideoOnFullScreen = false
      }
    })
    videoPlayer.addEventListener('click', (e) => {
      if (videoPlayer.controls) return
      if (!this.isVideoOnFullScreen) {
        if (videoPlayer.requestFullscreen) {
          videoPlayer.requestFullscreen()
        } else if (videoPlayer.webkitRequestFullscreen) {
          videoPlayer.webkitRequestFullscreen()
        } else if (videoPlayer.msRequestFullscreen) {
          videoPlayer.msRequestFullscreen()
        }
        this.isVideoOnFullScreen = true
        videoPlayer.style.pointerEvents = 'none'
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
        this.isVideoOnFullScreen = false
        videoPlayer.style.pointerEvents = 'auto'
      }
    })
  }
}
