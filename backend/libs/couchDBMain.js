let couchDBMain = function(req,res){
let _self = this;
const fs = require('fs');
const couchViewHelper = require('./couchViewHelper');
const MAX_COUCH_RETRY_COUNT =3;
let dbUrl = "http://admin:adminpwd@127.0.0.1:5984";
let nano = require('nano-blue')(dbUrl);
let maxPostId = 0
let maxCommentId =0;
this.createDb = async function(dbUrl, dbName) {
  // let nanoWithPromises = require('nano-blue')(dbUrl);
  try {
      await nano.db.get(dbName);
      console.log(dbName + 'DB Exists ');
  } catch (reason) {
      console.log('creating ' + dbName + ' DB');
      return await nano.db.create(dbName);
  }
};
this.createCouchDbViews = async function(dbInstance, dbSuffix) {
    try {
        let viewFileName = __dirname + '/../couchDBViews/' + dbSuffix + 'DBViews';
        if (!fs.existsSync(viewFileName + '.js')) {
            console.log('views doesnt exist');
            return;
        }
        let viewsJson = require(viewFileName);

        await couchViewHelper.createViews(dbInstance, viewsJson.designDocs);
    } catch (error) {
        throw error;
    }
};

this.initDBs = async function(){
  let dbsArray =["users","posts","comments"];
//   let dbInstanceArray = [_self.getUsersDB(),_self.getPostsDB(),_self.getCommentsDB()]
  for(let i=0;i<dbsArray.length;i++){
    await _self.createDb(dbUrl,dbsArray[i]);
    await _self.createCouchDbViews(nano.use(dbsArray[i]),dbsArray[i]);
  }
}
var init =async function(){
await _self.initDBs();
maxPostId = await _self.maxPostId();
maxCommentId = await _self.maxCommentId();
}
init();
this.getMaxPostId = function(){
    return maxPostId;
}

this.getMaxCommentId = function(){
    return maxCommentId;
}
this.getUsersDB = function(){
  return nano.use('users');
}

this.getPostsDB = function(){
  return nano.use('posts');
}

this.getCommentsDB = function(){
  return nano.use('comments');
}
this.maxPostId =async function(){
    var params =  {
        reduce: true
    }
    try{
    let queryResp =await _self.getView("all_posts_collection","all_posts",params,_self.getPostsDB());
        let maxId = 0;
        if (queryResp.length) {
                      
           maxId = queryResp[0].value;
        }
           return maxId;
    }catch(e){
        throw e;
    };
    
}

this.maxCommentId =async function(){
    try{
        var params =  {
            reduce: true
        }
   let queryResp = await _self.getView("all_comments_collection","all_comments",params,_self.getCommentsDB());
        let maxId = 0;
        if (queryResp.length) {
                      
           maxId = queryResp[0].value;
           }
           return maxId;
    }catch(e){
        throw e;
    };
}


this.getView = function(designDocName, viewName, params, db) {
    if (!params.reduce) {
        params.reduce = false;
    }

    return db.view(designDocName, viewName, params).spread(function(body, header) {
        return body.rows;
    }).catch(function(err) {
        console.log(err);
        console.log('Query Error ' + designDocName + '/' + viewName);
        console.log(params);
        return [];
    });
};

this.createDoc = function(jsonDoc, db, reTryCount, errMsg) {
    if (!errMsg) {
        errMsg = 'Out of Trials';
    }

    if (!reTryCount) {
        reTryCount = MAX_COUCH_RETRY_COUNT;
    }

    return db.insert(jsonDoc).spread(function(body, header) {
        return [body, header];
    }).catch(function(err) {

        let bRetry = err.statusCode !== 400 && err.statusCode !== 401 && err.statusCode !== 404 && err.statusCode !== 409;
        if (!bRetry) {
            console.log('create document <' + jsonDoc._id + '> error ' + err.statusCode + ' reason: <' + err.reason + '>');
        } else {
            console.log(jsonDoc);
            console.log(err);
        }

        if (!bRetry || reTryCount === 0) {
            if (errMsg === 'propagate') {
                errMsg = err;
            }
            return Promise.reject(errMsg);
        }

        //if response is 409, 404, 401, 400 => It is waste of trying again
        return _self.createDoc(jsonDoc, db, reTryCount - 1, errMsg);
    });
};

this.getDoc = async function(id, db, errMsg, bDontThrow, param) {
  var response = {};
  param = param ? param : {};
  try {
      let queryResp = await db.get(id, param);
      return queryResp[0];
  } catch (err) {
      if (errMsg && errMsg.indexOf(err.reason) >= 0) {
          //Reason is expected so no problem
      } else if (['missing', 'deleted'].indexOf(err.reason) === -1) {
          console.log(err); //404 Not Found is expected. Other errors are dangerous
      }
      if (errMsg === 'propagate') {
          throw err;
      }

      if (!errMsg) { //Maintaining the old response foramt
          errMsg = 'getDoc error ' + id;
          console.log(errMsg);

          response.msg = errMsg;
          response.err.msg = errMsg;
          response.err.errObj = err;
          return response;
      } else {
          if (bDontThrow) {
              return errMsg;
          } else {
              throw errMsg;
          }
      }
  }
};



}

module.exports = new couchDBMain();