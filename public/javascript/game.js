var socket = io.connect('http://localhost');

socket.on('socket', function(data){
	console.log(data);
});