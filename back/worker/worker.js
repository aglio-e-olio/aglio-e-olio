const { workerData, parentPort } = require('worker_threads');
const Post = require('../models/post')


const run = async ()=>{
    let array = [];        
    workerData.forEach(element=>{
        array.push(JSON.parse(element));
    })
    console.log('hi');

    test_tag = [
        {
            title:"test2",
            user_email:"test@gmail",
            nickname:"heonil",
            algo_tag :["1","2","3"],
            extra_tag : ["2","3","4"],
            announcer : 'announcer',
            canvas_data :[1,2],
            imgae_tn_ref :"String",
            save_time:"save_time",
            type:'image',
            teamMates:[1,2,3]
        },
        {
            title:"test2",
            user_email:"test@gmail",
            nickname:"heonil",
            algo_tag :["1","2","3"],
            extra_tag : ["2","3","4"],
            announcer : 'announcer',
            canvas_data :[1,2],
            imgae_tn_ref :"String",
            save_time:"save_time",
            type:'image',
            teamMates:[1,2,3]
        }
    ]
    await Post.insertMany(test_tag).catch(e=>console.error(e));
    parentPort.postMessage('pong');
}

run().catch(err=>console.error(err));