var socket = io.connect('http://localhost');

$(document).ready(function() {
	var card;
	$('div.card').on('click', function(){
		card = $(this).find('img').attr('src');
		$('section.info').html('<img src=""/>');
		$('section.info').find('img').attr('src', card);
		$('section.info').show();
	});
});

socket.on('gotBoard', function(data){
	console.log('got board');
	socket.emit('getData');
});

socket.on('updateCards', function(data){
	for (card in data) {
		var id = data[card];

		switch(id) {
			case '1':
				$('#'+card).attr('src', 'images/cards/blue_eyes.png');
				break;
			case '2':
				$('#'+card).attr('src', 'images/cards/Summoned_Skull.jpg');
				break;
			default:
				$('#'+card).attr('src', 'images/cards/back.png');
				break;
		}
    }
});