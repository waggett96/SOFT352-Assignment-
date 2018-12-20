// make connection
// front end socket variable
// var socket = io.connect('http://localhost:3000/');
var socket = false;
// Using Vue js
var app = new Vue ({
  el: '#app',
  data: {
    currentPlayers: {},
    question: '',
    registered: false,
    playerName: '',
    playerId: 0,
    score: 0,
    answers: [
      '', '', '', ''
    ],
    answered: false,
  },
  methods: {
    // Method for creating player, made up of; number, name and score
    setPlayerName: function(e){
      e.preventDefault();
      if (this.playerName.length) {
        this.currentPlayers[this.playerId] = {
          playerId: this.playerId,
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
        this.currentPlayers[this.playerId].score = this.score;
        socket.emit('playerAnswered', JSON.stringify({'playerName': this.playerName, 'score': this.score}));
        console.log('Youre rising the ranks');
      }
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
    socket.on('playerInitiation', function(newPlayerId){
      vue.playerId = newPlayerId;
    });

    // player scored, update their score
    socket.on('playerScored', function(json){
      var newScoreObject = JSON.parse(json);
      vue.otherPlayers[newScoreObject.playerId] = newScoreObject;
    });

    socket.on('playerDisconnect', function(playerName){
      delete vue.otherPlayers[playerName];
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

// Decode the urlencodes
function urldecode(url){
  return decodeURIComponent(url.replace(/\+/g, ' '));
}

function loadAnswers(incorrect, correct){
  var newAnswers = [];

  incorrect.forEach(function(answer){
    newAnswers.push({
      text: urldecode(answer),
      correct: false,
      selected: false,
    });
  });

  newAnswers.push({
    text: urldecode(correct),
    correct: true,
  });

  return newAnswers.sort(function(a, b){
    if (a.text > b.text) return 1;
    if (a.text < b.text) return -1;
  });
}
