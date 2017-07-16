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
  this.ties = 0,
  this.pos;
}

/*
//TODO:
Player Queue? DONE
Play against computer -- solo
buttons to choose solo play so others can play
multiple "lobbies"
*/

  var database = firebase.database();
  var connectionsRef = database.ref("/connections");
  var connectedRef = database.ref(".info/connected");
  var initialConnect = true;
  var currentData = {};
  var sessionUser = {};
  var queue = [];
  var playerChat = [];
  var myGuess;
  var theirGuess;
  var testing = true;
  var otherPlayer = {};
  var leaveMessage;
  var nameDescriptor = ["Athletic", "Combustible", "Damp", "Buttery", "Solid", "Skilled", "Apprentice", "Holy", "Sloppy", "Snotty", "Tired", "Stanky",
                          "Burnt", "Big", "Small", "Average", "Fast", "Slow", "Testy", "Angry", "Weeping", "Tough", "Wimpy", "Meak", "Hungry"];

  var nameNouns = ["Sock", "Goldfish", "Ice Cube", "Pillow", "Cake", "Bread", "Ribbon", "Straw", "Star",
                    "Bum", "Tree", "Bear", "Box", "Table", "Cup", "Cougar", "King", "Princess", "Platypus", "Monkey", "Lamp", "Hat", "Spy", "Bird", "Bean", "Sticker", "Flip-Flop", "Candle"];

connectedRef.on("value", function(snap) {
    if (snap.val()) {
      var con = connectionsRef.push(true);
      sessionUser = new Player(con.key);
      randomName();
      con.onDisconnect().remove();
      database.ref("combatants/" + sessionUser.key).onDisconnect().remove();
      database.ref("users/" + sessionUser.key).onDisconnect().remove();
      var ref = database.ref("chat");
  } else {
    playerLeft();
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
    (initialConnect == true ? playerChat.push(`${moment().format("hh:mm:ss a")} SYSTEM: User: ${sessionUser.name} has joined the room.`) : null);
    initialConnect = false;
    database.ref("chat").set(playerChat);
    chatDisplay();
  }
  if (snapshot.child("playerQueues").exists()) {
    queue = snapshot.val().playerQueue;
  }
  playerQueue(snapshot);
  scoreDisplay(currentData);
}, function(errorObject) {
  console.log("ERROR: ", errorObject.val());
});

function playerLeft() {
  //Doesn't fire properly when user leaves game.
  // playerChat.push(`${moment().format("hh:mm:ss a")} SYSTEM: User: ${sessionUser.name} has left the room.`);
  // database.ref("chat").set(playerChat);
  // chatDisplay();
}

function playerQueue() {
  queue = [];
  $.each(currentData.val().connections, function(index, value) {
    queue.push(index);
  })
  database.ref("playersQueues").set(queue);

  var currentPos = queue.indexOf(sessionUser.key) + 1;
  sessionUser.pos = currentPos;
  if (queue.length == 1) {
    $(".queueDisplay").html("You are all alone...");
  } else if (currentPos == 1 || currentPos == 2) {
    $(".queueDisplay").html("Currently Playing!");
  } else {
    $(".queueDisplay").html("Queue position: " + currentPos + " of " + queue.length);
  }
  gameEngine();
}

