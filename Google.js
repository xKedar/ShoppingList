//Google.js
var request = require('sync-request');
var key = 'key=AIzaSyArvzol2VewcHPeTzjclk6UgN5wNW9KZB8'
var cx = '&cx=003474991555944832998:v-zlfbj1rlc'
var type = '&searchType=image'
var size = '&imgSize=small'
var num = '&num=1'
var safe = '&safe=high'
var host = '&googlehost=google.it'
var cache = []
var TTL = 24 * 60 * 60 * 1000 //milliseconds
/*element = {
	name: "pasta",
	url: "www.example.com"
	timestamp: "12:00 asdd"
}*/

module.exports = {
	cerca: function(query){	
		var time_threshold = Date.now() - TTL
		var url;
		cache.forEach(function (item, index, array){
			if ((item.name == query) && (item.timestamp > time_threshold)){
				url = item.url
			}
		});
		var res;
		if (!url)
		{
			res = request('GET','https://www.googleapis.com/customsearch/v1?'+key+cx+host+type+size+num+safe+'&q='+query);		
			var risultato = JSON.parse(res.getBody());
			url = risultato.items[0].link;
			cache.push({name: query, url: url, timestamp: Date.now()})
		}
		return url;		
	}
};