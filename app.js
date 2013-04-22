var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path');

var app = express();

var database     = require('./lib/Database');
var errorHandler = require('./lib/ErrorHandler');
var loginPages   = require('./lib/LoginPages');
var gamePages    = require('./lib/GamePages');
var db           = new database();
var lp           = new loginPages();
var gp           = new gamePages();

// all environments
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

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
    res.render('error/404.jade', {title: "404 - Page Not Found", showFullNav: false, status: 404, url: req.url});
});

console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
app.listen(app.get('port'));