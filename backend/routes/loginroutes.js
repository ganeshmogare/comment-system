const couchDBMain = require('../libs/couchDBMain');
var bcrypt = require('bcrypt');

var cryptPassword = function (password, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    if (err)
      return callback(err);

    bcrypt.hash(password, salt, function (err, hash) {
      return callback(err, hash);
    });
  });
};

var comparePassword = function (plainPass, hashword, callback) {
  bcrypt.compare(plainPass, hashword, function (err, isPasswordMatch) {
    return err == null ?
      callback(null, isPasswordMatch) :
      callback(err);
  });
};


exports.register = function (req, res) {
  var today = new Date();
  cryptPassword(req.body.password, function (err, encryptedPwd) {
   if(err){
     res.send({
       "code":400,
       "failed":"password encryption failed",
       "error": err
     })
   }
    let ts = +new Date;
    let userDoc = {
      "_id": 'user_' + req.body.username,
      "first_name": req.body.first_name,
      "last_name": req.body.last_name,
      "username": req.body.username,
      "email": req.body.email,
      "password": encryptedPwd,
      "created": today,
      "modified": today
    }
    let usersDB = couchDBMain.getUsersDB();
    try {
      couchDBMain.createDoc(userDoc, usersDB);
      res.send({
        "code": 200,
        "success": "user registered sucessfully"
      });
    } catch (e) {
      console.log("error ocurred", error);
      res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    }
  });
};




exports.login = async function (req, res) {
  var userid = req.body.username;
  var password = req.body.password;
  var role = req.body.role;
  let usersDB = couchDBMain.getUsersDB();
  try {
    let userDoc = await couchDBMain.getDoc('user_' + userid, usersDB, "couldn't fetch user doc");
    comparePassword(password, userDoc.password, function (err, pwdMatched) {
      if (err) {
        res.send({
          "code": 204,
          "success": "password encryption failed",
          "error": err
        })
        return;
      }
        if(pwdMatched){
        res.send({
          "user": userDoc.first_name + " " + userDoc.last_name,
          "userId": userDoc._id,
          "code": 200,
          "success": "login sucessfull"
        })
      }else{
        res.send({
          "code": 204,
          "success": "Email and password does not match"
        })
      }
      
    });

  } catch (e) {
    console.log("error ocurred", e);
    res.send({
      "code": 400,
      "failed": "error ocurred"
    })
  }

}
