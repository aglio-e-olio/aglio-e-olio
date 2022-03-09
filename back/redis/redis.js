const redis = require('redis');
const redisClient = redis.createClient();
exports.redisClient = redisClient;
const { promisify } = require('util');
const logger = require('../config/winston');
const Post = require('../models/post');
const Mutex = require('async-mutex').Mutex;

const mutex = new Mutex();
const { Worker } = require('worker_threads')


const SAVE_COUNT = 150;


/* promisify */
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const rpushAsync = promisify(redisClient.rpush).bind(redisClient);
const lrangeAsync = promisify(redisClient.lrange).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const incrAsync = promisify(redisClient.incr).bind(redisClient);
const saddAsync = promisify(redisClient.sadd).bind(redisClient);

exports.delAsync = delAsync;
exports.setAsync = setAsync;

const sismemberAsync = promisify(redisClient.sismember).bind(redisClient);

/* Init count */
redisClient.set("count", 0, function(err){
    if(err){
        logger.warn()
    } else {
        console.log("redis 'count' : 0 set done ");
    }
});


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



function roughSizeOfObject( object ) {

    var objectList = [];
    var stack = [ object ];
    var bytes = 0;

    while ( stack.length ) {
        var value = stack.pop();

        if ( typeof value === 'boolean' ) {
            bytes += 4;
        }
        else if ( typeof value === 'string' ) {
            bytes += value.length * 2;
        }
        else if ( typeof value === 'number' ) {
            bytes += 8;
        }
        else if
        (
            typeof value === 'object'
            && objectList.indexOf( value ) === -1
        )
        {
            objectList.push( value );

            for( var i in value ) {
                stack.push( value[ i ] );
            }
        }
    }
    return bytes;
}




const redis_test = (req, res, next)=>{
    redisClient.sismember("users", "a", function(err, data){
        console.log(data);
        console.log(typeof(data));

        res.json({result : data});
    })

}
exports.redis_test = redis_test;


const redis_metadata = async (req, res, next)=>{
    if(req.query.user_email === undefined){
        res.status(400).json({error : "MetaData request : user_email is not exists"});
        logger.warn("MetaData request : user_email is not exists");
        return;
    }

    const user_email = req.query.user_email;

    mutex.acquire();
    const is_user = await sismemberAsync("users", user_email);

    if(is_user){        
        
        const save_array = await lrangeAsync("save_list", 0, -1);
        let array = [];
        save_array.forEach(element => {
            array.push(JSON.parse(element));
        });

        Post.insertMany(array, async function(err, _){
            if(err){
                res.status(500).json({error : "error"});
                mutex.release();
                return;
            } else{
                await delAsync("users");
                await delAsync('save_list');
                mutex.release();
                next();
            }
        })
    }
    else {
        mutex.release();
        next();
    }
}


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
    const save_string_data = JSON.stringify(body);
    /**
    redisClient.get('count', async function(err,count){
        if(count>=SAVE_COUNT){
            logger.verbose("mongodb save start");
            redisClient.rpush("save_list", save_string_data, function(err){
                if(err) return res.send('fail');

                redisClient.lrange("save_list", 0,-1, async function(err, save_array){
                    if(err) return res.send('fail');

                    let array = [];
                    save_array.forEach(element=>{
                        array.push(JSON.parse(element));
                    })
                    logger.verbose(`array length : ${save_array.length}`);

                    logger.verbose("post save start");
                    Post.insertMany(array);
                    logger.verbose("del users start");
                    await delAsync("users");
                    logger.verbose("del save_list start");
                    await delAsync("save_list");
                    logger.verbose("set count start");
                    await setAsync("count", 0);

                    logger.verbose("mogodb save end");
                    res.status(200).json({result :"success"});
                })
            })
        }


        else {
            logger.verbose("redis save start");
            await Promise.all([
                incrAsync("count"),
                rpushAsync("save_list", save_string_data),
                saddAsync("users", user_email)
            ])
            res.status(200).json({result : "success"});
            logger.verbose("redis save end");
        }
    })

     */
    let flag = false;
    
    await mutex.runExclusive(async()=>{
        const count = await getAsync('count');
        if(count>=SAVE_COUNT){
            flag = true;
            logger.verbose("mongodb save start :: use_flag");
            await rpushAsync("save_list", save_string_data);
            const save_array = await lrangeAsync("save_list", 0, -1);

        
            // DB!!
            runWorker(save_array);

            logger.verbose("mongodb del(users) :: use_flag");
            // redisClient.del("users");
            await delAsync("users");
            logger.verbose("mongodb del(save_list) :: use_flag");
            // redisClient.del("save_list")
            await delAsync("save_list");
            logger.verbose("mongodb set(count) :: use_flag");
            await setAsync("count", 0);
            // redisClient.set("count", 0);

            res.status(200).send("insert many success ");
            logger.verbose("mongodb save end ::  use_flag");
            return;
        } else {
            logger.verbose("redis save start :: use_flag");

            // 여기 넣는 거는 완전히 되어야 할 듯
            await Promise.all([
                incrAsync("count"),
                rpushAsync("save_list", save_string_data),
                saddAsync("users", user_email)
            ])
            res.status(200).json({result : "success"});
            logger.verbose("redis save end :: use_flag");
            return;
        }
    })
    
}
exports.redis_save = redis_save;





const testFunction = async(req, res)=>{
    const value = await redisClient.sendCommand(['get', 'heonil']);
    console.log(value)
    redisClient.keys('*', function(err, data){
        console.log(data);
    });
    res.send("success");
}
exports.testFunction = testFunction;
