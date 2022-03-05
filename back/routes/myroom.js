const router = require('express').Router();
const Post = require('../models/post');
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types;
const logger = require('../config/winston');

router.post('/save', (req, res)=>{
    const body = req.body;
    // Error Handling
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
    // thumbnail empty error
    if(body.type==="image"){
        if(!body.hasOwnProperty("image_tn_ref")){
            res.status(400).json({error:"Thumbnail doesn't come"});
            logger.warn("Thumbnail doesn't come");
            return;
        }
    }
    // user email empty error
    if(body.user_email===""){
        res.status(400).json({error : "user_email is empty"});
        logger.warn("user_email is empty");
        return; 
    }
    // Post Save
    try{
        Post.create(body);
        res.status(200).json({result : "success"});
    }
    catch(err){
        logger.error("DataBase Error : Post Collection create error : ", err);
        res.status(500).json({error :"DataBase Error : Post Collection create error"});
    }
})

router.put('/save', (req,res)=>{
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
        if(result ===null){
            res.status(400).json({error : "There's no matching post id in Post Collection"});
            logger.warn("There's no matching post id in Post Collection");
            return;
        }
        else{
            res.status(200).json({result:"success"});
        }
    })
})

router.get('/metadata', (req, res)=>{
    if(req.query.user_email === undefined){
        res.status(400).json({error : "MetaData request : user_email is not exists"});
        logger.warn("MetaData request : user_email is not exists");
        return;
    }
    const user_email = req.query.user_email;
    Post.find({user_email:user_email}).
        select("-canvas_data -__v").
        // sort(""). 
        exec(function(err, result){
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