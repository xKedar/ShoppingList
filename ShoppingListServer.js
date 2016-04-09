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
//FIXATO: Sistemare controllo per username already taken. 
app.post('/register', function(req,res){
    PersonModel.count({"id": req.body.Id}, function(err, num){
        if (num>0) res.send('Username already taken');
        else{
            var newPerson = new PersonModel();
            newPerson.id = req.body.Id;
            newPerson.Password = req.body.Password;
            newPerson.save(function(err){console.log(err);});
            res.send(home);
        }
    });
});

//Restituisce la lista di tutti gli utenti del servizio. SERVE A ME PER IL DEBUG
app.get('/account/', function(req,res){
    PersonModel.find({}, function(err,output){
       res.send(output);
       });
});

//FIXATO: sistemare query wrong id or password (stessa soluzione della registrazione)
//ORA FA UNA QUERY IN MENO
app.post('/login', function(req,res){
    PersonModel.find({"id": req.body.Id, "Password": req.body.Password}, function(err, num){
        if (num.length<=0) res.send('Wrong Id or Password');
        else{
            res.send(choose_list);
        }
    });
});

//FUNZIONE CHE APRE LA LISTA SENZA STAMPA (PER UPDATE)
app.post('/update_list', function(req,res){
    ListModel.count({"ListId": req.body.ListId}, function(err, nume){
        if (nume<=0) res.send('List name not exist');
        else{
            PersonModel.find({"id": req.body.Id, "Password": req.body.Password}, function(err, num){
                if (num.length<=0) res.send('This resource is not avaible for you.');
                else{
                    res.send(aggiornare_lista);
                }
            });
        }
    });
});
//CAMBIATA DA GET A POST PER PASSAGGIO DATI LOGIN 
app.post('/list', function(req,res){
    PersonModel.find({"id": req.body.Id, "Password": req.body.Password}, function(err, num){
        if (num.length<=0) res.send('This resource is not avaible for you.');
        else{
            for(var i=0; i< num[0].Accessible.length; i++){
                if(num[0].Accessible[i]==req.body.ListId){
                    ListModel.find({"ListId":req.body.ListId}, function(err,output){
					var result = google.cerca('albero')
                    res.send(output + result);
                    });
                }
                else{
                    if(i==num[0].Accessible.length-1) res.send('This resource is not avaible for you.');
                }
            }
        }
    });
});

//TO DO: controllare che non esista una lista con lo stesso identificativo di quella che stiamo per creare
app.post('/newlist', function(req, res) {
    ListModel.count({"ListId": req.body.ListId}, function(err, nume){
        if (nume>0) res.send('List name already taken');
        else{
            PersonModel.find({"id": req.body.Id, "Password": req.body.Password}, function(err, num){
                if (num.length<=0) res.send('This resource is not avaible for you.');
                else{
                    var newList = new ListModel();
                    newList.ListId = req.body.ListId;
                    newList.save(function(err){console.log(err);});
                    PersonModel.update({"id":req.body.Id},{ "$push": {"Accessible": req.body.ListId} }, function(err,res1){
                        res.send(nuova_lista);
                    });
                }
            });
        }
    });
});

app.post('/removelist', function(req, res) {
    PersonModel.find({"id": req.body.Id, "Password": req.body.Password}, function(err, num){
        if (num.length<=0) res.send('This resource is not avaible for you.');
        else{
            if(num[0].Accessible.length ==0) res.send('This resource is not avaible for you.');
            for(var i=0; i< num[0].Accessible.length; i++){
                if(num[0].Accessible[i]==req.body.ListId){
                    console.log('if');
                    ListModel.remove({"ListId":req.body.ListId}, function(err,res1){
                        PersonModel.update({"id":req.body.Id},{ "$pull": {"Accessible": req.body.ListId} }, function(err,res2){
                            res.send(choose_list);
                        });
                    });
                }
                else{
                    console.log('else');
                    if(i==num[0].Accessible.length-1) res.send('This resource is not avaible for you.');
                }
            }
        }
    });
});

app.post('/addp', function(req, res) {
    PersonModel.find({"id": req.body.Id, "Password": req.body.Password}, function(err, num){
        if (num.length<=0) res.send('This resource is not avaible for you.');
        else{
            if(num[0].Accessible.length ==0) res.send('This resource is not avaible for you.');
            for(var i=0; i< num[0].Accessible.length; i++){
                if(num[0].Accessible[i]==req.body.ListId){
                    PersonModel.update({"id":req.body.PersonId},{ "$push": {"Accessible": req.body.ListId} }, function(err,res1){
                        res.send(choose_list);
                    });
                }
                else{
                    if(i==num[0].Accessible.length-1) res.send('This resource is not avaible for you.');
                }
            }
        }
    });
});

//TO DO: controllare che l' item non sia già nella lista, se c'è aggiornare la quantità
app.post('/additem', function(req, res) {
    PersonModel.find({"id": req.body.Id, "Password": req.body.Password}, function(err, num){
        if (num.length<=0) res.send('This resource is not avaible for youA.');
        else{
            if(num[0].Accessible.length ==0) res.send('This resource is not avaible for youB.');
            for(var i=0; i< num[0].Accessible.length; i++){
                if(num[0].Accessible[i]==req.body.ListId){
                    var tObj = {Product: req.body.Product, Amount: req.body.Amount, Price: req.body.Price };
                    ListModel.update({"ListId":req.body.ListId},{ "$push": {"entry": tObj} }, function(err,res1){
                        if(err){console.log(err);}
                        res.send(choose_list);
                    });
                }
                else{
                    if(i==num[0].Accessible.length-1) res.send('This resource is not avaible for youC.');
                }
            }
        }
    });
});

app.post('/removeitem', function(req, res) {
    PersonModel.find({"id": req.body.Id, "Password": req.body.Password}, function(err, num){
        if (num.length<=0) res.send('This resource is not avaible for you.');
        else{
            if(num[0].Accessible.length ==0) res.send('This resource is not avaible for you.');
            for(var i=0; i< num[0].Accessible.length; i++){
                if(num[0].Accessible[i]==req.body.ListId){
                    var tObj = {Product: req.body.Product, Amount: req.body.Amount, Price: req.body.Price };
                    ListModel.update({"ListId":req.body.ListId},{ "$pull": {"entry": tObj} }, function(err,res1){
                        if(err){console.log(err);}
                            res.send(choose_list);
                    });
                }
                else{
                    if(i==num[0].Accessible.length-1) res.send('This resource is not avaible for you.');
                }
            }
        }
    });
});
// twitter
//Token preso al seguente indirizzo
var requestTokenUrl = "https://api.twitter.com/oauth/request_token";



//Chiavi di default dell'app che offre il servizio
//Queste sono le mie:
//var CONSUMER_KEY = "pBmDZZnfK3LrUiM940UaG7SqD";
//var CONSUMER_SECRET = "VLIj2EF0BMOEaTSHFw04GTOPzueDwgdDznZqrjB5VraJNvBCIk";
var CONSUMER_KEY = "FoQWQIqTypas9MkE3df2BBe1U";
var CONSUMER_SECRET = "omztlw8el7p9u3vw9JYOCuMGFXBnQ0eVCd6HWbTAftSlfHSsY7";

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


	
var sss="Go to shopping!!!";
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