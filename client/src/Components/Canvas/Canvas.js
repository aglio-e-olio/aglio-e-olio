import React, {useContext, useEffect, useState, useRef } from "react"
import './Canvas.css'

var lastPoint;
const Canvas = ({BroadCastDraw, ref})=>{

    useEffect(()=>{
        /* Get HTML Element and Set Canvas */
        const canvas = document.getElementById("canvas");
        canvas.height = window.innerHeight - 30;
        canvas.width = window.innerWidth;
        const context = canvas.getContext("2d");
        
        
        function move(e){
            if(e.buttons){
                if(!lastPoint){
                    lastPoint = {x : e.offsetX, y:e.offsetY }
                    return;
                }

                draw({
                    lastPoint, 
                    x : e.offsetX,
                    y : e.offsetY,
                    color : "green"
                })

                BroadCastDraw(JSON.stringify({
                    lastPoint,
                    x : e.offsetX,
                    y : e.offsetY,
                    color : "green"
                }))

                lastPoint = { x:e.offsetX, y:e.offsetY }
            }
        }



        /* Local Draw Function */
        const draw = (data) => {
            context.beginPath();
            context.moveTo(data.lastPoint.x, data.lastPoint.y);
            context.lineTo(data.x, data.y);
            context.strokeStyle = data.color;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.lineWidth = 2;
            context.stroke();
            context.closePath();
        }
        
        
        
        /* Move 등록 */        
        window.onmousemove = move;

        // Clean Up
        return ()=>{
        }

    },[])


    /* Extra 지금은 안씀 */
    const { current: canvasDetails } = useRef({ color: "green"});
    const changeColor = (newColor) => {
        canvasDetails.color = newColor;
    };

    const [zIndex, setZindex] = useState(0);
    const changeZofCanvas = () => {
        // console.log(changeZ.current.style);
        setZindex((index) => (index === 1)?0:1);
    }


    /* Render */
    return (
        <div>
            <button onClick={changeZofCanvas}>{zIndex === 1?"Canvas Mode":"Editor Mode"}</button>
            <div className="color-picker-wrapper">
            <input
                className="color-picker"
                type="color"
                defaultValue="#00FF00"
                onChange={(e) => changeColor(e.target.value)}
            />
            </div>
            <canvas className="canvas" id="canvas" style={{zIndex:zIndex}}></canvas>
        </div>
    );
}


export default Canvas;