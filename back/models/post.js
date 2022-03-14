const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    
    title:String,
    user_email: { type:String, required:[true, "user_email error"] },
    nickname: String,

    algo_tag: Array,
    extra_tag: Array,
    announcer: String,
    
    canvas_data:Array, 
    
    image_tn_ref:String,
    video_tn_ref:String,
    video_ref:String,

    save_time: {type : String, required: [true, "save_time error"]},
    update_time:String,
    type:{type:String, required : [true, "type error"]},

    start_time: String,
    end_time:String,    
    teamMates:Array
})

postSchema.statics.create = async function(body){
    /**
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

    // Title Error Case
    if(!body.hasOwnProperty('title')|| body.title===""){
        body["title"] = "제목없음";
    }
     */

    const new_post = new this(body);
    return await new_post.save();
}

postSchema.statics.update = async function(filter, update){
    
    // Array Type Error Case
    if (!update.hasOwnProperty('algo_tag')){
        update['algo_tag']=[];
    }
    else if(update.algo_tag[0]===null){
        update['algo_tag']=[];
    }

    if(!update.hasOwnProperty('extra_tag')){
        update['extra_tag']=[];
    }
    else if(update.extra_tag[0]===null){
        update['extra_tag']=[];
    }

    if(!update.hasOwnProperty('teamMates')){
        update['teamMates']=[];
    }
    else if(update.teamMates[0]===null){
        update['teamMates']=[];
    }

    // Title Error Case
    if(!update.hasOwnProperty('title')|| body.title===""){
        update["title"] = "제목없음";
    }
    return this.findByIdAndUpdate(filter, update);
}



module.exports = mongoose.model('Post', postSchema);