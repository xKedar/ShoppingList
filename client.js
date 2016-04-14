var nomelista = "";
var ws = new WebSocket('ws://127.0.0.1:15674/ws');
var client = Stomp.over(ws);

var on_connect = function() {
    console.log(nomelista);
	id = client.subscribe("/queue/"+nomelista, function(d) {
		console.log("subscribed to "+nomelista)
		alert(d.body)
    });
		
}

var on_error =  function() {
    console.log('error');
};
	
client.connect('test', 'test', on_connect, on_error, '/');    
