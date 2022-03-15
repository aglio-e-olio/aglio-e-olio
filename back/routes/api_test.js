const router = require('express').Router();
const Post = require('../models/post');

router.get('/service', async(req, res)=>{
    const post_data = await Post.find({});

    var template = `
    Post Table
    <table border="1">
    <thead>
        <tr>
            <th>post_id<th>
            <th>title</th>
            <th>user_email</th>
            <th>nickname</th>
            <th>algo_tag</th>
            <th>extra_tag</th>
            <th>announcer</th>

            <th>cavas_data</th>

            <th>image_tn_ref</th>
            <th>video_tn_ref</th>
            <th>video_ref</th>

            <th>save_time</th>
            <th>type</th>

            <th>start_time</th>
            <th>end_time</th>
            <th>teamMates</th>
        </tr>
    </thead>
    <tbody>
    `;

    for(let p in post_data){
        template += `
        <tr>
        <th>${post_data[p]._id}<th>
        <th>${post_data[p].title}</th>
        <th>${post_data[p].user_email}</th>
        <th>${post_data[p].nickname}</th>
        <th>${post_data[p].algo_tag.toString()}</th>
        <th>${post_data[p].extra_tag.toString()}</th>
        <th>${post_data[p].announcer}</th>

        <th>생략</th>

        <th>${post_data[p].image_tn_ref}</th>
        <th>${post_data[p].video_tn_ref}</th>
        <th>${post_data[p].video_ref}</th>

        <th>${post_data[p].save_time}</th>
        <th>${post_data[p].type}</th>

        <th>${post_data[p].start_time}</th>
        <th>${post_data[p].end_time}</th>
        <th>${post_data[p].teamMates}</th>
        </tr>
        `
    }

    template+=`</tbody></table>`;
    res.send(template);

})

module.exports = router;