var socket = io.connect('http://localhost');

$(document).ready(function() {
	var card;
	$('div.card').on('click', function(){
		card = $(this).find('img').attr('src');
		$('section.info').html('<img src=""/>');
		$('section.info').find('img').attr('src', card);
		$('section.info').show();
	})
});

socket.on('gotBoard', function(data){
	console.log('got board');
	socket.emit('getData');
});