function randomName() {
    var rand = Math.floor(Math.random() * nameDescriptor.length);
    var rand2 = Math.floor(Math.random() * nameNouns.length);
    sessionUser.name = `${nameDescriptor[rand]} ${nameNouns[rand2]}`;
    $(".nameDisplay").html("Your name is: " + sessionUser.name);
    document.title = `${sessionUser.name} playing Rock Paper Scissors`
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
  playerChat.push(moment().format("hh:mm:ss a") + " " + "SYSTEM: User: " + temp + " has changed their name to: " + sessionUser.name);
  database.ref("chat").set(playerChat);
  $("#nameInput").val("");
  document.title = `${sessionUser.name} playing Rock Paper Scissors`
  chatDisplay();
  database.ref(`combatants/${sessionUser.key}`).set({
    name: sessionUser.name
  });
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

function buildScoreTable(player, user) {
  if (player) {
    var $newDiv = $("<div>");
    $newDiv.append(user.name + "<br>");
    $newDiv.append("Wins: " + user.wins + "<br>");
    $newDiv.append("Losses: " + user.losses + "<br>");
    $newDiv.append("Ties: " + user.ties);
    return $newDiv;
  } else {
  var $newDiv = $("<div>");
  $newDiv.append(user.name + "<br>");
  $newDiv.append("Wins: " + user.wins + "<br>");
  $newDiv.append("Losses: " + user.losses + "<br>");
  $newDiv.append("Ties: " + user.ties);
  return $newDiv;
  }
}

function scoreDisplay(current) {
  if (sessionUser.pos == 1) {
    var playerOne = {};
    playerOne[sessionUser.key] = sessionUser;
    database.ref("combatants").update(playerOne);
  } else if (sessionUser.pos == 2) {
    var playerTwo = {};
    playerTwo[sessionUser.key] = sessionUser;
    database.ref("combatants").update(playerTwo);
  } else {
    // TODO: table updates for non playing users as well as display "combat"
  }
}

    database.ref("combatants").on("value", function(snapshot) {
      $.each(snapshot.val(), function(index, value) {
        console.log(value.pos, value.name, 'player position');
        if (value.pos == 1) {
          $(".firstPlayer").html(buildScoreTable(true, value));
          // $(".secondPlayer").html(buildScoreTable(false, value));
        } else if (value.pos == 2)
          $(".secondPlayer").html(buildScoreTable(true, value));
          // $(".firstPlayer").html(buildScoreTable(false, value));
        })
      })

function drawField() {
  $(".gameplay").html("Choose wisely your opponent looks pretty tough.<br>")
$(".gameplay").append("<div class='btn btn-default guess' id='0'>Rock</div><div class='btn btn-default guess' id='1'>Paper</div><div class='btn btn-default guess' id='2'>Scissors</div>")

}

function gameEngine() {
  if (sessionUser.pos == 1 || sessionUser.pos == 2) {
    drawField();
    startMatch(true);
  } else {
    startMatch(false);
  }
}

function startMatch(playing) {
  if (!playing) {
    $(".gameplay").html("<p>Waiting on player choices!</p>");
  } else {
    database.ref("currentPlayers").once("value", function(snapshot) {
      database.ref("currentPlayers/" + sessionUser.key).onDisconnect().remove();
      if (snapshot.numChildren() == 2) {
        $.each(snapshot.val(), function(index, value) {
          if (index != sessionUser.key && testing) {
            theirGuess = value;
          }
        })
        myGuess = sessionUser.guess;
        determineWinner(myGuess, theirGuess, testing);
      }
    })
  }
}

function determineWinner(mine, theirs, testing) {
  if (testing && mine != null) {
    if (mine === theirs) {
      mine = null
      database.ref("currentPlayers/" + sessionUser.key).remove();
      ++sessionUser.ties;
      database.ref("combatants/" + sessionUser.key).set(sessionUser.ties);
    } else if ((mine - theirs + 3) % 3 == 1) {
      mine = null
      database.ref("currentPlayers/" + sessionUser.key).remove();
      ++sessionUser.wins;
      database.ref("combatants/" + sessionUser.key).set(sessionUser.wins);
    } else {
      mine = null
      database.ref("currentPlayers/" + sessionUser.key).remove();
      ++sessionUser.losses;
      database.ref("combatants/" + sessionUser.key).set(sessionUser.losses);
    }
  }
  testing = false;
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

  $(".gameplay").on("click", ".guess", function(event) {
    sessionUser.guess = $(this).attr("id");
    var localPlayer = {};
    localPlayer[sessionUser.key] = sessionUser.guess;
    database.ref("currentPlayers").update(localPlayer);
  })
});
