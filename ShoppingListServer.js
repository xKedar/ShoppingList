// npm install express
var express = require('express');
var app = express();
var fs=require("fs");
var express = require('express');
var exphbs  = require('express-handlebars');
var request = require("request");
var qs = require("querystring");
var google = require('./Google.js'); //ricerca custom su google ha bisogno di npm install sync-request
//variabili 
var notifica = require('./notifica.js');
var client = fs.readFileSync('client.js',"utf8");
var stomp = fs.readFileSync('stomp.js',"utf8");
var home=fs.readFileSync('home.html',"utf8");
var choose_list=fs.readFileSync('choose_list.html',"utf8");
var nuova_lista=fs.readFileSync('nuova_lista.html',"utf8");
var aggiornare_lista=fs.readFileSync('aggiornare_lista.html',"utf8");
var register=fs.readFileSync('register.html',"utf8");
var back=fs.readFileSync('./back.jpg');
var image=fs.readFileSync('./image1.jpg');
var logo=fs.readFileSync('./logo.png');
//Ne ho bisogno per poter utilizzare handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
// richiede l' istallazione di body-parser (npm install body-parser)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//mongoose for interaction with mongodb (npm install mongoose)
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/testing');
require("./PersonSchema.js");
var PersonModel = mongoose.model("Person");
require("./ListSchema.js");
var ListModel = mongoose.model("List");
//HOMEPAGE
app.get('/', function(req, res){
    res.send(home);
    });
//immagini
app.get('/back.jpg', function(req, res){
    res.writeHead(200, {'Content-Type': 'image/jpg' });
    res.end(back, 'binary');
    });
app.get('/image1.jpg', function(req, res){
   res.writeHead(200, {'Content-Type': 'image/jpg' });
     res.end(image, 'binary');
    });
app.get('/logo.png', function(req, res){
     res.writeHead(200, {'Content-Type': 'image/png' });
     res.end(logo, 'binary');
    });
//funzione per cambio pagina html da home a pagina registrazione
app.get('/openregister', function(req, res){
    res.send(register);
    });

//FUNZIONE CHE APRE LA LISTA SENZA STAMPA (PER UPDATE)
app.post('/update_list', function(req,res){
    ListModel.count({"ListId": req.body.ListId}, function(err, nume){
        if (nume<=0) res.send('List name do not exist');
        else{
            res.send(aggiornare_lista);
        }
    });
});

