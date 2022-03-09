const { stat } = require("fs");
const {Worker} = require("worker_threads");
const { db } = require("../models/post");

async function runService(){
    const subscribeWorker = new Worker('./worker/subscribeWorker.js');
    const dbWorker = new Worker('./worker/dbWorker.js');

    dbWorker.postMessage({status:'connect'});

    subscribeWorker.on('message', incoming=>{
        const {status, data} = incoming

        if(status == 'subscribe'){
            subscribeWorker.postMessage('subscribe')
        }

        if(status==='save'){
            dbWorker.postMessage({status:'save', data:data})
        }
    })

    subscribeWorker.on('error', code =>new Error(`Subscribe Worker error with exit code ${code}`));
    subscribeWorker.on("exit", code =>
        console.log(`Subscribe Worker stopped with exit code ${code}`)      
    )

    dbWorker.on("message", incoming=>{
        const {status, data} = incoming

        if(status==='subscribe'){
            subscribeWorker.postMessage('subscribe')
        }
    })

    dbWorker.on("error", code =>new Error(`Save Worker error with exit code ${code}`));
    dbWorker.on("exit", code=>{
        console.log(`Save Worker stopped with exit code ${code}`);
    })
}

module.exports = async function run(){
    await runService();
}



