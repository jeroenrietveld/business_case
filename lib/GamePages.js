var GamePages = module.exports = function GamePages(){};

GamePages.prototype = {
	initPages: function(app) {
		var self = this;

		app.get('/game', function(req, res) { self.gameIndex(req, res); });
	},

	_checklogin: function(req, res){
		if(req.session && req.session.loggedIn === true) {
			return true;
		}

		res.redirect('/login');
		return false;
	},

	gameIndex: function(req, res){
		if(!this._checklogin(req, res)) return;

		res.render('game/index', {
			title: 'Index',
			showFullNav: false
		});
	}
}