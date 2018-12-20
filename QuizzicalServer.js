// Dependencies
var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var https = require('https'); // Secure for retreiving questions
var timers = require('timers');

// get questions from third party website-database
// Reference Link = https://opentdb.com/
var questionGathering = {
  host: 'opentdb.com',
  port: 443,
  path: '/api.php?amount=10&category=18&difficulty=easy&type=multiple',
  method: 'GET'
};

// Question & Player set up
let questionQueue = []; // array of questions
let currentQuestion = {}; // question itself
let questionTime = 10; // 10 seconds per question
let playerId = 0; // playerId starts on 0 but will increment
let otherPlayers = {}; // details of other players

/////////////////////////////////////////////////////////////////////////////
// Boot up public folder
var htmlPath = path.join(__dirname, 'public');
app.use(express.static(htmlPath));

// Fill in the question queue
retreiveQuestion().then((question) => {
  currentQuestion = question; // create a new value for the currentQuestion
});

// Using timers, set up the chaning of quesitons
timers.setInterval(function(){
  retreiveQuestion().then((question) => {
    currentQuestion = question;
    io.emit('question', JSON.stringify(currentQuestion)); // Convert whole object to string
  });
}, questionTime * 1000); // Timer of 30 seconds

/////////////////////////////////////////////////////////////////////////////
// Setting up the websockets
io.on('connection', function(socket){
  // PlayerId increments when joining
  playerId++;
  var playerNumber = playerId;
  var playerName = '';
  console.log("Player - " + playerNumber + " - Connected!");

  // Display currentQuestion to the user who has just joined
  socket.emit('playerInitiation', playerNumber);
  socket.emit('question', JSON.stringify(currentQuestion)); // same as ^^
  socket.emit('otherPlayers', JSON.stringify(otherPlayers)); // List of other current players

  // Set player name upon join the Game
  socket.on('newPlayer', function(newName){
    setPlayerName(newName);
    setPlayerScore(0);
  });

  // Alter players score when answering questions
  socket.on('playerAnswered', function(playerScore){
    var playerObject = JSON.parse(playerScore);
    setPlayerName(playerObject.playerName);
    setPlayerScore(playerObject.playerScore);
    console.log('Score', playerName + ': ' + playerObject.playerScore)
  });

  // Remove players who disconnect (leave the game)
  socket.on('disconnect', function(){
    console.log(playerName + ' has left the game');
    removePlayer();
  });

  // Remove player function
  function removePlayer(){
    delete otherPlayers[playerNumber];
    socket.broadcast.emit('playerDisconnect' + playerName);
  }

  // Should a player not have a name, default it
  function setPlayerName(newName){
    if(!playerName.length){
      console.log('New player = ', playerName);
      playerName = newName;
    }
  }

  // Set the player score to the players
  function setPlayerScore(newScore){
    var newScoreObject = {
      'playerName' : playerName,
      'name' : playerName,
      'score' : newScore
    };
    otherPlayers[playerNumber] = newScoreObject;
    socket.broadcast.emit('playerScored', JSON.stringify(newScoreObject));
  }
});

/////////////////////////////////////////////////////////////////////////////
// index needs to listen to the Server
http.listen(3000, function(){
  console.log('You are now listening on port 3000');
});

/////////////////////////////////////////////////////////////////////////////
// collect questions from third party website
function collectQuestions(){
  // Using an eventual object of promise, eventually retreives the answer
  // regardless whether its completed or failed
  return new Promise((resolve, reject) => {
    console.log('Quizzical : Gathering questions...');

    // Secure request
    https.request(questionGathering, function(res){
      res.setEncoding('utf8');
      res.on('data', function(block){

        // Put quiz questions into the queue
        var quizzicalData = JSON.parse(block);
        quizzicalData.results.forEach(function(question){
          questionQueue.push(question);
        });
        resolve();
      });
    }).end();
  });
}

/////////////////////////////////////////////////////////////////////////////
// retreiveQuestion function to produce questions
function retreiveQuestion() {
  return new Promise((resolve, reject) => {
    console.log('Quzzical : Thinking of question.');
    if (questionQueue.length < 10) {
      collectQuestions().then(() => {
        resolve(questionQueue.shift());
      });
    } else {
      resolve(questionQueue.shift());
    }
  });
}
