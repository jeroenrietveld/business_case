var SocketManager = module.exports = function SocketManager(){};

SocketManager.prototype = {

	this.sockets = [];

	set: function(socket, data) {
		this.sockets[socket.sessionID] = data;
	}

	get: function(socket) {
		return this.sockets[socket.sessionID];
	}
	
}