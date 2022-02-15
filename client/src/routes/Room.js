import React, { useRef, useEffect, useState, useContext } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

import Canvas from "../Components/Canvas/Canvas";
import "./Room.css"
import { useParams } from "react-router-dom";
import CodeEditor from "../Components/CodeEditor/Editor";
import { codeContext } from "../Context/ContextProvider";
var canvas;
var context;

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const userVideo = useRef();
    const partnerVideo = useRef([]);
    const peerRef = useRef([]);
    const socketRef = useRef();
    const userStream = useRef();
    const {roomID} = useParams();
    const { codes, compileResult, getCompileResult } = useContext(codeContext);



    const [muted, setMute] = useState("Mute");

    function sendCode() {
        socketRef.current.emit("code compile", {codes, roomID});
    }

    function handleMuteClick(){
        userStream.current
            .getAudioTracks()
            .forEach(track=>track.enabled = !track.enabled);

        if(muted ==="Mute"){
            setMute("UnMute");
        }
        else{
            setMute("Mute");
        }
    }

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
            
            // userVideo.current.srcObject = stream;
            userStream.current = stream;

            socketRef.current = io.connect("/");
            
            socketRef.current.emit("join room", roomID);
            
            socketRef.current.on('other user', userIDs => {
                if(userIDs){
                    const peers_ = [];
                    userIDs.forEach((userID)=>{
                        const peer_ = createPeer(userID, socketRef.current.id, stream);

                        peerRef.current.push({
                            peerID:userID,
                            peer_
                        })
                        peers_.push({
                            peerID:userID, 
                            peer_,
                        })


                    })
                    setPeers(peers_)
                }
            });

            socketRef.current.on("user joined", payload => {
                const peer_ = addPeer(payload.signal, payload.callerID, stream);
                peerRef.current.push({
                    peerID:payload.callerID,
                    peer_
                })
                const peerObj = {
                    peerID:payload.callerID,
                    peer_
                }
                setPeers((users)=>[...users, peerObj])
            });

            socketRef.current.on("code response", code => {
                handleCompileResult(code);
            })

            socketRef.current.on("receiving returned signal", (payload) => {
                const item = peerRef.current.find((p) => p.peerID === payload.id);
                item.peer_.signal(payload.signal);
                
            });
        });


    }, []); 


    /* Below are Simple Peer Library Function */
    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator:true, 
            trickle:false, 
            stream,
        })

        // RTC Connection
        peer.on("signal", (signal)=>{
            socketRef.current.emit("sending signal", {
                userToSignal, 
                callerID, 
                signal,
            })
        })


        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        });
    
        peer.on("signal", (signal) => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        
    
        peer.signal(incomingSignal);
    
        return peer;
    }

    function handleCompileResult(code) {
        getCompileResult(code);

    }



    /* Render */
    return (
        <div>
            <button onClick={sendCode} >Run</button>
            
                {/* <video autoPlay ref={userVideo} />
                <video autoPlay ref={partnerVideo} />
                <button onClick = {handleMuteClick}>{muted}</button> */}
                
            
            <Canvas />
            <textarea value={compileResult} />
            <CodeEditor roomID={roomID} />
            

            {/* <button onClick={BroadCastDraw}>broadcast</button> */}


        </div>
    );
};

export default Room;