app.post('/list', function(req,res){
    ListModel.find({"ListId":req.body.ListId}, function(err,output){
        if(output.lenght<=0) res.send('This list doesn\'t exist.');
            else{
            output = output.toString().match(/Product: \'.+\'/ig);
            var stringa="<html> <head> <script src=\"/stomp.js\"></script> \
    <script src=\"/client.js/"+req.body.ListId+"\"></script></head><body> <p align=\"center\"> <font size=\"48\">"+req.body.ListId+"</font> </p><ul>";
            for (var j=0; j<output.length; j++){
                var oggetto = output[j].replace(/Product: '/,"");
                oggetto = oggetto.replace(/'/,"");
                var result = "http://www.sognipedia.it/wp-content/uploads/2015/04/farfalla.jpg"//google.cerca(oggetto);
                stringa+="<li>"+ oggetto + "      "+  "<img src=\""+ result + "\"> <br>"
            }
            stringa+=" </ul></body> </html>"
            res.send(stringa);
        }
    });
});

//TO DO: controllare che non esista una lista con lo stesso identificativo di quella che stiamo per creare
app.post('/newlist', function(req, res) {
    ListModel.count({"ListId": req.body.ListId}, function(err, nume){
        if (nume>0) res.send('List name already taken');
        else{
            var newList = new ListModel();
            newList.ListId = req.body.ListId;
            newList.save(function(err){console.log(err);});
            res.send(nuova_lista);
        }
    });
});

app.post('/removelist', function(req, res) {
    ListModel.count({"ListId": req.body.ListId}, function(err, nume){
        if (nume<=0) res.send('List name do not exist');
        else{
            ListModel.remove({"ListId":req.body.ListId}, function(err,res1){
                res.send(choose_list);
            });
        }
    });
});


//TO DO: controllare che l' item non sia già nella lista, se c'è aggiornare la quantità
app.post('/additem', function(req, res) {
    ListModel.count({"ListId": req.body.ListId}, function(err, nume){
        if (nume<=0) res.send('List name do not exist');
        else{                
            var tObj = {Product: req.body.Product, Amount: req.body.Amount, Price: req.body.Price };
            ListModel.update({"ListId":req.body.ListId},{ "$push": {"entry": tObj} }, function(err,res1){
            if(err){console.log(err);}
                notifica.notifica(req.body.ListId);
                res.send(choose_list);
                });
            }
    });
});

app.post('/removeitem', function(req, res) {
    ListModel.count({"ListId": req.body.ListId}, function(err, nume){
        if (nume<=0) res.send('List name do not exist');
        else{                
            var tObj = {Product: req.body.Product, Amount: req.body.Amount};
            ListModel.update({"ListId":req.body.ListId},{ "$pull": {"entry": tObj} }, function(err,res1){
                if(err){console.log(err);}
                    notifica.notifica(req.body.ListId);
                    res.send(choose_list);
            });
        }
    });
});

app.get('/client.js/:param1', function(req,res){
	var nomelista = req.params.param1
	var risposta = client.toString()
	risposta = risposta.replace(/var nomelista = ".*";/,"var nomelista = \"" + nomelista +"\"")
	res.send(risposta);
});

app.get('/stomp.js', function(req,res){
	res.send(stomp);
});

// twitter
//Token preso al seguente indirizzo
var requestTokenUrl = "https://api.twitter.com/oauth/request_token";



//Chiavi di default dell'app che offre il servizio

//Queste sono le mie:
var CONSUMER_KEY = "1aLqWdOVQZqzAvdjnIlNsu9Ka";
var CONSUMER_SECRET = "7gtgAd8oUt9wSF9GYiYvjRZinBRGh0i4sTVSGXsiJf8Uw3gKLx";

// Inizzializzo un oggetto oauth
var oauth = {
	callback : "http://localhost:3000/autenticato",
  
  consumer_key  : CONSUMER_KEY,
  consumer_secret : CONSUMER_SECRET
}
var oauthToken = "";
var oauthTokenSecret = "";
app.get('/twitter', function (req, res) {
  
  	request.post({url : requestTokenUrl, oauth : oauth}, function (e, r, body){

    
    var reqData = qs.parse(body);
    oauthToken = reqData.oauth_token;
    oauthTokenSecret = reqData.oauth_token_secret;

    //-----------------------
    
	var uri = 'https://api.twitter.com/oauth/authorize'
    
    + '?' + qs.stringify({oauth_token: oauthToken})
	console.log(uri);
    res.render('home', {url : uri});
  });

});

var oauth_aut = {
	token : '',
	token_secret : '',
	verifier : ''
}


app.get("/autenticato", function(req, res){
  var authReqData = req.query;
  oauth_aut.token = authReqData.oauth_token;
  oauth_aut.token_secret = oauthTokenSecret;
  oauth_aut.verifier = authReqData.oauth_verifier;


  var accessTokenUrl = "https://api.twitter.com/oauth/access_token";
  // Quì posto il messaggio su Twitter dopo aver ottenuto l'autorizzazione....ovviamente il messaggio l'ho elaborato prima attraverso una form...
  request.post({url : accessTokenUrl , oauth : oauth_aut}, function(e, r, body){
    var authenticatedData = qs.parse(body);
    console.log(authenticatedData);


	
var sss="Go to shopping";
var url = 'https://api.twitter.com/1.1/statuses/update.json?status='+sss;

    var params = {
      consumer_key : CONSUMER_KEY,
      consumer_secret : CONSUMER_SECRET,
      token: authenticatedData.oauth_token,
      token_secret : authenticatedData.oauth_token_secret

};


    request.post({url:url, oauth:params}, function(error, response, body) {

        if (error) 
        {
          console.log("Error occured->: "+ error);
		  res.send("errore");
        } 
        else 
        {
            body = JSON.parse(body);
            console.log(body);
            res.send(choose_list);
        }

   });


  });


});

app.listen(3000);