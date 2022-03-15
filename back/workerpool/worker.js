const workerpool = require('workerpool');
const Post = require('../models/post');
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/mongoose';

mongoose.connect(MONGO_URI)
    .then(()=>{
        console.info("Mongoose connected successfully in worker.js")
    })
    .catch(err=>{
        console.error("Mongoose connected failed: " + error);
    })


async function batch_save(workerData, now_data){
    let array = [];
    
    workerData.forEach(element=>{
        array.push(JSON.parse(element));
    })
    if(now_data){
        array.push(now_data);
    }    

    await Post.insertMany(array).catch(e=>console.error(e));
}

// create a worker
workerpool.worker({
    batch_save: batch_save
})