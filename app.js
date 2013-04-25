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
    sockets.push(socket);

    mongooseSessionStore.get(socket.handshake.sessionID, function(err, data){
        if(err || !data) {
            console.log(err);
            //handle error
        } else {
            manager.set(socket, {boardID: data.boardID});
        }
    });

    socket.on('disconnect', function(data){
        console.log('socket disconnected');
        manager.remove(socket);
    });
});