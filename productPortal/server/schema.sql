CREATE DATABASE products;

\c products;

CREATE SCHEMA products;

CREATE TABLE products.product (
  ID  SERIAL PRIMARY KEY,
  name varchar(400) NOT NULL,
  manufacturer varchar(400) NOT NULL,
  state BOOLEAN DEFAULT false
);

CREATE TABLE products.product_test (  
  ID  SERIAL PRIMARY KEY,
  datetime varchar(400),
  status varchar(20) DEFAULT 'pending',
  comment varchar(1000) DEFAULT '',
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


/*  Execute this file from the command line by typing:
 *   psql -U postgres -f server/schema.sql
 *  to create the database and the tables.*/
