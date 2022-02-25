const router = require('express').Router();
const MetaData = require('../models/meta_data');
const Post = require('../models/post');
const TagCollection = require('../models/tag_collection');
const mongoose = require('mongoose')


const metaDataString = 'people_tag extra_tag'

router.post('/save', (req, res)=>{

    const body = {
        user_id:"gopas3167",
        type:"image",
        date: "1995-11-13",
        updated_date : false, 
        algo_tag : ["dp", "dfs"],
        people_tag : "준영", 
        extra_tag : ["extra4, extra5, extra6"],
        thumbnail: "thumbnail",
        data_ref: "data_ref"
    }
    
    if(Post.create(body)===true){
        res.json({success:"success"})
    }
    else{
        res.status(500).json({success:"fail"})
    }    
})


router.get('/test', (req, res)=>{
    MetaData.find().populate('post_id', 'user_id algo_tag').exec(function(err, result){
        // 배열로 저장된다.
        // delete를 어떻게 하지?
        // 일단 생각하지 말고 go 해보자.
    });
    res.send("s")
})


// tags 정보
router.get('/tags/:id', (req, res)=>{
    const user_id = req.params.id;
    TagCollection.findOne({user_id:user_id}).
        then(result=>{
            tags = result.algo_tag;
            var tags_sorted = Object.keys(tags).sort(function(a,b){return tags[b]-tags[a]}); 
            var tag_array = [];
            var prop_key = 0;
            tags_sorted.forEach(tag=>{
                const num = tags[tag];
                temp = {tag_name : tag, count : num, prop:prop_key};
                prop_key+=1;
                tag_array.push(temp);
            });
            result = { tags : tag_array }            
            res.json(result)
        }).
        catch(err=>res.status(500).send(err))
})


router.delete('/delete/:post_id', async(req, res)=>{

    const post_id = req.params.post_id;
    Post.findByIdAndDelete(post_id, function(err, result){
        if(err){
            res.status(500).send(err);
        } else{
            const user_id = result.user_id;
            const algo_tag = result.algo_tag;

            TagCollection.findOne({user_id:user_id})
                .select('algo_tag')
                .exec(function(res, data){
                    let set_tag = {}
                    let unset_tag = {}
                    algo_tag.forEach(tag=>{
                        if(data.algo_tag[tag] - 1>0)
                            set_tag["algo_tag."+tag] = data.algo_tag[tag] - 1;
                        else if(data.algo_tag[tag] - 1 == 0)
                        unset_tag["algo_tag."+tag] = ""
                    })
                    const tag_ = {$set:set_tag, $unset:unset_tag}

                    TagCollection.updateTag({user_id:user_id}, tag_)
                        .catch(e=>console.error(e))
                })

            // data ref도 삭제 해줘야 한다..~!

        }
    });

    await MetaData.deleteMany({post_id:mongoose.Types.ObjectId(post_id)});
    res.json({success:"success"})
})

router.get('/metadata', (req, res)=>{
    const user_id = req.query.id;
    const algo_tag = req.query.tag;

    MetaData.find({user_id:user_id, algo_tag:algo_tag})
        .populate('post_id', metaDataString)
        .select('algo_other_tag post_id -_id')
        .exec(function(err, result){
            var res_array = [];
            var prop = 0;
            result.forEach(elem=>{
                var tag_array = new Array();
                elem.algo_other_tag.forEach(tag=>{
                    tag_array.push(tag)
                })

                console.log(tag_array)
                if (elem.post_id.people_tag)
                    tag_array.push(elem.post_id.people_tag)

                elem.post_id.extra_tag.forEach(tag=>{
                    tag_array.push(tag)
                })

                const changed_elem = {
                    primary_key : elem.post_id._id,
                    tags:tag_array,
                    prop: prop
                }
                prop += 1;

                res_array.push(changed_elem)
            })
            res.json(res_array)
        })
})



// update
router.put('/update', (req, res)=>{
    // 이거는 나중에 생각
})

module.exports = router;