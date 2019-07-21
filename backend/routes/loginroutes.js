const couchDBMain = require('../libs/couchDBMain');

exports.register = function(req,res){
  // console.log("req",req.body);
  var today = new Date();
  // bcrypt.hash(req.body.password, 5, function( err, bcryptedPassword) {
   //save to db
   let ts = +new Date;
   let userDoc={
     "_id":'user_'+req.body.username,
     "first_name":req.body.first_name,
     "last_name":req.body.last_name,
     "username":req.body.username,
     "email":req.body.email,
     "password":req.body.password,
     "created":today,
     "modified":today
   }
   let usersDB = couchDBMain.getUsersDB();
   try {
    couchDBMain.createDoc(userDoc,usersDB);
    res.send({
      "code":200,
      "success":"user registered sucessfully"
        });  
   }catch(e){
    //  console.log('The solution is: ', results);
   
         console.log("error ocurred",error);
         res.send({
           "code":400,
           "failed":"error ocurred"
         })
   }
   };
  // });
  




exports.login =async function(req,res){
  var userid= req.body.username;
  var password = req.body.password;
  var role = req.body.role;
  let usersDB = couchDBMain.getUsersDB();
  try{
    console.log(userid);
    let userDoc =await couchDBMain.getDoc('user_'+userid,usersDB,"couldn't fetch user doc");
    console.log(userDoc);
    console.log(password);
    console.log(userDoc.password);
    if(userDoc.password === password){
      res.send({
        "user": userDoc.first_name +" "+userDoc.last_name,
        "userId":userDoc._id,
        "code":200,
        "success":"login sucessfull"
      })
    }else{
      res.send({
        "code":204,
        "success":"Email and password does not match"
   })
    }
    
  }catch(e){
    console.log("error ocurred",e);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }

}
