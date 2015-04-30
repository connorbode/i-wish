var Twitter     = require('twitter');
var MongoClient = require('mongodb').MongoClient;
var logger      = require('tracer').colorConsole();
var t           = require('es6-template-strings');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

var collection;         // the mongodb collection of tweets
var docsAdded   = 0;    // the number of documents added to mongo
var buffer      = [];   // the buffer of tweets waiting to be added
var bufferLimit = 100;  // the buffer size which triggers a dump to mongo

//
// onBufferInserted
// ----------------
//
// runs when the `dumpBuffer` method
// returns. verifies success of method.
//
var onBufferInserted = function (err, status) {
  if (err) return logger.error(err);
  docsAdded += status.result.n;
  var message = t('${r} total tweets dumped to db!', { r: docsAdded });
  logger.info(message);
};

//
// dumpBuffer
// ----------
//
// dumps the buffer to mongodb and resets
// the buffer.
// 
var dumpBuffer = function () {
  logger.info('dumping buffer');
  collection.insert(buffer, onBufferInserted);
  buffer = [];
};

//
// onTweet
// -------
//
// runs every time a tweet is received from
// the twitter stream.  adds the tweet to
// the buffer.
// 
var onTweet = function (tweet) {
  var tweetOnly = {
    tweet: tweet.text
  };
  buffer.push(tweetOnly);
  if (buffer.length > bufferLimit)
    dumpBuffer();
};

// 
// onTwitterError
// --------------
//
// runs when there is an issue
// with the twitter stream.
//
var onTwitterError = function (err) {
  logger.error(err);
};

// 
// onTwitterConnected
// ------------------
// 
// runs when the twitter stream
// has been initialized
// 
var onTwitterConnected = function (stream) {
  logger.info('twitter stream established');
  stream.on('data', onTweet);
  stream.on('error', onTwitterError);
};

//
// onMongoConnected
// ----------------
// 
// runs after the application has established
// a connection with mongodb.  
//
// - gets the collection of tweets
// - initializes a twitter stream
// 
var onMongoConnected = function (err, db) {
  if (err) return logger.error(err);
  logger.info('connected to mongodb');

  collection = db.collection('tweets');
  client.stream('statuses/filter', {track: 'i wish'}, onTwitterConnected);
};


// run!
MongoClient.connect(process.env.MONGO_URL, onMongoConnected);