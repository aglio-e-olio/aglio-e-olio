const mongoose = require('mongoose')
const TagCollection = require('./tag_collection');
const MetaData = require('./meta_data');


// post_id는 알아서 만들어주니깐
const postSchema = new mongoose.Schema({
    user_id: String,
    type: String,
    date: String, // Date 말고 String 으로 받는 것도 괜찮으려나 음.
    updated_date: String,
    algo_tag: Array,
    people_tag: String,
    extra_tag: Array,
    thumbnail: String, // temp
    data_ref: String, // temp
})

// statics 등록

postSchema.statics.create = function(params){// params를 payload로 바꾸기
    
    // const { user_id, ~~ } = params;
    const user_id = params.user_id;
    const type = params.type;
    const date = params.data;
    const algo_tag = params.algo_tag;
    const people_tag = params.people_tag;
    const other_tag = params.other_tag;
    const thumbnail_ref = params.thumbnail; //일단 신경쓰지 말자.
    const data_ref = params.data_ref;

    var new_post = new this({
        user_id: user_id,
        type: type, 
        date: date,
        updated_date: date, // any type이 없네
        algo_tag: algo_tag,
        people_tag: people_tag,
        other_tag: other_tag,
        thumbnail_ref: thumbnail_ref,
        data_ref: data_ref
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
                        const tag = { $set: update_tag, upsert:true};
                        TagCollection.updateTag(filter,  tag);
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