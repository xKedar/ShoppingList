// npm install express
var express = require('express');
var app = express();
var fs=require("fs");
//variabili 
var home=fs.readFileSync('home.html',"utf8");
var choose_list=fs.readFileSync('choose_list.html',"utf8");
var nuova_lista=fs.readFileSync('nuova_lista.html',"utf8");
var aggiornare_lista=fs.readFileSync('aggiornare_lista.html',"utf8");
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

//FIXATO: Sistemare controllo per username already taken. 
app.post('/register', function(req,res){
    PersonModel.count({"id": req.body.Id}, function(err, num){
        if (num>0) res.send('Username already taken');
        else{
            var newPerson = new PersonModel();
            newPerson.id = req.body.Id;
            newPerson.Password = req.body.Password;
            newPerson.save(function(err){console.log(err);});
            res.send('Your account is ready');
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

//funzione per il controllo che l' utente che richiede le modifiche sia autorizzato alla lista che chiede
//e aggirare il problema stateless
function login(username, password, list){
    return PersonModel.find({"id": username, "Password": password}, function(err, num){
        if (num.length<=0) return 0;
        else{
            for(var i=0; i< num[0].Accessible.length; i++){
                console.log('for');
                if(num[0].Accessible[i]==list){ 
                    console.log('if');
                    return 1;
                }
            }
            return 0;
        }
    });
}

//FUNZIONE CHE APRE LA LISTA SENZA STAMPA (PER UPDATE)
app.post('/update_list', function(req,res){
    console.log(req.body);
    console.log(login(req.body.user, req.body.pass, req.body.ListId));
    if(login(req.body.user, req.body.pass, req.body.ListId)){
    ListModel.find({"ListId":req.body.ListId}, function(err,output){
        res.send(aggiornare_lista);
        });
    }
    else{
        res.send('This resource is not avaible for you.');
    }
});
//CAMBIATA DA GET A POST PER PASSAGGIO DATI LOGIN 
app.post('/list', function(req,res){
    console.log(req.body);
    console.log(login(req.body.user, req.body.pass, req.body.ListId));
    if(login(req.body.user, req.body.pass, req.body.ListId)){
    ListModel.find({"ListId":req.body.ListId}, function(err,output){
        res.send(output);
        });
    }
    else{
        res.send('This resource is not avaible for you.');
    }
});

//VERSIONE PER DEBUG più comoda per me
app.get('/list/:param1', function(req,res){
    ListModel.find({"ListId":req.params.param1}, function(err,output){
       res.send(output);
       });
});


//TO DO: controllare che non esista una lista con lo stesso identificativo di quella che stiamo per creare
app.post('/newlist', function(req, res) {
    var newList = new ListModel();
        console.log(req.body);
        newList.ListId = req.body.ListId;
        newList.save(function(err){console.log(err);});
        PersonModel.update({"id":req.body.personId},{ "$push": {"Accessible": req.body.ListId} }, function(err,res1){
        res.send(nuova_lista);
    });
});

app.post('/removelist', function(req, res) {
    ListModel.remove({"ListId":req.body.ListId}, function(err,res1){
        res.send(choose_list);
    });
});

app.post('/addp', function(req, res) {
    console.log(req.body);
    PersonModel.update({"id":req.body.personId},{ "$push": {"Accessible": req.body.ListId} }, function(err,res1){
    });
    res.send(choose_list);

});

//TO DO: controllare che l' item non sia già nella lista, se c'è aggiornare la quantità
app.post('/additem', function(req, res) {
    console.log(req.body);
    var tObj = {Product: req.body.Product, Amount: req.body.Amount, Price: req.body.Price };
    ListModel.update({"ListId":req.body.ListId},{ "$push": {"entry": tObj} }, function(err,res1){
        if(err){console.log(err);}
        res.send(choose_list);
    });
});

app.post('/removeitem', function(req, res) {
    console.log(req.body);
    var tObj = {Product: req.body.Product, Amount: req.body.Amount, Price: req.body.Price };
    ListModel.update({"ListId":req.body.ListId},{ "$pull": {"entry": tObj} }, function(err,res1){
        if(err){console.log(err);}
        res.send(choose_list);
    });
});

app.listen(3000);
