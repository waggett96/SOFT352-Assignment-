// Using Vue js
// var socket = false;
var app = new Vue ({
  el: '#app',
  data: {
    playerNumber: 0,
    playerName: '',
    score: 0,
    registered: false,
    otherPlayers: {},
    question: '',
    answered: false,
    answers: ['', '', '', '',],
    questionsAnswers: false,
    playerNameDiv: true,
    instructionsDiv: false,
  },
  methods: {
    // Method for creating player, made up of; number, name and score
    setPlayerName: function(e){
      e.preventDefault();
      console.log(this);
      if (this.playerName.length) {
        this.otherPlayers[this.playerNumber] = {
          playerNumber: this.playerNumber,
          playerName: this.playerName,
          score: this.score,
        };
        socket.emit('newPlayer', this.playerName);
        this.registered = true;
      }
    },

    // Function for answering the question
    pickAnswer: function(answer){
      if (this.answered) {
        // Set answered to being true
        return true;
      }
      this.answered = true;
      answer.selected = true;
      if (answer.correct) {
        this.score++;
        this.otherPlayers[this.playerNumber].score = this.score;
        socket.emit('playerAnswered', JSON.stringify({'playerName': this.playerName, 'score': this.score}));
        console.log('You got another one right!');
      }
    },

    // Remove player from game lobby
    disconnectPlayer: function(){
      window.location.reload();
    },

    // Disable entry button
    checkPlayerName: function() {
      if (document.getElementById('setName').value === "") {
        document.getElementById('entryBtn').disabled = false;
        alert("You must enter a player name to begin");
      } else {
            this.questionsAnswers = true;
            this.playerNameDiv = false;
            this.instructionsDiv = false;
          }
    },

    // View Instructions
    viewInstructions: function() {
      this.questionsAnswers = false;
      this.playerNameDiv = false;
      this.instructionsDiv = true;
    },

    // Rest the quiz game, starting with a new players
    leaveGame: function(){
      alert("Thank you for playing Quizzical :)");
      this.questionsAnswers = false;
      this.playerNameDiv = true;
      this.instructionsDiv = false;
    },

    // Closing instructions div
    closeInstructions: function(){
      this.questionsAnswers = false;
      this.playerNameDiv = true;
      this.instructionsDiv = false;
    }
  },
  created: function(){
    // start the socket
    socket = io();
    var vue = this;

    // get the server to deal with the player list
    socket.on('otherPlayers', function(json){
      vue.otherPlayers = JSON.parse(json);
    });

    // Get our player ID
    socket.on('playerInitiation', function(newplayerNumber){
      vue.playerNumber = newplayerNumber;
    });

    // player scored, update their score
    socket.on('playerScored', function(json){
      var newScoreObject = JSON.parse(json);
      vue.otherPlayers[newScoreObject.playerNumber] = newScoreObject;
    });

    // Disconnect/delete player by removing the playerName
    socket.on('playerDisconnect', function(playerNumber){
      delete vue.otherPlayers[playerNumber];
    });

    // Deal with new questions from Open source database
    socket.on('question', function(json){
      var rawQuestion = JSON.parse(json);
      vue.question = urldecode(rawQuestion.question);
      vue.answers = loadAnswers(rawQuestion.incorrect_answers, rawQuestion.correct_answer);
      vue.answered = false;
    });
  }
});

// Decode the url from third party
function urldecode(url){
  return decodeURIComponent(url.replace(/\+/g, ' '));
}

// Save answers from client
function loadAnswers(incorrect, correct){
  var newAnswers = [];
  // should the client get it wrong, save as incorrect
  incorrect.forEach(function(answer){
    newAnswers.push({
      text: urldecode(answer),
      correct: false,
      selected: false,
    });
  });
  // if answer is correct, save as correct
  newAnswers.push({
    text: urldecode(correct),
    correct: true,
  });
  //  return the score of answers
  return newAnswers.sort(function(a, b){
    if (a.text > b.text) return 1;
    if (a.text < b.text) return -1;
  });
}
