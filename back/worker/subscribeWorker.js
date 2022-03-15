const {parentPort} = require("worker_threads");

const getEventData = require("./getEventData")

parentPort.on("message", message=>{
    if(message==='subscribe'){
        subscribe();
    }
})

async function subscribe(){
    let response = await getEventData();

    if(response.status!==200){
        parentPort.postMessage({status:'subscribe'})
    } else {
        let {data} = await response
        parentPort.postMessage({status:'save', data:data})
    }
}