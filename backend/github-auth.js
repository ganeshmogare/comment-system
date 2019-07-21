//Name of the file : github-auth.js
// Section 1 get the requirements and initialize express app
const express = require('express');
const request = require('request');
const app = express();
var cors = require('cors');
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var cors = require('cors');
app.set('trust proxy',1);
app.use(cors({
    credentials : true,
    origin: true
}))


// Section 2- configure variables and different urls
// config to define app settings
// use environment variables [ process.env ] for sensitive data like api keys and secrets
var config = {
   client_id: '78e0d3578db374d987f7',
   client_secret: 'b148631d3ae1c049969dace29edc08f34e3b88eb',
   redirect_url: 'http://localhost:4000/github/callback',
   authorize_url:'https://github.com/login/oauth/authorize',
   token_url: 'https://github.com/login/oauth/access_token',
   user_url: 'https://api.github.com/user',
   scope: 'user'
 };


// Section-3 Define the routes and callback url

// define routes
const allowedOrigins = [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:8100',
    'https://github.com'
  ];
  
  // Reflect the origin if it's in the allowed list or not defined (cURL, Postman, etc.)
  const corsOptions = {
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    }
  }
  
  // Enable preflight requests for all routes
  app.options('*', cors(corsOptions));
  
  app.get('/', cors(corsOptions), (req, res, next) => {
    res.json({ message: 'This route is CORS-enabled for an allowed origin.' });
  })
app.get('/github/auth', function(req,res){
   // redirect the user to github authorization url
   return res.redirect(config.authorize_url);
});

app.get('/github/callback', function(req,res){
   // extract authorize code 
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


// Section 4 start the app

app.listen(4000, () => console.log('Njera github-api app listening on port 4000!'));

