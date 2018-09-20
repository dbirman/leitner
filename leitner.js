// Setup express and socket.io
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

// Return files that are requested (we could filter if needed)
app.get( '/*' , function( req, res ) {
    // this is the current file they have requested
    var file = req.params[0]; 
    console.log('\t :: Express :: file requested: ' + file);    

    // give them what they want
    res.sendFile(__dirname + '/' + file);
}); 

var connectionList = {};

io.on('connection', function(socket){
  console.log('Connection: ID ' + socket.id);

  socket.loggedIn = false;

  socket.on('code', function(code){
    console.log('Received code: ' + code + ' from ID: ' + socket.id);
    socket.code = code;
    socket.loggedIn = true;
  });

  socket.on('disconnect', function(){
  	console.log('disconnect');
  });

  socket.on('addPaper', function(info) {if (socket.loggedIn) {addPaper(socket.code,info);}})

  socket.on('requestTweets', function() {request(socket.id,socket.code);});

  socket.on('response', function(info) {procResponse(info)});
});

function request(id,code) {
  // Get all the papers for this person's code 
  // return the papers that need to be displayed today
  // for each paper return three (other) "tweets" so that the user has to select the right one
  // make sure to pass the unique identifiers for the papers
}

function procResponse(info) {
  // Get a response from the user for a given paper, decide whether to repeat it sooner or later than the last time
  Paper.find({id:info.id}, function(err,papers) {
    if (err) {
      console.log('An error occurred while searching for existing papers with id: ' + paper.id);
    } else {
      console.log('Updating dates for id: ' + paper.id);
      papers[0].updateDate(info.success);
    }
  });
}

function init() {
  slog('Database startup');
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
  } else {
    mongoose.connect(MONGODB_URI);
  }
  let db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function() {
    slog('Connection to database established');

    slog('Listing papers in database');
    Paper.find(function(err,papers) {
      for (pi in papers) {
        console.log(papers[pi].titleString());
        console.log(papers[pi].nextMemoryString());
      }
    });

  });
}

let paperSchema = new mongoose.Schema({
  id: String, // a unique identifier to avoid adding papers twice
  code: String, // codes keep track of different collections of papers, e.g. for different projects
  authors: Array, // an array of author names
  year: Number, // 2018, etc
  journal: String, // journal abbreviations are best
  title: String,
  tweet: String, // this is key: a summary of the paper which doesn't include identifying information
  futuredays: Number,
  nextdate: Number,
});

paperSchema.methods.idString = function() {
  return this.id;
}

paperSchema.methods.titleString = function() {
  let str = '';
  for (let ai=0;ai<this.authors.length-1;ai++) {
    str += this.authors[ai] + ', ';
  }
  str += this.authors[this.authors.length-1] + ' (';
  str += this.year + ')';
  return str;
}

paperSchema.methods.tweetString = function () {
  return this.tweet;
}

paperSchema.methods.nextMemoryString = function() {
  return 'Days until next event: ' + Math.round(this.nextdate-now());
}

paperSchema.methods.unique = function() {
  return Paper.find({id:this.id},function(err,papers) {
    console.log(papers.length);
  });
}

paperSchema.methods.updateDate = function(success) {
  if (success) {
    // if they got it right, increment the future date
    this.futuredays *= 2;
  } else {
    this.futuredays /= 2;
  }
  if (this.futuredays>128) {this.futuredays=128}
  if (this.futuredays<1) {this.futuredays=1}
  this.nextdate = now() + this.futuredays;
}

let Paper = mongoose.model('Paper',paperSchema);

function addPaper(code,info) {
  // add the code
  info.code = code;
  info.futuredays = 1;
  // check if this paper exists
  let ttl = info.title.replace(/\s/g,'').toLowerCase();
  info.id = info.authors[0]+info.year+'-'+ttl[0]+ttl[ttl.length-1];
  info.nextdate = now();
  
  let paper = new Paper(info);
  // search for other papers with the identical id
  Paper.find({id:paper.id}, function(err,papers) {
    if (err) {
      console.log('An error occurred while searching for existing papers with id: ' + paper.id);
    } else if (papers.length==0) {
      paper.save();
    } else {
      console.log('Paper with id: ' + paper.id + ' already exists');
    }
  });
}

function now() {
  let now = new Date(Date.now());
  return now.valueOf()/1000/60/60/24;
}

function slog(msg) {
  if (msg.length<=16) {
    console.log('**** SERVER ****');
    console.log(msg);
    console.log('**** ****** ****');
  } else {
    let l = Math.ceil((msg.length-8)/2);
    let stars = '*'.repeat(l);
    console.log(stars+' SERVER '+stars);
    console.log(msg);
    console.log(stars+' ****** '+stars);
  }
}

var port = process.env.PORT || 8080;
http.listen(port, function(){ init(); });