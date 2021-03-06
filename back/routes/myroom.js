const router = require('express').Router();
const Post = require('../models/post');
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types;
const logger = require('../config/winston');
const { redis_test, redis_metadata,  redis_save, redisClient, zscoreAsync, mutex, getAsync, setAsync, zcardAsync, META_COUNT, zpopminAsync } = require('../redis/redis')

router.post('/test', redis_save,  (req, res)=>{
    res.send("myroom.js code");
    return;
})

router.get('/redis_test', redis_test);
router.post('/redis_test', redis_test);


// router.post('/save', redis_save, async (req, res)=>{
router.post('/save', async (req, res)=>{
    
    const body = req.body;
    /** 
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
    */

    // Post Save
    try{
        Post.create(body);
    }
    catch(err){
        logger.error("DataBase Error : Post Collection create error : ", err);
        res.status(500).json({error :"DataBase Error : Post Collection create error"});
    } finally{
        res.status(200).json({result : "success"});
    }
})

router.put('/save',  (req,res)=>{
    if(req.body._id===undefined){
        res.status(400).json({error : "There's no _id in request body"});
        logger.warn("There's no _id in request body");
        return;
    }

    if(!ObjectId.isValid(req.body._id)){
        res.status(400).json({error : "_id is not match ObjectId type"});
        logger.warn("_id is not match ObjectId type");
        return;
    }

    const filter = {_id : req.body._id};
    const update = JSON.parse(JSON.stringify(req.body));
    delete update._id;

    Post.findByIdAndUpdate(filter, update).
        then((result)=>{
            if(result===null){
                res.status(400).json({error : "There's no matching _id in Post Collection"})
                logger.warn("There's no matching _id in Post Collection");
                return;
            }
            else{
                res.status(200).json({result:"success"});
                return;
            }
        }).
        catch(err=>{
            res.status(500).json({error : "DataBase Error : Post.findByIdAndUpdate Error"})
            logger.error("DataBase Error : Post.findByIdAndUpdate Error : ", err);
            return;
        })
})

router.delete('/delete/:_id', (req, res)=>{
    // Error Handling
    if(req.params._id===undefined){
        res.status(400).json({error : "Delete request doesn't have param"});
        logger.warn("Delete request doesn't have param");
        return;
    }
    if(req.params._id===""){
        res.status(400).json({error : "Delete request param _id is empty"});
        logger.warn("Delete request param _id is empty");
        return;
    }
    if(!ObjectId.isValid(req.params._id)){
        res.status(400).json({error : "Delete request param _id is not match ObjecId Type"});
        logger.warn("Delete request param _id is not match ObjecId Type");
        return;
    }
    // Delete by Post id
    Post.findByIdAndDelete(req.params._id, function(err, result){
        if(err){
            res.status(500).send("DataBase error : Post.findByIdAndDelete");
            logger.error({error :"DataBase error : Post.findByIdAndDelete : ", err});
            return;
        } 
        if(result === null){
            res.status(400).json({error : "There's no matching post id in Post Collection"});
            logger.warn("There's no matching post id in Post Collection");
            return;
        }
        else{
            res.status(200).json({result:"success"});
        }
    })
})

