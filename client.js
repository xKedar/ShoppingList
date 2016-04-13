	var ws = new WebSocket('ws://127.0.0.1:15674/ws');
    var client = Stomp.over(ws);
	var on_connect = function() {
        console.log('connected');
		id = client.subscribe("/queue/lista", function(d) {
			   alert(d.body)
        });
		
	};
  
    var on_error =  function() {
        console.log('error');
    };
	
    conn = client.connect('test', 'test', on_connect, on_error, '/');
