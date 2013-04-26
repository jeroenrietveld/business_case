var socket = io.connect('http://localhost');

$(document).ready(function() {
	var card;
	$('div.card').on('click', function(){
		card = $(this).find('img').attr('src');
		$('section.info').html('<img src=""/>');
		$('section.info').find('img').attr('src', card);
		$('section.info').show();
	});

	$('div.card').on('click', function(){
			$(this).find('img').attr('src', );
		});
});

socket.on('gotBoard', function(data){
	console.log('got board');
	socket.emit('getData');
});

socket.on('updateCards', function(data){
	console.log('update cards');
	console.log(data['card1']);
	
	for(data as card) {
		
	}
});