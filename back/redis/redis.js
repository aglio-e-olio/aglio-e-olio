const redis = require('redis');
const redisClient = redis.createClient();
exports.redisClient = redisClient;
const { promisify } = require('util');
const logger = require('../config/winston');
const Post = require('../models/post');
const Mutex = require('async-mutex').Mutex;
const mongoose = require('mongoose');
const mutex = new Mutex();
const { Worker } = require('worker_threads')


const SAVE_COUNT = 100;


/* promisify */
const delAsync = promisify(redisClient.del).bind(redisClient);
const hgetAsync = promisify(redisClient.hget).bind(redisClient);
const hsetAsync = promisify(redisClient.hset).bind(redisClient);
const hlenAsync = promisify(redisClient.hlen).bind(redisClient);
const hvalsAsync = promisify(redisClient.hvals).bind(redisClient);
const hexistsAsync = promisify(redisClient.hexists).bind(redisClient);
const hdelAsync = promisify(redisClient.hdel).bind(redisClient);


function runWorker(workerData){
    return new Promise((resolve, reject)=>{
        const worker = new Worker('./worker/worker.js', {workerData});
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code)=>{
            if(code !==0 )reject(new Error(`Worker sttoped with exit code ${code}`));
            console.log('worker exit')
        })
    })
}



const redis_test = async (req, res)=>{

}
exports.redis_test = redis_test;


const redis_metadata = async (req, res, next)=>{
    if(req.query.user_email === undefined){
        res.status(400).json({error : "MetaData request : user_email is not exists"});
        logger.warn("MetaData request : user_email is not exists");
        return;
    }

    const user_email = req.query.user_email;
    
    await mutex.runExclusive(async()=>{
        const is_user = await hexistsAsync("savelist", user_email);
        
        if(is_user){
            const _id = mongoose.Types.ObjectId();
            let redis_data = await hgetAsync('savelist', user_email);
            redis_data = JSON.parse(redis_data);
            redis_data['_id'] = _id;

            Post.find({user_email:user_email}).
                select("-canvas_data -__v").
                exec(async function(err, result){
                    if(err){
                        // DataBase Error
                        res.status(500).json({error : "DataBase Error : Post.find error" });
                        logger.error("DataBase Error : Post.find error");
                        return;
                    } 

                    result.push(redis_data);
                    res.status(200).json(result); 

                    redisClient.hdel('savelist', user_email);
                    Post.create(redis_data);
                })
        } 
        else {
            next();
        }
    })
}
exports.redis_metadata = redis_metadata;


const redis_save = async (req, res, next) =>{
    const body = req.body;

    /* Error Handling */
    if (!body.hasOwnProperty('user_email') || !body.hasOwnProperty('save_time') ||
        !body.hasOwnProperty('type')){
            res.status(400).json({error : "Schema required Fail"});
            logger.warn("Schema required Fail");
            return;
    }
    if(!(body.type ==="image" || body.type==="video")){
        res.status(400).json({error:"type must be 'image' or 'video'"});
        logger.warn("type must be 'image' or 'video'");
        return;
    }
    if(body.type==="image"){
        if(!body.hasOwnProperty("image_tn_ref")){
            res.status(400).json({error:"Thumbnail doesn't come"});
            logger.warn("Thumbnail doesn't come");
            return;
        }
    }
    if(body.user_email===""){
        res.status(400).json({error : "user_email is empty"});
        logger.warn("user_email is empty");
        return; 
    }

    /* Modify */
    if (!body.hasOwnProperty('algo_tag')){
        body['algo_tag']=[];
    }
    else if(body.algo_tag[0]===null){
        body['algo_tag']=[];
    }

    if(!body.hasOwnProperty('extra_tag')){
        body['extra_tag']=[];
    }
    else if(body.extra_tag[0]===null){
        body['extra_tag']=[];
    }

    if(!body.hasOwnProperty('teamMates')){
        body['teamMates']=[];
    }
    else if(body.teamMates[0]===null){
        body['teamMates']=[];
    }
    if(!body.hasOwnProperty('title')|| body.title===""){
        body["title"] = "제목없음";
    }
    const user_email = body.user_email;

    await mutex.runExclusive(async()=>{
        const is_user = await hexistsAsync("savelist", user_email);
        if(is_user){
            next();
            return;
        }

        const count = await hlenAsync('savelist');
        if(count>=SAVE_COUNT){
            const save_array = await hvalsAsync("savelist");
            const workerData = {save_array : save_array, now_data : body}
            runWorker(workerData);
            redisClient.del('savelist');
            res.status(200).send("insert many success");
            return;
        } else {
            const save_string_data = JSON.stringify(body); 
            redisClient.hset('savelist', user_email, save_string_data);
            res.status(200).json({result : "success"});
            return;
        }
    })
}
exports.redis_save = redis_save;
