var express = require('express');
var router = express.Router();

var postCtrl = require('../controllers/postController');

router.post('/createPost',async function(req, res) {
    try{
        let resp= await postCtrl.createPost(req.body);
        res.send(resp);
        res.end();
        }catch(e){
            let error = new Error(e);
            res.send(error);
            res.end();
        }

});