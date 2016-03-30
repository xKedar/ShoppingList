
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var List = new Schema({
    ListId: {type: String}, //identificatore della lista
    entry: [{Product: String, Amount: Number, Price: Number}] //elementi presenti nella lista
});


mongoose.model("List", List);