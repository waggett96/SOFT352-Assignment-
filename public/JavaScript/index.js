// Using Vue js
// var socket = false;
var app = new Vue ({
  el: '#app',
  data: {
    otherPlayers: {},
    question: '',
    registered: false,
    playerName: '',
    playerNumber: 0,
    score: 0,
    answers: [
      '', '', '', '',
    ],
    answered: false,
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
    pickAnswer: function(answer){
      if (this.answered) {
        return true;
      }

      this.answered = true;
      answer.selected = true;
      if (answer.correct) {
        this.score++;
        this.otherPlayers[this.playerNumber].score = this.score;
        socket.emit('playerAnswered', JSON.stringify({'playerName': this.playerName, 'playerScore': this.score}));
        console.log('Youre rising the ranks');
      }
    },
    disconnectPlayer: function(){
      this.playerName = '';
      this.score = 0;
    },
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

    // Deal with new questions from third party
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

// Disable entry button
function setNameSuccess() {
  if (document.getElementById('setName').value === ""){
    document.getElementById('entryBtn').disabled = true;
  } else {
    document.getElementById('entryBtn').disabled = false;
  }
}
