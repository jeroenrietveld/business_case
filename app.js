var express = require('express'),
    http    = require('http'),
    path    = require('path');

var app = express();

var SessionStore = require("session-mongoose")(express);
var database     = require('./lib/Database');
var errorHandler = require('./lib/ErrorHandler');
var loginPages   = require('./lib/LoginPages');
var gamePages    = require('./lib/GamePages');
var db           = new database();
var lp           = new loginPages();
var gp           = new gamePages();
var sockets      = [];
var arduinos     = [];
    
var mongooseSessionStore = new SessionStore({
    url: "mongodb://localhost/business_case",
    interval: 1200000
});

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    
    app.use(express.session( {cookie: {maxAge: 1200000}, store: mongooseSessionStore, secret: "secret" }));
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
    app.set('port', process.env.PORT || 3000);
    app.use(errorHandler({ 
        showMessage: true, 
        dumpExceptions: true, 
        showStack: true, 
        logErrors: __dirname + '/log/error_log'
    }));
});

app.configure('production', function(){
    app.set('port', process.env.PORT || 80);
    app.use(errorHandler());
});

db.connect('mongodb://localhost/business_case');
lp.initPages(app, db);
gp.initPages(app);

app.use(function(req, res, next){
    res.render('error/error.jade', {title: "404 - Page Not Found", showFullNav: false, status: 404, url: req.url});
});

var server      = http.createServer(app);

server.listen(app.get('port'), function(){
    console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

var io            = require('socket.io').listen(server);
var net           = require('net');
var connect       = require('connect');
var cookie        = require('cookie');
var socketManager = require('./lib/SocketManager');
var manager       = new socketManager();

io.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
        data.cookie = connect.utils.parseSignedCookies(cookie.parse(decodeURIComponent(data.headers.cookie)),'secret');

        data.sessionID = data.cookie['connect.sid'];
    } else {
        return accept('No cookie transmitted.', false);
    }

    accept(null, true);
});

io.sockets.on('connection', function(socket){
    console.log('A socket with sessionID ' + socket.handshake.sessionID + ' connected!');
    sockets[socket.handshake.sessionID] = socket;

    mongooseSessionStore.get(socket.handshake.sessionID, function(err, data){
        if(err || !data) {
            console.log(err);
            //handle error
        } else {
            manager.set(data.boardID, {client: socket});
            manager.setSession(socket.handshake.sessionID, { boardID: data.boardID });
        }
    });

    socket.on('getData', function(data){
        var board = manager.boardIDFromSession(socket.handshake.sessionID);
        if(board) {
            console.log('writing');
            manager.get(board.boardID).board.write('SCGDEC');
        }
    });

    socket.on('disconnect', function(data){
        console.log('socket disconnected');
        manager.remove(socket);
    });
});

var arduino_server = net.createServer();

arduino_server.on('connection', function(socket){
    socket.write('SCLIEC');
    
    socket.on('data',function(data){
        console.log('received data: ' + data);

        data = data.toString();

        if(data.substr(0, 2) == 'LU') {
            var boardID = data.substr(2, 4);
            var password = data.substr(6, 4);

            var mBoard = manager.get(boardID);
            if(mBoard) {
                console.log(mBoard);
                //set board client and board
                manager.set(boardID, {client: mBoard.client, board: socket});
                manager.setSession(socket.sessionID, {board: boardID})
                //tell client a board was found
                manager.get(boardID).client.emit('gotBoard');
            } else {
                //no user logged in, handle
                console.log('no user');   
            }
        } else if(data.substr(0, 2) == 'GD') {
            var boardID = data.substr(2, 4);
            manager.get(boardID).client.emit('updateCards');
        }
    });
});

console.log('tcp server listening on port 1337');
arduino_server.listen(1337);