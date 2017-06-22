function Player(key) {
  this.key = key,
  this.name = "",
  this.wins = 0,
  this.losses = 0,
  this.ties = 0
}

/* Comments Ideas
Player Queue?
Play against computer -- solo
buttons to choose solo play so others can play
multiple "lobbies" 
*/


var config = {
    apiKey: "AIzaSyBwmsZ9nz0YqhNBvfIITsmd8GSnUsD-Fas",
    authDomain: "rps-multiplayer-85990.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-85990.firebaseio.com",
    projectId: "rps-multiplayer-85990",
    storageBucket: "",
    messagingSenderId: "767292037741"
  };
  firebase.initializeApp(config);

  var database = firebase.database();
  var connectionsRef = database.ref("/connections");
  var connectedRef = database.ref(".info/connected");
  var currentData = {};
  var sessionUser = {}; 
  var pChat = [];
  var queue = [];

connectedRef.on("value", function(snap) {
    if (snap.val()) { 
      var con = connectionsRef.push(true);
      sessionUser = new Player(con.key);
      con.onDisconnect().remove();
      database.ref("users/" + sessionUser.key).onDisconnect().remove();
  }
});

      

connectionsRef.on("value", function(snap) {
  $(".viewers").html(snap.numChildren());
});

//database snapshot when value changes
database.ref().on("value", function(snapshot) {
  currentData = snapshot;
  pChat = snapshot.val().chat;
  if (snapshot.child("playerQueue").exists()) {
    queue = snapshot.val().playerQueue;
  }

  
  playerQueue();
  // if (pChat.length == 0 && !pChat) {
  //   $(".chatDisplay").html("Loading...");
  // } else {
  //   $(".chatDisplay").empty();
  //    $.each(pChat, function(index, value) {
  //     $(".chatDisplay").append(value + "<br>");
  //   })
  // }
  
}, function(errorObject) {
  console.log("ERROR: ", errorObject.val());
}); 

function playerQueue() {
  
  if (queue.indexOf(sessionUser.key) == -1) {
    $.each(currentData.val().playerQueue, function(index, value) {
      if (currentData.val().connections[value] === undefined) {
        queue = queue.splice(queue.indexOf(index), 1);
        }
    })
    queue.push(sessionUser.key);
    database.ref("playerQueue").set(queue);
  
    
  }
  
}

//
function chatUpdate() {
  if (pChat.length > 4) {
    pChat.shift();
    $(".chatDisplay").empty();
  }
  pChat.push($(".chatInput").val());
  database.ref(sessionUser.key + "/chat").push(pChat);
  $(".chatInput").val("");
};

function determineWinner(p1, p2) {

}

function gameplay() {

}


$(document).ready(function() {

  //chat input with enter
  $(".chatInput").on("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13 && $(".chatInput").val().trim() != "") {
      chatUpdate();    
    } else if (event.keyCode == 13 && $(".chatInput").val().trim() == "") {
      $(".chatInput").val("");
    }
  })
})