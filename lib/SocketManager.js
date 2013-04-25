var SocketManager = module.exports = function SocketManager(){};

SocketManager.prototype = {

	sockets: [],

	set: function(socket, data) {
		this.sockets[socket.handshake.sessionID] = data;
	},

	get: function(socket) {
		return this.sockets[socket.handshake.sessionID];
	},

	remove: function(socket) {
		//console.log(this.sockets);
		//console.log(this.sockets.indexOf(socket.handshake.sessionID));
	}

}