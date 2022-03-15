const { workerData, parentPort } = require('worker_threads');
const Post = require('../models/post')
const mongoose = require("mongoose");

const MONGO_URI = 'mongodb://localhost:27017/mongoose';

mongoose.connect(MONGO_URI)
    .then(()=>{
        console.info("Mongoose connected successfully in worker.js")
    })
    .catch(err=>{
        console.error("Mongoose connected failed: " + error);
    })
 
const run = async ()=>{
    let array = [];
    
    workerData.save_array.forEach(element=>{
        array.push(JSON.parse(element));
    })
    if(workerData.now_data){
        array.push(workerData.now_data);
    }

    console.log("workerData : ", workerData);
    console.log("array : ", array);
    

    await Post.insertMany(array).catch(e=>console.error(e));
    // mongoose.disconnect();
}

run().catch(err=>console.error(err));