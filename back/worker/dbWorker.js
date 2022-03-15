const { parentPort } = require("worker_threads")
const mongoose = require("mongoose");
const Post = require('../models/post')

const MONGO_URI = 'mongodb://localhost:27017/mongoose';

parentPort.on("message", incoming=>{
    const {status, data} = incoming;

    if(status==='connect'){
        mongoose
            .connect(MONGO_URI)
            .then(() => {
                console.info("Mongoose connected successfully in dbWorker")

                // Tell parent thread to start a new subscription
                parentPort.postMessage({ status: "subscribe" });
            })
            .catch(error => {
                console.error("Mongoose connected failed: " + error);
            })
    }

    if(status==='save'){
        saveData(data);
    }
})


async function saveData(data){

    await Post.insertMany(data);
    parentPort.postMessage({status:"subscribe"});
}


