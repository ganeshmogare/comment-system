angular.module('rentmojo.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout,$http,$state,$rootScope) {

  $scope.loginData = {};

  
  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $state.go('app.login');
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);
    $http.post('http://localhost:4000/api/login',$scope.loginData).then(function (response) {
    // $http.get('http://localhost:4000/api/github/auth').then(function (response) {
      if(response.data.code=='200'){
        $rootScope.loggedInUser ={
          userId : response.data.userId,
          name : response.data.user,
        }
        $state.go('app.home');
      }
    }).catch(function(e){
      console.log(e);
    });
  };

  $scope.register = function(regData){
    $http.post('http://localhost:4000/api/register',regData).then(function (response) {
      if(response.data.code=='200'){
        $state.go('app.login');
      }
    }).catch(function(e){
      console.log(e);
    });
  }

  $scope.gotoRegister = function(){
    $state.go('app.register');
  }
})

.controller('homeCtrl', function($scope,$http,$rootScope,$state) {
  
  $scope.$on('$ionicView.enter', function () {
    if($rootScope.loggedInUser){
      $scope.loggedInUser = $rootScope.loggedInUser;
    }else{
      $state.go('app.login');
    }
  });

  
  function getAllPosts(){
    $http.get('http://localhost:4000/api/getAllPostData').then(function (response) {
     $scope.allPostData = response.data;
     $scope.allPostData.reverse();
    }).catch(function(e){
      console.log(e);
    });
  }
  getAllPosts();
$scope.postContent= '';
  $scope.writepost = function(post){
//$rootScope.loggedInUser
var payload ={
  content: post,
  userId : $scope.loggedInUser.userId,
  author: $scope.loggedInUser.name,
  content: post
}
$http.post('http://localhost:4000/api/createPost',payload).then(function (response) {
  $scope.postContent= '';
  response.data.comments =[];
  $scope.allPostData.push(response.data);
  $scope.allPostData.reverse();
    }).catch(function(e){
      console.log(e);
    });
  }
$scope.editPostIndex = -1;
  $scope.EditPost = function(index){
    $scope.editPostIndex = index;
  }

  $scope.SavePost = function(post){
    var postJson =post;
    $http.post('http://localhost:4000/api/updatePost',post).then(function (response) {
  $scope.editPostIndex =-1;
    }).catch(function(e){
      console.log(e);
    });
  }

  $scope.commentBoxIndex =-1;
  $scope.showCommentBox = function(index){
    $scope.commentBoxIndex = index;

  }
  $scope.writeComment = function(post,comment){
    var commentJson ={
      parentId: post._id,
      postId: post._id,
      author: $scope.loggedInUser.name,
      userId : $scope.loggedInUser.userId,
      comment: comment
    }

    $http.post('http://localhost:4000/api/addComment',commentJson).then(function (response) {
  post.comments.push(response.data);
  $scope.commentBoxIndex =-1;
    }).catch(function(e){
      console.log(e);
    });
  }

$scope.editCommentId = "";
  $scope.showReplyBox = function(id){
    $scope.editCommentId =id;
  }

  $scope.writeReply = function(post,comment,reply){
    var replyJson = {
      parentId : comment._id,
      postId: post._id,
      comment : reply,
      userId: $scope.loggedInUser.userId,
      author: $scope.loggedInUser.name
    }

    $http.post('http://localhost:4000/api/addComment',replyJson).then(function (response) {
  if(!comment.comments){
    comment.comments =[response.data];
  }else{
    comment.comments.push(response.data);
  }
  $scope.editCommentId =-1;
    }).catch(function(e){
      console.log(e);
    });
  }



});
