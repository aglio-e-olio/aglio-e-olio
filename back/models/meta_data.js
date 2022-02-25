const mongoose = require('mongoose');
const { Schema } = mongoose;
const metaDataSchema = new Schema({
    user_id: String,
    algo_tag: String,
    algo_other_tag: Array,
    post_id : {type:Schema.Types.ObjectId, ref:'Post'},
})

metaDataSchema.statics.createOne = function(user_id, algo_tag, algo_other_tag, post_id){
    var doc = new this({
        user_id:user_id,
        algo_tag: algo_tag, // String
        algo_other_tag: algo_other_tag,
        post_id:post_id
    })

    doc.save()
        .then(()=>console.log("Success MetaData's create"))
        .catch(e=> console.error(e))

}


module.exports = mongoose.model('MetaData', metaDataSchema);
