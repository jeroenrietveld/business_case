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

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    
    var mongooseSessionStore = new SessionStore({
        url: "mongodb://localhost/mv",
        interval: 1200000
    });
    
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

var server = http.createServer(app);
var io =     require('socket.io').listen(server);

server.listen(app.get('port'), function(){
    console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});

io.sockets.on('connection', function(socket){
    console.log('socket connected.');
});