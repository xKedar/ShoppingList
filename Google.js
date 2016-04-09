//Google.js
var request = require('sync-request');
var key = 'key=AIzaSyArvzol2VewcHPeTzjclk6UgN5wNW9KZB8'
var cx = '&cx=003474991555944832998:v-zlfbj1rlc'
var type = '&searchType=image'

module.exports = {
	cerca: function(query){
		var res = request('https://www.googleapis.com/customsearch/v1?'+key+cx+type+'&q='+query);
		//parse body
		var risultato = JSON.parse(res);
		risultato = risultato.items[0].link;
		return risultato;
		
	}
};