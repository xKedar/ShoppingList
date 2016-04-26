var amqp = require('amqplib/callback_api');
var messageTTL = 2000	//milliseconds

module.exports = {
	
	notifica: function(nomeLista){
		amqp.connect('amqp://test:test@localhost', function(err, conn) {
			conn.createChannel(function(err, ch) {
			var q = nomeLista;

			ch.assertQueue(q);
			ch.sendToQueue(q, new Buffer("this shopping list has been modified, refresh to receive the update"), {expiration: messageTTL});
		  });
		});
	}
}	
	