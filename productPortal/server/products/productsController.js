var pg = require('pg');
var path = require('path');
var config = require(path.join(__dirname, '../', '../','config'));

// Error handler to handle connection and query errors
var errorHandler = function(res, err, done) {
  done();
  console.log(err);
  return res.status(500).json({success: false, data: err});
}

module.exports = {
  // Handles GET request to retrieve products data from product, product_test and test database and sends it back to the client.
  retrieveProductsData: function(req, res, next) {
    // Initiates empty objects to store data.
    var results = {};
    results.csvContentsRefactored = {};
    results.tests = {};
    // Connect to postgres database. 
    pg.connect(config, function(err, client, done) {
      if(err) {
        return errorHandler(res, err, done);
      } 
      // Retrieve all rows in products.product and save to object
      var query = client.query("SELECT * FROM products.product", function(err, data) {
        if(err) {
          return errorHandler(res, err, done);
        }
        for (var i = 0 ; i < data.rows.length; i++) {
          results.csvContentsRefactored[data.rows[i].id] = data.rows[i];
        }
        // Retrieve all rows from products.product_test and iterate through rows to save them into object with product information (object variable is named csvContentsRefactoed)
        var query = client.query("SELECT * FROM products.product_test", function(err, data) {
          if(err) {
            return errorHandler(res, err, done);
          }
          var product_test = data.rows; //error handler if there is nothing
          for (var k = 0 ; k < product_test.length; k++) {
            var currProductId = product_test[k].product_id;
            results.csvContentsRefactored[currProductId].tests = results.csvContentsRefactored[currProductId].tests || [];
            results.csvContentsRefactored[currProductId].tests.push(product_test[k]);
          }
        });
        // Retrievs all rows from product.test and save to object. 
        var query = client.query("SELECT * FROM products.test");
        query.on('row', function(row){
          results.tests[row.id] = row;
        });
        // End database connection and return response to client
        query.on('end', function() {
          done();
          return res.json(results);
        }); 
      });
    })
  },
  // Writes product and product test updates to database
  saveToDatabase: function(req, res, next) {
    if(!req.body) {
      return res.status(400).json({error:"Bad Request"});
    } else {
      // Saves request body to local variables
      var productId = req.body.productId;
      var updatedProduct = req.body.csvContentsRefactored[productId];
      // Connect to postgres database. 
      pg.connect(config, function(err, client, done) {
        if(err) {
          return errorHandler(res, err, done);
        }
        // Update product state for the product of the given product_id inside database
        var query = client.query('UPDATE products.product SET state='+updatedProduct.state+' WHERE ID='+productId);
        // Goes through each individual product tests (3 for now) and update the product_test information inside database.
        for (var j = 0 ; j < updatedProduct.tests.length; j++) {
          var query = client.query("UPDATE products.product_test SET datetime='"+updatedProduct.tests[j].datetime +"', status='"+updatedProduct.tests[j].status+"', comment='"+updatedProduct.tests[j].comment+"' WHERE ID="+updatedProduct.tests[j].id);
        }
        // End database connection and return response to client
        query.on('end', function() {
          done();
          return res.status(200).json({success:true});
        });
      })
    }
  },

  // Listens to post request from client to add products from csv file to database. 
  uploadCsvFile: function(req, res, next) {
    if(!req.body) {
      return res.status(400).json({error:"Bad Request"});
    } else {
      // Initiate storgae variables
      var results = {};
      results.csvContentsRefactored = [];
      var csvContent = req.body.csvContent;
      pg.connect(config, function(err, client, done) {
        if(err) {
          return errorHandler(res, err, done);
        }
        // Retrieves data from product.test table (has name and description of tests) to use the test_id to populate product_test table
        var query = client.query("SELECT * FROM products.test", function(err, data) {
          if(err) {
            return errorHandler(res, err, done);
          }
          results.tests = data.rows;
          // Refactors the csv content to friendlier format for writing to database
          for (var i = 1 ; i < csvContent.length; i++) {
            var tempArr = [];
            for (var key in csvContent[i]) { 
              var arrContent = csvContent[i][key].split(',');
              for (var j = 0 ; j < arrContent.length; j++) {
                if(arrContent[j] === '') {
                  continue;
                };
                tempArr.push(arrContent[j]);
              }
            }
            results.csvContentsRefactored.push(tempArr);
            // Update product name, manufacturer and state for the product. It sets a default state 'false', equivalent to 'Unverified';
            var query = client.query("INSERT INTO products.product(name, manufacturer, state) values($1, $2, $3) returning id", [tempArr[0], tempArr[1], false]);
            query.on('row', function(row) {
              //For each product, insert the product_id and test_id (variable k in the for loop) into product_test table. Also insert the current date in ISO format to the table to indicate when product was uploaded in csv file
              for (var k = 1 ; k <= results.tests.length; k++) {
                var query = client.query("INSERT INTO products.product_test(datetime, product_id, test_id) values($1, $2, $3)", [new Date().toISOString(), row.id, k]);
              }
            })
          }
        });
        // End database connection and return response to client
        query.on('end', function() {
          done();
          return res.json(results);
        })
      })
    }
  }

};

// leave extra line at end
