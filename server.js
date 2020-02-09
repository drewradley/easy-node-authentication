// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
const fileUpload = require('express-fileupload');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
const mysql = require('mysql');
const path = require('path');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

//var configDB = require('./config/database.js'); //REMOVE FOR PRODUCTION
var compression = require('compression');
var helmet = require('helmet');

const {getHomePage} = require('./routes/index');
const {addPlayerPage, addPlayer, deletePlayer, editPlayer, editPlayerPage} = require('./routes/player');

require('dotenv').config({ path: '.env.local' });
  
  

  app.set('port', process.env.port || port); // set express to use this port
  app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
  app.set('view engine', 'ejs'); // configure template engine
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json()); // parse form data client
  app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
  app.use(fileUpload()); // configure fileupload

// configuration ===============================================================
//var mongoDB = process.env.MONGODB_URI || configDB.url; //REMOVE FOR PRODUCTION
var mongoDB = process.env.MONGODB_URI; //REMOVE FOR TEST

mongoose.connect(mongoDB); // connect to our database
app.use(helmet());

require('./config/passport')(passport); // pass passport for configuration
app.use(compression()); //Compress all routes
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session



///mySQL======================================================================
var db_config = {
    host: "OOMPHproctors.db.5391918.389.hostedresource.net",
    user: "OOMPHproctors",
    password: process.env.MYSQL_PW,
    database: "OOMPHproctors",
  };
  handleDisconnect();
  const ensureAuthenticated = (req, res, next) => {
    console.log(req.user.local.email)
    req.isAuthenticated() ? next() : res.sendStatus(401)
  };
  
  app.get('/', getHomePage);
  app.get('/add', addPlayerPage);
  app.get('/edit/:id', ensureAuthenticated, editPlayerPage);
  app.get('/delete/:id', deletePlayer);
  app.post('/add', addPlayer);
  app.post('/edit/:id', editPlayer);
  var connection;
  function handleDisconnect() {
    connection = mysql.createConnection(db_config); // Recreate the connection, since
    global.connection = connection;
    connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
      console.log('Connected to database');  
      
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        handleDisconnect();                         // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });

  }
  
// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
