/*

var pg = require('pg');
var path = require('path');
var config = require(path.join(__dirname, '../', '../','config'));
var client = new pg.Client(config);

client.connect();
var query = client.query("
  CREATE SCHEMA products;

  CREATE TABLE products.product (
    ID  SERIAL PRIMARY KEY,
    name varchar(400) NOT NULL,
    manufacturer varchar(400) NOT NULL,
    state BOOLEAN DEFAULT false
  );

  CREATE TABLE products.product_test (  
    ID  SERIAL PRIMARY KEY,
    datetime TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status BOOLEAN DEFAULT NULL,
    comment varchar(1000),
    product_id integer NOT NULL,
    test_id integer NOT NULL
  );

  CREATE TABLE products.test (
    ID  SERIAL PRIMARY KEY,
    name varchar(400) NOT NULL,
    description varchar(1000) NOT NULL
  );

  INSERT INTO products.test(name, description) values('Performance', 'How well the product does what it should do');

  INSERT INTO products.test(name, description) values('Quality', 'How well the product is made');

  INSERT INTO products.test(name, description) values('Safety', 'Whether the product is safe for consumer use');
  ");

query.on('end', function() { 
  client.end(); 
});
