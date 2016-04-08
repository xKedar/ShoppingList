//Google.js
var request = require('request');
var key = 'AIzaSyArvzol2VewcHPeTzjclk6UgN5wNW9KZB8'
var cx = '003474991555944832998:v-zlfbj1rlc'

module.exports = {
	cerca: function(query){
	request('https://www.googleapis.com/customsearch/v1?key='+key+'&cx='+cx+'&q='+query, function(error, response, body){
		//parse body
		console.log(body);
	});
	}
};