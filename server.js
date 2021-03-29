var express= require ('express');

var app = express();

let server = require("http").createServer(app);
// build a own server to allow accessing the Socket.io library
//create script in html to access this library
let io = require("socket.io")(server);
let port = process.env.PORT || 3000;
server.listen(port);
app.use(express.static('public'));

console.log("my socket server is running");

io.sockets.on('connection', newConnection);
function newConnection(socket){
    console.log("new connection: " + socket.id);

    socket.on('pulse', pulseMsg);

    function pulseMsg(data){
        // console.log("receiving:" + data);
        socket.broadcast.emit('pulse', data);
        socket.emit('pulse', data);
        //send globally
        // socket.emit('pulse', data.clientSignal);
    }
}
