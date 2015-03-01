var exec = require('child_process').exec;

var express = require("express");
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();

app.use(cookieParser('qSCbc_è9HBOçè_ccb'));
app.use(session({secret: 'I love cats and sweet dogs with a great bottle. That\'s not making any sens, I know :-)', resave: true, saveUninitialized: true, cookie:{maxAge: 1000*60*60*24*356}}));

app.set("views", __dirname+'/views');
app.set("view engine", "jade");
app.use('/static', express.static(__dirname+"/static"));

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended: true}) );

app.get('/', function(req, res){
	res.setHeader('Content-type', 'text/html');
	res.render('index', {page: 'gui'});
});

app.listen(1234);