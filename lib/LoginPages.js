var crypto = require('crypto');

function hashString(value) {
	hash = crypto.createHash('sha1');
	hash.update(value);
	return hash.digest('hex');
}

var LoginPages = module.exports = function LoginPages(){};

LoginPages.prototype = {
	db: null,

	initPages: function(app, db) {
		this.db = db;
		var self = this;

		app.get('/Login', function(req, res) { self.pageLogin(req, res); });
		app.post('/Login', function(req, res) { self.pageLoginPost(req, res); });
		app.get('/Logout', function(req, res) { self.pageLogout(req, res); });

		app.get('/Game', function(req, res) { self.pageIndex(req, res) });
	},

	_checklogin: function(req, res){
		if(req.session && req.session.loggedIn === true) {
			return true;
		}

		res.redirect('/Login');
		return false;
	},

	pageLogin: function(req, res){
		res.render('login/login', {
			title: 'Login',
			showFullNav: false
		});
	},

	pageLoginPost: function(req, res){
		if(req.body && req.body.password && req.body.email && req.session) {
			var adminuser = this.db.model('user');

			adminuser.findOne({
				boardID:  req.body.email,
				password: hashString(req.body.password)
			}, function(err, row){
				if(err) {
					res.render('login/login', {
						title: 'Login',
						showFullNav: false,
						error_text: err
					});
				} else {
					if(row) {
						req.session.loggedIn = true;
						res.redirect('/Game');
					} else {
						res.render('login/login', {
							title: 'Login',
							showFullNav: false,
							error_text: 'User not found',
							email: req.body.email
						});
					}
				}
			});
		} else {
			res.render('login/login', {
				title: 'Login',
				showFullNav: false,
				error_text: 'Error processing login'
			});
		}
	},

	pageIndex: function(req, res){
		if(!this._checklogin(req, res)) return;

		res.render('game/index', {
			title: 'Index',
			showFullNav: false
		});
	},

	pageLogout: function(req, res){
		delete req.session.loggedIn;
		res.redirect('/Login')
	}
}