// router.get('/metadata', async (req, res)=>{
router.get('/metadata',redis_metadata, async (req, res)=>{
    /**
    if(req.query.user_email === undefined){
        res.status(400).json({error : "MetaData request : user_email is not exists"});
        logger.warn("MetaData request : user_email is not exists");
        return;
    }
     */

    const user_email = req.query.user_email;
    // ?????? ??????
    /** 
    Post.find({user_email:user_email}).
        select("-canvas_data -__v").
        exec(async function(err, result){
            if(err){
                // DataBase Error
                res.status(500).json({error : "DataBase Error : Post.find error" });
                logger.error("DataBase Error : Post.find error");
                return;
            }
            if(result.length===0){
                res.status(400).json({error : "There is no user_email in Post Collection"});
                logger.warn("There is no user_email in Post Collection");
                return;
            } else{
                res.status(200).json(result);
                return;
            }
        })

    return;
    */

    // const user_email = req.query.user_email;
    mutex.runExclusive(async()=>{
        // Check metadata is cached
        const is_meta = await zscoreAsync('meta', user_email);
        if(is_meta){
            let data = await getAsync(user_email);
            res.status(200).json(JSON.parse(data));
            redisClient.zrem('meta', user_email);
            redisClient.zadd('meta', Date.now(), user_email);
            return;
        } 

        
        Post.find({user_email:user_email}).
            select("-canvas_data -__v").
            // sort(""). 
            exec(async function(err, result){
                if(err){
                    // DataBase Error
                    res.status(500).json({error : "DataBase Error : Post.find error" });
                    logger.error("DataBase Error : Post.find error");
                    return;
                }
                if(result.length===0){
                    res.status(400).json({error : "There is no user_email in Post Collection"});
                    logger.warn("There is no user_email in Post Collection");
                    return;
                } else{
                    res.status(200).json(result);

                    const count = await zcardAsync('meta');
                    if (count>META_COUNT){
                        // LRU??? ??? ????????????
                        redisClient.set(user_email, JSON.stringify(result));
                        redisClient.zadd('meta', Date.now(), user_email);

                        // pop!
                        const pop_email = await zpopminAsync('meta');
                        redisClient.del(pop_email[0]);
                    } else {
                        redisClient.set(user_email, JSON.stringify(result));
                        redisClient.zadd('meta', Date.now(), user_email);
                    }
                    return;
                }
            })
    })
})

router.get("/selfstudy", (req, res)=>{
    if(req.query._id===undefined){
        res.status(400).json({error : "preview requeset param _id doesn't exists"});
        logger.warn("preview requeset param _id doesn't exists");
        return;
    }
    if(req.query._id==="preview requeset param _id doesn't exists"){
        res.status(400).json({error : "preview requeset param _id is empty"});
        logger.warn("preview requeset param _id is empty");
        return;
    }

    if(!ObjectId.isValid(req.query._id)){
        res.status(400).json({error : "preview request param _id isn't ObjectId Type"})
        logger.warn("preview request param _id isn't ObjectId Type");
        return;
    }

    Post.findOne({_id:req.query._id}).
        // select("canvas_data").
        exec(function(err, result){
            if(err){
                res.status(500).json({error : "Database Error : Post.findOne Error"});
                logger.error("Database Error : Post.findOne Error, ", err);
                return;
            }

            if(result===null){
                res.status(400).json({error : "There's no matching _id in Post Collections"});
                logger.warn("There's no matching _id in Post Collections");
            } else{
                res.status(200).json(result);
            }
        })
})


router.get("/preview", (req, res)=>{
    if(req.query._id===undefined){
        res.status(400).json({error : "preview requeset param _id doesn't exists"});
        logger.warn("preview requeset param _id doesn't exists");
        return;
    }
    if(req.query._id==="preview requeset param _id doesn't exists"){
        res.status(400).json({error : "preview requeset param _id is empty"});
        logger.warn("preview requeset param _id is empty");
        return;
    }

    if(!ObjectId.isValid(req.query._id)){
        res.status(400).json({error : "preview request param _id isn't ObjectId Type"})
        logger.warn("preview request param _id isn't ObjectId Type");
        return;
    }

    Post.findOne({_id:req.query._id}, function(err, result){
        if(err){
            res.status(500).json({error:"DataBase Error : Post.findOne Error"});
            logger.error("DataBase Error : Post.findOne Error : ", err);
            return;
        }
        if(result===null){
            res.status(400).json({error : "There's no matching _id in Post Collections"});
            logger.warn("There's no matching _id in Post Collections");
        } else {
            res.status(200).json(result);
            return;
        }
    })
})

module.exports = router;