var amqp = require('amqplib/callback_api');

module.exports = {
	
	notifica: function(nomeLista){
		amqp.connect('amqp://test:test@localhost', function(err, conn) {
			console.log(err)
			conn.createChannel(function(err, ch) {
			var q = nomeLista;

			ch.assertQueue(q, {durable: true});
			ch.sendToQueue(q, new Buffer("this shopping list has been modified, refresh to receive the update"));
			console.log(" [x] Sent msg");
		  });
		});
	}
}	
	