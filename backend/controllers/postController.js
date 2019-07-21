const couchDBMain = require("../libs/couchDBMain");

let commentDB = couchDBMain.getCommentsDB();
let postDB = couchDBMain.getPostsDB();
let maxCommentId = couchDBMain.getMaxCommentId();
let maxPostId = couchDBMain.getMaxPostId();
let postController = function(req,res){
    this.createPost =async function(postData){
     let postId = maxPostId+1;
     maxPostId++;
        let postJson={
         _id: "p_"+postId,
         id: postId,
         author: postData.author,
         userId : postData.userId,
         timestamp :+new Date,
         content: postData.content
     }

     try{
        let resp= await couchDBMain.createDoc(postJson,postDB);
        let post = await couchDBMain.getDoc("p_"+postId,postDB);
        post.date = formatDate(new Date(post.timestamp));
        return post;
     }catch(e){
       throw e;
     }

    }

    this.getAllPosts = async function(){
       var params =  {
            reduce: false,
            include_docs: true
        }
        try{
        let allPosts =await couchDBMain.getView("all_posts_collection","all_active_posts",params,postDB);
        let completePosts =[];
        for(let i=0;i<allPosts.length;i++){
           
           let postJson = allPosts[i].doc;
           postJson.comments= await getCompleteCommentsArray(allPosts[i].id);
           postJson.date= formatDate(new Date(postJson.timestamp));
           completePosts.push(postJson);
        }
        return completePosts;

       }catch(e){
          throw e;
       }
    }
    
   async function fetchAllCommentsRecursively(pId){

   } 
   async function getCompleteCommentsArray(pId){
        let param ={
            startkey : pId,
            endkey : pId+"z",
            reduce: false,
            include_docs: true
         }
         let postComments = await couchDBMain.getView("all_comments_collection","all_active_comments",param,commentDB);
         let comments =[];
         for(let j=0;j<postComments.length;j++){
             postComments[j].doc.comments = await getCompleteCommentsArray(postComments[j].doc._id);
             postComments[j].doc.date= formatDate(new Date(postComments[j].doc.timestamp));
             comments.push(postComments[j].doc);
         }
        return comments
    }

    this.updatePost =async function(postData){
        postData.updateTS = +new Date;
        try{
            let resp = await couchDBMain.createDoc(postData,postDB);
        }catch(e){
            throw e;
        }

    }

    this.deletePost =async function(postId){
        try{
            let post = await couchDBMain.getDoc(postId,postDB);
            post.delete = 1;
            let resp = await couchDBMain.createDoc(post,postDB);
        }catch(e){
            throw e;

        }

    }

    this.addComment =async function(commentData){
        let commentId = maxCommentId+1;
        maxCommentId++;
        let commentJson = {
            _id : commentData.postId+"_C_"+commentId,
            id: commentId,
            parentId : commentData.parentId,
            comment: commentData.comment,
            author: commentData.author,
            userId : commentData.userId,
            timestamp: +new Date
        }
        try{
            let resp = await couchDBMain.createDoc(commentJson,commentDB);
            let comment = await couchDBMain.getDoc(commentJson._id,commentDB);
            comment.date = formatDate(new Date(comment.timestamp));
            return comment;
        }catch(e){
            throw e;
        }
    }

    function formatDate(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
      }

    this.deleteComment =async function(id){
        try{
            let commentDoc = await couchDBMain.getDoc(id,commentDB);
            commentDoc.delete = 1;
            let resp = await couchDBMain.createDoc(commentDoc,commentDB);
        }catch(e){
            throw e;
        }

    }

    this.updateComment =async function(commentData){
        commentData.updateTS = +new Date;
        try{
            let resp = await couchDBMain.createDoc(commentData,commentDB);
        }catch(e){
            throw e;
        }

    }

    this.addReply =async function(ReplyData){

      try{
         let comment = await couchDBMain.getDoc(ReplyData.commentId,commentDB);
         let replyJson ={
            author: ReplyData.author,
            userId : ReplyData.userId,
            content: ReplyData.content,
            timestamp: +new Date
         }
         comment.replies.push(replyJson);
          let resp = await couchDBMain.createDoc(comment,commentDB);
      }catch(e){
          throw e;
      }

  }

};

module.exports = new postController();