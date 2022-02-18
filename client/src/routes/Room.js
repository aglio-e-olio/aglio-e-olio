import React, { useRef, useEffect, useState, useContext } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

import Canvas from "../Components/Canvas/Canvas";
import "./Room.css";
import { useParams } from "react-router-dom";
import CodeEditor from "../Components/CodeEditor/Editor";
import { codeContext } from "../Context/ContextProvider";
import styled from "styled-components";

var canvas;
var context;

const StyledVideo = styled.video`
  height: 0;
  width: 0;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  const userVideo = useRef();
  const partnerVideo = useRef([]);
  const peerRef = useRef([]);
  const socketRef = useRef();
  const userStream = useRef();
  const { roomID } = useParams();
  const { codes, compileResult, getCompileResult, getRoomInfo } =
    useContext(codeContext);

  const [muted, setMute] = useState("Mute");

  function sendCode() {
    socketRef.current.emit("code compile", { codes, roomID });
  }

  function handleMuteClick() {
    userStream.current
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));

    if (muted === "Mute") {
      setMute("UnMute");
    } else {
      setMute("Mute");
    }
  }

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        // userVideo.current.srcObject = stream;
        userStream.current = stream;

        socketRef.current = io.connect("/");
        getRoomInfo(roomID);

        socketRef.current.emit("join room", roomID);

        socketRef.current.on("other user", (userIDs) => {
          if (userIDs) {
            const peers_ = [];
            userIDs.forEach((userID) => {
              const peer_ = createPeer(userID, socketRef.current.id, stream);

              peerRef.current.push({
                peerID: userID,
                peer_,
              });
              peers_.push(peer_);
            });
            setPeers(peers_);
          }
        });

        socketRef.current.on("user joined", (payload) => {
          const peer_ = addPeer(payload.signal, payload.callerID, stream);
          peerRef.current.push({
            peerID: payload.callerID,
            peer_,
          });
          setPeers((users) => [...users, peer_]);
        });

        socketRef.current.on("code response", (code) => {
          handleCompileResult(code);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peerRef.current.find((p) => p.peerID === payload.id);
          item.peer_.signal(payload.signal);
        });
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
    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
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

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  function handleCompileResult(code) {
    getCompileResult(code);
  }

  /* Render */
  return (
    <div>
      <div>
        <button className="run-button" onClick={sendCode}>
          Run
        </button>

        {/* <video autoPlay ref={userVideo} />
                <video autoPlay ref={partnerVideo} />
                <button onClick = {handleMuteClick}>{muted}</button> */}

        <Canvas />
        <CodeEditor roomID={roomID} />

        <StyledVideo muted ref={userVideo} autoPlay playsInline />
        {peers.map((peer, index) => {
          return <Video key={index} peer={peer} />;
        })}

        {/* <button onClick={BroadCastDraw}>broadcast</button> */}
      </div>

      <div>
        <textarea
          className="code-result"
          value={compileResult}
          placeholder={
            "코드 결과 출력 창입니다. \n현재 Javascript만 지원중입니다."
          }
        />
      </div>
    </div>
  );
};

export default Room;
