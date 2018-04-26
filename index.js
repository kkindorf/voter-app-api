const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();
const router = require('./router');
const cors = require('cors');
const mongoose = require('mongoose');
const Poll = require('./models/poll');

//DB setup
//mongoose.connect('mongodb://localhost/new-vote');
mongoose.connect('mongodb://kkindorf:Zooniebin9765@ds259109.mlab.com:59109/voter-app')
//app setup
app.use(cors());
//type: */* tells bodyParser that it will parse any body request using json
app.use(bodyParser.json({type: '*/*'}));
//router(app) allows us to pass app into the file
router(app);
//server setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);

//socket.io setup
const io = require('socket.io')(server);
let rooms = [];
let roomIndex = '';
io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('join room', function(data) {
        let roomId = data;
        if(rooms.indexOf(roomId) === -1) {
            rooms.push(roomId);
        }
        roomIndex = rooms.indexOf(roomId);
        socket.join(roomId);
    })
    socket.on('newChoice', function(data) {
        let pollId = data.pollId;
        let pollTitle = data.pollTitle;
        let pollOptions = data.options;
        if(pollOptions.indexOf(data.newOption) === -1) {
            pollOptions.push(data.newOption);
        }
        Poll.findById(pollId)
            .then((poll) => {
                poll.pollOptions = pollOptions;
                let result = {choice: data.newOption, count: 0};

                //if results are empty
                if(!poll.results.length) {
                    result.count++;
                    poll.results.push(result);
                }
                else {
                    //check for matches
                    let count = 0;
                    for(let i = 0; i < poll.results.length; i++) {
                        if(poll.results[i].choice === result.choice) {
                            poll.results[i].count++;
                        }
                        else {
                            count++;
                        }
                    }
                    //if there are no matches
                    if(poll.results.length === count) {
                        result.count++;
                        poll.results.push(result);
                    }
                }
                poll.save();
                let pollData = poll;
                let showPollForm = false;
                io.sockets.in(rooms[roomIndex]).emit('new poll data', {pollData: pollData, showPollForm: showPollForm});
            })
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
      });
    

});

server.listen(port);
console.log('serving listening on: ', port);

