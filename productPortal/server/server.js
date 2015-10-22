var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/../client'));

// Get request to serve index.html on client side
app.get('/client', function(req, res) {
  res.render('index.html');
});

// Body-parsing middleware to populate req.body.
app.use(bodyParser.json());

// Initiates the routing specs
app.use('/api', router);
require('./products/productsRoutes')(router);

app.listen((process.env.PORT || 8000), function(){
  console.log('Product Portal is running on port 8000');
});
