/* 
 * Mattia Di Fulvio
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Person = new Schema({
    id: {type: String},  // username
    Password: {type: String}, //password
    Accessible: [String] //lista di identificatori di Liste della spesa a cui l' utente può accedere.
});


mongoose.model("Person", Person);




