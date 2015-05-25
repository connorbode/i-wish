var MongoClient   = require('mongodb').MongoClient;
var logger        = require('tracer').colorConsole();
var t             = require('es6-template-strings');
var EventEmitter  = require('events').EventEmitter;

var docEvents = new EventEmitter();
var wishes = {};
var docLimit = 100;
var numDocs = 0;

// 
// onEndOfDocs
// -----------
//
// runs when the cursor reaches the end
//
var onEndOfDocs = function () {
  var wishesArray = [];
  for (var key in wishes) {
    wishesArray.push([key, wishes[key]]);
  }
  wishesArray.sort(function (a,b) { return b[1] - a[1]; });
  for (var i = 0; i < 50; i += 1) {
    console.log(wishesArray[i][1] + "x " + wishesArray[i][0]);
  }
  process.exit(0);
};

//
// onDoc
// -----
//
// runs every time a doc is grabbed from 
// the database.
// 
var onDoc = function (doc) {
  var tweet = doc.tweet;
  if (!tweet) 
    return;
  var match = tweet.match(/i wish [a-z ]*/);
  if (match) {
    if (!wishes[match[0]])
      wishes[match[0]] = 0;

    wishes[match[0]] += 1;
    numDocs += 1;
  }

  // if (numDocs > docLimit)
  //   onEndOfDocs();
};

// 
// registerExperiment
// ------------------
//
// loads an experiment file and registers
// the appropriate callbacks
//
// accepts the following variables:
//
// - `filename`: the name of the experiment
// 
// experiments should export the following
// methods:
//
// - `onDoc`: called when a doc is received 
//    from Mongo
//
// - `onEndOfDocs`: called when there 
//    are no more documents
//
var registerExperiment = function (filename) {
  var experiment = require('./experiments/' + filename);

  if (experiment.onDoc)
    docEvents.addListener('doc', experiment.onDoc);

  if (experiment.onEndOfDocs)
    docEvents.addListener('end', experiment.onEndOfDocs);
};

//
// registerExperiments
// -------------------
//
// Registers all experiments for 
// analysis
//
var registerExperiments = function () {
  var experiments = [ 'most-common' ];
  experiments.forEach(function (e) {

  });
};

//
// onMongoConnected
// ----------------
//
// runs when a connection is established with
// the database
//
var onMongoConnected = function (err, db) {
  if (err) return logger.error(err);
  var collection = db.collection('tweets');
  var cursor = collection.find({});
  cursor.on('data', onDoc);
  cursor.on('end', onEndOfDocs);
};

// run!
MongoClient.connect(process.env.MONGO_URL, onMongoConnected);