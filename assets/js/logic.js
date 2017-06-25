var config = {
    apiKey: "AIzaSyBwmsZ9nz0YqhNBvfIITsmd8GSnUsD-Fas",
    authDomain: "rps-multiplayer-85990.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-85990.firebaseio.com",
    projectId: "rps-multiplayer-85990",
    storageBucket: "",
    messagingSenderId: "767292037741"
  };
  firebase.initializeApp(config);

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

  var database = firebase.database();
  var connectionsRef = database.ref("/connections");
  var connectedRef = database.ref(".info/connected");
  var currentData = {};
  var sessionUser = {};
  var queue = [];
  var playerChat = [];
  var nameDescriptor = ["Damp", "Buttery", "Solid", "Skilled", "Apprentice", "Holy", "Sloppy", "Snotty", "Tired", "Stanky",
                          "Burnt", "Big", "Small", "Average", "Fast", "Slow", "Testy", "Angry", "Weeping", "Tough", "Wimpy", "Meak", "Hungry"];

  var nameNouns = ["Sock", "Goldfish", "Ice Cube", "Pillow", "Cake", "Bread", "Ribbon", "Straw", "Star",
                    "Bum", "Tree", "Bear", "Box", "Table", "Cup", "Cougar", "King", "Princess", "Platypus", "Monkey", "Lamp", "Hat", "Spy", "Bird", "Bean", "Sticker", "Flip-Flop", "Candle"];

connectedRef.on("value", function(snap) {
    if (snap.val()) {
      var con = connectionsRef.push(true);
      sessionUser = new Player(con.key);
      randomName();
      con.onDisconnect().remove();
      database.ref("users/" + sessionUser.key).onDisconnect().remove();
  }
});

connectionsRef.on("value", function(snap) {
  $(".viewers").html("Players in lobby: " + snap.numChildren());
});

//database snapshot when value changes
database.ref().on("value", function(snapshot) {
  currentData = snapshot;
  if (snapshot.child("chat").exists()) {
    playerChat = snapshot.val().chat;
    chatDisplay();
  }
  if (snapshot.child("playerQueue").exists()) {
    queue = snapshot.val().playerQueue;
  }
  playerQueue();
}, function(errorObject) {
  console.log("ERROR: ", errorObject.val());
});

function playerQueue() {
  //check if player is in queue
  if (Array.isArray(queue)) {
    if (queue.indexOf(sessionUser.key) == -1) {
      queue.push(sessionUser.key);
    }
    $.each(currentData.val().playerQueue, function(index, value) {
      if (currentData.val().connections[value] === undefined) {
        queue = queue.splice(queue.indexOf(index), 1);
      }
    })
    database.ref("playerQueue").set(queue);
  } else {
    queue = database.ref("playerQueue").key();
  }
  var currentPos = queue.indexOf(sessionUser.key) + 1;
  if (queue.length == 1) {
    $(".queueDisplay").html("You are all alone...");
  } else {
    $(".queueDisplay").html("Queue position: " + currentPos + " of " + queue.length);
  }
}

function randomName() {
    var rand = Math.floor(Math.random() * nameDescriptor.length);
    var rand2 = Math.floor(Math.random() * nameNouns.length);
    sessionUser.name = nameDescriptor[rand] + " " + nameNouns[rand2];
    $(".nameDisplay").html("Your name is: " + sessionUser.name);
    playerChat.push(moment().format("hh:mm:ss a") + " " + sessionUser.name + " has joined the channel");
    chatDisplay();
}

function chatStarter() {
  if (!Array.isArray(playerChat)) {
    playerChat = [];
  } else {
    chatDisplay();
  }
  chatUpdate();
}

function chatDisplay() {
  $(".chatDisplay").empty();
  $.each(playerChat, function(index, value) {
   $(".chatDisplay").append(value + "<br>");
 })
 $(".chatDisplay").stop().animate({ scrollTop: $(".chatDisplay")[0].scrollHeight}, 400);
}

function nameChange(newName) {
  var temp = sessionUser.name;
  sessionUser.name = newName;
  if (temp == "") {
    playerChat.push(moment().format("hh:mm:ss a") + " " + "SYSTEM: New User: " + sessionUser.name);
  } else {
    playerChat.push(moment().format("hh:mm:ss a") + " " + "SYSTEM: User: " + temp + " has changed their name to: " + sessionUser.name);
  }
  $("#nameInput").val("");
  chatDisplay();
}

function chatUpdate() {
  playerChat.push(sessionUser.name + " (" + moment().format("hh:mm:ss a") + "):<br>" + $(".chatInput").val());
  if (playerChat.length > 20) {
    playerChat.shift();
    chatDisplay();
  }

  database.ref("chat").set(playerChat);
  $(".chatInput").val("");
};

function determineWinner(p1, p2) {

}

function gameplay() {
  // if ()
}


function confirmAction(type) {
  var buttons = "";
  var message;
  //Extra user commands can be added easily with the switch
  switch (type) {
    case "nameChange":
      message = "You may only change your name once, are you sure you want " + $("#nameInput").val().trim() + " as your name?";
      break;
  }
  if (confirm(message)) {
    nameChange($("#nameInput").val().trim());
    $("#nameInput").remove();
    $("#nameChange").remove();
    $(".nameDisplay").html("Your name is: " + sessionUser.name);
  } else {
    $("#nameInput").val("");
  };

  // $("#displayModalMessage").html(message + buttons);
  // $("#displayModal").css("visibility", "visible");
}


$(document).ready(function() {
  $(".chatDisplay").html("Welcome to Rock Central, your local and best Rock Paper Scissors hangout!");
  //chat input with enter
  $(".chatInput").on("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13 && $(".chatInput").val().trim() != "") {
      chatStarter();
    } else if (event.keyCode == 13 && $(".chatInput").val().trim() == "") {
      $(".chatInput").val("")
    }
  })
  $("#chatButton").on("click", function(event) {
    event.preventDefault();
    if ($(".chatInput").val().trim() != "") {
      chatStarter();
    }
  })
  $("#nameInput").on("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13 && $("#nameInput").val().trim() != "") {
      confirmAction("nameChange");
    }
  });
  $("#nameChange").on("click", function(event) {
    event.preventDefault();
    if ($("#nameInput").val().trim() != "") {
      confirmAction("nameChange");
    }
  });
});
