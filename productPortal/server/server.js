// var gzippo = require('gzippo');
var express = require('express');
var router = express.Router();
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();

// app.use(gzippo.staticGzip("" + __dirname + "/client"));
app.use(express.static(__dirname + '/../client'));

app.get('/client', function(req, res) {
  res.render('index.html');
});

// HTTP access control (CORS)
app.use(cors());
// Body-parsing middleware to populate req.body.
app.use(bodyParser.json());

app.use('/api', router);
require('./products/productsRoutes')(router);

app.listen((process.env.PORT || 8000), function(){
  console.log('Product Portal is running on port 8000');
});
