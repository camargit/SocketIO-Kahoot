
/**
 * StAuth10065: I Matthew Martin, 000338807 certify that this material is my original work. No other person's work has been used without due acknowledgement. 
 * I have not made my work available to anyone else.
 */
// Required packages
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Return the teacher page
app.get('/teacher', function(req, res){
  res.sendFile(__dirname + '/teacher.html');
});

// Return the student page
app.get('/student', function(req, res){
  res.sendFile(__dirname + '/student.html');
});

// Initially correct answer is blank
var correctanswer = "";

// If we have a connection...
io.on('connection', function(socket){

  // If a question is submitted...
  socket.on('submitquestion', function(quesdata){

    // What is the question?  log it in console for debug...
    console.log("question submitted: " + JSON.stringify(quesdata) + " " + quesdata.question + " " + quesdata.questionType);
    // Set the correct answer
    correctanswer = quesdata.answer;
    // Broadcast question to all connections except sender, i.e. except teacher
    socket.broadcast.emit('deliverquestion', {question: quesdata.question, questionType: quesdata.questionType, timeLimit: quesdata.timeLimit});

  });

  // If an answer to the question is received...
  socket.on('answerquestion', function(answerdata) {
    // Send back the result, but only to the client that sent the answer
    io.to(socket.id).emit("resultquestion"
                         ,{correct: (correctanswer == answerdata.answer) 
                         ,answer: correctanswer
                        ,username:answerdata.username}
                         );          
    });
    
  socket.on('dataCollected',function(gameData){

      let totalAnswers = gameData.correctAnswers + gameData.incorrectAnswers;
      let correctAnswers = gameData.correctAnswers;
      let incorrectAnswers = gameData.incorrectAnswers;
      let incorrectUsers = gameData.incorrectUsers;
      let correctUsers = gameData.correctUsers;
      console.log(correctUsers);
      let percentage = (gameData.correctAnswers/totalAnswers)* 100;

      socket.broadcast.emit("deliverData",{totalAnswers:totalAnswers,correctAnswers:correctAnswers,incorrectAnswers:incorrectAnswers,incorrectUsers:incorrectUsers,correctUsers:correctAnswers,percentage:percentage});
  });
});

// Have the server listen...
http.listen(3000, function(){
  console.log('listening on *:3000');
});
