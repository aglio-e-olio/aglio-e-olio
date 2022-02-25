const router = require('express').Router();
const MetaData = require('../models/meta_data');
const Post = require('../models/post');
const TagCollection = require('../models/tag_collection');


const metaDataString = 'people_tag extra_tag'

router.post('/save', (req, res)=>{

    const body = {
        user_id:"123naver.com",
        type:"image",
        date: "1995-11-13",
        updated_date : false, 
        algo_tag : ["dfs", "bfs", "dp", "undefined", "떠나자", "헌일이짱"],
        people_tag : "승현", 
        extra_tag : ["extra1, extra2"],
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

router.delete('/delete/:post_id', (req, res)=>{
    /*
    1. Posts에서 지워야 한다. => deleteOne
    2. MetaData에서 삭제 해야 한다. => deleteMany by post_id
    3. Tag Collection에서 수정해야 한다.
    */
})

// meta_data
// metadata?user_id= & algo_tag=
router.get('/metadata', (req, res)=>{
    const user_id = req.query.id;
    const algo_tag = req.query.tag;
    // pk만 해서 보내준다고 하고 그거에 맞는 형태를 쫌 보자. 
    MetaData.find({user_id:user_id, algo_tag:algo_tag})
        .populate('post_id', metaDataString)
        .exec(function(err, result){
            res.json(result)
        })

})



// update
router.put('/update', (req, res)=>{
    // 이거는 나중에 생각
})

module.exports = router;