//Google.js
var request = require('request');
var key = 'key=AIzaSyArvzol2VewcHPeTzjclk6UgN5wNW9KZB8'
var cx = '&cx=003474991555944832998:v-zlfbj1rlc'
var type = '&searchType=image'

module.exports = {
	cerca: function(query){
	request('https://www.googleapis.com/customsearch/v1?'+key+cx+type+'&q='+query, function(error, response, body){
		//parse body
		var risultato = JSON.parse(body);
		risultato = risultato.items[1].link;
		console.log(risultato);
		
	});
	}
};