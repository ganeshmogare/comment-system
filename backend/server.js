var express    = require("express");
var login = require('./routes/loginroutes');

var bodyParser = require('body-parser');

var app = express();
var cors = require('cors');
app.set('trust proxy',1);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


var router = express.Router();
var config = {
    client_id: '78e0d3578db374d987f7',
    client_secret: 'b148631d3ae1c049969dace29edc08f34e3b88eb',
    redirect_url: 'http://localhost:4000/github/callback',
    authorize_url:'https://github.com/login/oauth/authorize',
    token_url: 'https://github.com/login/oauth/access_token',
    user_url: 'https://api.github.com/user',
    scope: 'user'
  };
router.get('/github/auth', function(req,res){
    // redirect the user to github authorization url
    // res.end('hi');
    return res.redirect( config.authorize_url);
 });
 
 router.get('/github/callback', function(req,res){
    var code = req.query.code
 
    // configure request params
    options = {
      method: 'POST',
      uri: config.token_url,   
      formData: {
        client_id   : config.client_id,
        client_secret   : config.client_secret,
        code : code
      },
      headers: {
        accept:  'application/json'
      }
    };
 
    // make a request for auth_token using above options
    request(options , function(e,r,b){
    
      // process the body
      if(b) {
        jb = JSON.parse(b)
 
        // configure request to fetch user information
        options_user = {
          method:'GET',
          url: config.user_url+'?access_token='+jb.access_token,
          headers: {
            accept: 'application/json',
            'User-Agent': 'custom'
          }
        }
        request(options_user , function(ee,rr,bb){
          // process the body
          if(bb) {
            var bo = JSON.parse(bb)
            var resp = {
              name: bo.name ,
              url: bo.url ,
              id: bo.id ,
              bio: bo.bio
            }
            return res.json(resp)
          }
          else {
            console.log(er)
            return res.json(er)
          }
        });
      }
    });
  });
  

//route to handle user registration
router.post('/register',login.register);
router.post('/login',login.login);
router.get('/getAllPostData',async function(req,res){
    try{
        var postCtrl = require('./controllers/postController');
        let resp= await postCtrl.getAllPosts(req.query);
        res.send(resp);
        res.end();
    }catch(e){

        res.send(e);
    }

});
router.post('/createPost',async function(req,res){
   try{
    var postCtrl = require('./controllers/postController');
   let resp= await postCtrl.createPost(req.body);
   res.send(resp);
   res.end();
   }catch(e){
       let error = new Error(e);
       res.send(error);
       res.end();
   }
});
router.post('/updatePost',async function(req,res){
    try{
     var postCtrl = require('./controllers/postController');
    let resp= await postCtrl.updatePost(req.body);
    res.send(resp);
    res.end();
    }catch(e){
        let error = new Error(e);
        res.send(error);
        res.end();
    }
 });

 //addComment
 router.post('/addComment',async function(req,res){
    try{
     var postCtrl = require('./controllers/postController');
    let resp= await postCtrl.addComment(req.body);
    res.send(resp);
    res.end();
    }catch(e){
        let error = new Error(e);
        res.send(error);
        res.end();
    }
 });
 //addReply
 router.post('/addReply',async function(req,res){
    try{
     var postCtrl = require('./controllers/postController');
    let resp= await postCtrl.addReply(req.body);
    res.send(resp);
    res.end();
    }catch(e){
        let error = new Error(e);
        res.send(error);
        res.end();
    }
 });

//route to handle file printing and listing
app.use('/api', router);
app.listen(4000);