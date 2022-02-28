const mongoose = require('mongoose')
const TagCollection = require('./tag_collection');
const MetaData = require('./meta_data');


// post_id는 알아서 만들어주니깐
const postSchema = new mongoose.Schema({
    
    title:String,
    user_id: String,
    nickname: String,

    algo_tag: Array,
    extra_tag: Array,
    announcer: String,
    
    snapshot:String, // 일단은 mongoDB에 저장 -> 추후에 바꿈 -> S3로 ref로 바꿀 예정
    // 이름 Thunmbnail
    doc:Array, // Room 저장한 경우
    data_ref: String, // video 인 경우 // 그냥 일단 다 넣어주고 해야게싿.
    
    type: String,
    date: String, 
    updated_date: String,
    startTime:String,
    endTime:String,
    teamMates:Array
})

// 네이밍 통일하고 코드 길이 줄여야 겠다.
postSchema.statics.create = function(body){// params를 payload로 바꾸기
    // Room 저장시
    if(body.isPicture){
        // 따로 처리해줘야 하는데 일단 나중에
    }
    const title = body.title;
    const user_id = body.email;
    const nickname = body.email;
    
    const algo_tag = body.algorithm;
    const extra_tag = body.extras;
    const announcer = body.announcer;

    const snapshot = body.snapshot;
    const doc = body.doc;
    const data_ref=body.data_ret; // 나중에 client쪽으로 설정해라고 해야 할 듯.

    const type = "room"; // room 인지 video 인지에 따라 많이 달라진다.
    const date = body.saveTime;
    const updated_date = false;
    const startTime = body.startTime;
    const endTime = body.endTime;
    const teamMates = body.teamMates;

    var new_post = new this({
        title:title,
        user_id:user_id,
        nickname:nickname,
        algo_tag:algo_tag,
        extra_tag:extra_tag, 
        announcer:announcer,
        snapshot:snapshot,
        doc:doc,
        data_ref:data_ref,
        type:type,
        date:date, 
        updated_date:updated_date,
        startTime:startTime,
        endTime:endTime,
        teamMates:teamMates
    })

    new_post.save()
        .then(saved_post=>{
            const filter = {user_id : user_id}
            
            /* Tag Collection Setting */
            TagCollection.findOne(filter)
                .select('algo_tag -_id')
                .exec(function(err, result){

                    // Error handling
                    if(err) return err;

                    // first create
                    if(result===null){
                        TagCollection.firstCreate(user_id, algo_tag);
                    } 

                    else{
                        let update_tag = {}

                        algo_tag.forEach(tag=>{
                            if(result.algo_tag[tag]){
                                update_tag["algo_tag."+tag] = result.algo_tag[tag] + 1;
                            }
                            else{
                                update_tag["algo_tag."+tag] = 1;
                            }
                        })

                        const tag_ = { $set: update_tag, upsert:true};
                        TagCollection.updateTag(filter,  tag_)
                            .catch(e=>console.error(e));
                    }
                })
            
            /* Meta Data Setting */
            algo_tag.forEach((tag)=>{
                var other_tag = new Set(algo_tag);
                other_tag.delete(tag);
                other_tag = Array.from(other_tag);
                MetaData.createOne(user_id, tag, other_tag, saved_post._id);
            })
        })
    return true;
}

module.exports = mongoose.model('Post', postSchema);