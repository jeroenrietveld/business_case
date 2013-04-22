var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var Database = module.exports = function Database(){};

Database.prototype = {
	_collections: {
		user: {
			boardID  : String,
			password : String
		}
	},
	_db: null,
	_schema: {},
	_model: {},

	connect: function(url) {
		mongoose.connect(url);

		this._schema.user = new Schema(this._collections.user);
		this._model.user  = mongoose.model('user', this._schema.user);
	},
	model: function(mod) {
		switch(mod) {
			case 'user':
				return this._model.user;
		}
	}
};