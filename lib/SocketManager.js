var SocketManager = module.exports = function SocketManager(){};

SocketManager.prototype = {

	sockets: [],
	boards:  [],

	set: function(boardID, data) {
		this.sockets[boardID] = data;
	},

	setSession: function(sessionID, boardID) {
		this.boards[sessionID] = boardID;
	},

	get: function(boardID) {
		return this.sockets[boardID];
	},

	remove: function(socket) {
		//console.log(this.sockets);
		//console.log(this.sockets.indexOf(socket.handshake.sessionID));
	},

	boardIDFromSession: function(sessionID) {
		return this.boards[sessionID];
	}

}