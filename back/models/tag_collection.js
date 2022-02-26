const mongoose = require('mongoose');

const tagCollectionSchema = new mongoose.Schema({
    user_id: String,
    algo_tag: Object
})

tagCollectionSchema.statics.firstCreate = function(user_id, algo_tag){

    let tag_count = {};
    algo_tag.forEach(tag=>{
        tag_count[tag] = 1
    })

    const new_tag_collection = new this({ user_id:user_id, algo_tag: tag_count})
    return  new_tag_collection.save()
}

tagCollectionSchema.statics.updateTag = function(filter, update){
    return this.findOneAndUpdate(filter, update)
}



module.exports = mongoose.model('TagCollection', tagCollectionSchema);