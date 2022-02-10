var express = require('express'); 
var app = express();
var cors = require('cors');
app.use(express.json());
app.use(cors()); 
var randomWords = require('random-words');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var sessionusers = 0;
var randomword = "pizza oven";
var currentRound = 0;
var rightanswers = 0;
var fisrtLog = '';
var secondLog = '';
var thirdLog = '' ;
var fourthLog = '' ;


app.get('/', function(req, res){   
    res.sendFile(__dirname + '/public/index.html');     
});
app.get('/login', function(req, res){   
    res.sendFile(__dirname + '/public/login.html');     
});

io.on('connection', (socket) => {
    socket.on('sendMessage', (msg) => {
        io.sockets.emit('newMessage', msg);  
      });  
    sessionusers ++;
    if(currentRound === 0){
        currentRound = 1;
    newword();
    }
    io.sockets.emit('newword', randomword);
    io.sockets.emit('round', currentRound);
    io.sockets.emit('first', fisrtLog);
    io.sockets.emit('second', secondLog);
    io.sockets.emit('third', thirdLog);
    io.sockets.emit('fourth', fourthLog);
    console.log(sessionusers);
    io.sockets.emit('players', sessionusers);
    if(sessionusers >= 5){
        io.sockets.emit('status', 'start')
    }else{
        io.sockets.emit('status', 'stop');
    }


    socket.on('disconnect', () => {
        sessionusers = sessionusers - 1;
        if(sessionusers >= 5){
            io.sockets.emit('status', 'start');
        }else{
            io.sockets.emit('status', 'stop');
            rightanswers = 0;
            fisrtLog = '';
            secondLog = '';
            thirdLog = '' ;
            fourthLog = '' ;
        }
        io.sockets.emit('players', sessionusers);
        console.log(sessionusers)
      });
       socket.on('newJoin', (user) => {
        var joinfilter = user.replace(/[&\/\\#,+(`)$~%.'":;*?<>{}]/g, '');
        io.sockets.emit('newMessage', joinfilter + " joined the game"); 
      });
      socket.on('winner', (about) => {
          var winnernick = about.nick.replace(/[&\/\\#,+(`)$~%.'":;*?<>{}]/g, '');
       if(rightanswers < 4){   
       rightanswers ++
       console.log(rightanswers)
       if(about.word.toLowerCase() == randomword){
        if(rightanswers == 1){   
            io.sockets.emit('first', winnernick);
            fisrtLog = winnernick
       }
       if(rightanswers == 2){   
        io.sockets.emit('second', winnernick);
        secondLog = winnernick
    }
    if(rightanswers == 3){   
        io.sockets.emit('third', winnernick);
        thirdLog = winnernick;
    }
    if(rightanswers == 4){  
        io.sockets.emit('fourth', winnernick); 
        fourthLog = winnernick;
        setTimeout(setnext, 1500);
    }
       }
    }
      });
      
 
  
  function setnext() {
    if(currentRound < 30){
        currentRound ++;
        io.sockets.emit('roundEnd', 'ended');
        newword();
        }else{
         currentRound = 1;
        io.sockets.emit('roundEnd', 'ended');
         newword();
        }
  }

   });
  function newword(){
    io.sockets.emit('first', '');
    io.sockets.emit('second', '');
    io.sockets.emit('third','');
    io.sockets.emit('fourth', '');   
    rightanswers = 0;  
randomword = randomWords();
io.sockets.emit('newword', randomword);
io.sockets.emit('round', currentRound);
if(sessionusers >= 5){
    io.sockets.emit('status', 'start');
}else{
    io.sockets.emit('status', 'stop');
}
  }


server.listen(process.env.PORT || 5000, () => {
    console.log("Listening Ports")
})
