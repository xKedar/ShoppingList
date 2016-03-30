var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//mongoose for interaction with mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/testing');
require("./PersonSchema.js");
var PersonModel = mongoose.model("Person");
require("./ListSchema.js");
var ListModel = mongoose.model("List");


app.get('/', function(req, res){
       res.send('Welcome to RIM Shopping List');
   });
   
   
//TO DO: Sistemare controllo per username already taken.
app.post('/register', function(req,res){
    console.log(req.body);
    console.log(PersonModel.count({"id": req.body.Id}));
    if(PersonModel.count({"id": req.body.Id})>0){ res.send('Username already taken');}
    else{
        console.log("We are in else");
    var newPerson = new PersonModel();
        newPerson.id = req.body.Id;
        newPerson.Password = req.body.Password;
        newPerson.save(function(err){console.log(err);});
        res.send('Your account is ready');
    }
});

//Restituisce la lista di tutti gli utenti del servizio.
app.get('/account/', function(req,res){
   PersonModel.find({}, function(err,output){
       res.send(output);
       });
});

//TO DO: sistemare query wrong id or password (stessa soluzione della registrazione)
app.post('/login', function(req,res){
   console.log(req.body);
   if(PersonModel.count({"id": req.body.Id, "Password": req.body.Password})<=0) res.send('Wrong Id or Password');
   else{
       PersonModel.find({"id": req.body.Id}, {"Accessible" :1},function(err,output){
           res.send(output);
       });
   }
});



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
        res.send('List is ready, you can add items now');
    });
});

app.post('/removelist', function(req, res) {
        ListModel.remove({"ListId":req.body.ListId}, function(err,res1){
        res.send('You bought everything, you can go home');
    });
});


app.post('/addp', function(req, res) {
    console.log(req.body);
    PersonModel.update({"id":req.body.personId},{ "$push": {"Accessible": req.body.ListId} }, function(err,res1){
    });
    res.send('New Person added.');

});

//TO DO: controllare che l' item non sia già nella lista, se c'è aggiornare la quantità
app.post('/additem', function(req, res) {
    console.log(req.body);
    var tObj = {Product: req.body.Product, Amount: req.body.Amount, Price: req.body.Price };
    ListModel.update({"ListId":req.body.ListId},{ "$push": {"entry": tObj} }, function(err,res1){
        if(err){console.log(err);}
        res.send('Item is added');
    });
});

app.post('/removeitem', function(req, res) {
    console.log(req.body);
    var tObj = {Product: req.body.Product, Amount: req.body.Amount, Price: req.body.Price };
    ListModel.update({"ListId":req.body.ListId},{ "$pull": {"entry": tObj} }, function(err,res1){
        if(err){console.log(err);}
        res.send('Item is removed');
    });
});



app.listen(3000);