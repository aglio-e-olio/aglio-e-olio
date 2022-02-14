import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

import Canvas from "../Components/Canvas/Canvas";
import "./Room.css"
import { useParams } from "react-router-dom";
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



    const [muted, setMute] = useState("Mute");


    function handleMuteClick(){
        userStream.current
            .getAudioTracks()
            .forEach(track=>track.enabled = !track.enabled);
        // console.log(userStream.current.getAudioTracks());

        if(muted ==="Mute"){
            setMute("UnMute");
        }
        else{
            setMute("Mute");
        }
    }

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
            
            userVideo.current.srcObject = stream;
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

            socketRef.current.on("receiving returned signal", (payload) => {
                const item = peerRef.current.find((p) => p.peerID === payload.id);
                item.peer_.signal(payload.signal);
                
            });
        });

        /* Get Canvas Element */
        canvas = document.getElementById("canvas");
        canvas.height = window.innerHeight - 30;
        canvas.width = window.innerWidth;
        context = canvas.getContext("2d");


    }, []); 

    /* Peer Data Draw */
    const draw = (data) => {
        context.beginPath();
        context.moveTo(data.lastPoint.x, data.lastPoint.y);
        context.lineTo(data.x, data.y);
        context.strokeStyle = data.color;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 2;
        context.stroke();
    }

    /* Local Draw to Peer */
    function BroadCastDraw(data){
        peerRef.current.forEach(object=>{
            const p = object.peer_;
            p.send(data);
        })
    }


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

        // Data Chanel : Recieve data
        peer.on("data", data => {
            draw(JSON.parse(data));
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

        // Data Chanel : Recieve data
        peer.on("data", data => {
            draw(JSON.parse(data));
        })
    
        peer.signal(incomingSignal);
    
        return peer;
    }



    /* Render */
    return (
        <div>
            <div>
                <video autoPlay ref={userVideo} />
                <video autoPlay ref={partnerVideo} />
                <button onClick = {handleMuteClick}>{muted}</button>
                
            </div>
            <Canvas
                BroadCastDraw = {BroadCastDraw}
            />

            <button onClick={BroadCastDraw}>broadcast</button>


        </div>
    );
};

export default Room;