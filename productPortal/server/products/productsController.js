var pg = require('pg');
var path = require('path');
var config = require(path.join(__dirname, '../', '../','config'));

module.exports = {
  retrieveProductsData: function(req, res, next) {
      var results = {};
      results.csvContentsRefactored = {};
      results.tests = {};
      pg.connect(config, function(err, client, done) {
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }
        var query = client.query("SELECT * FROM products.product", function(err, data) {
          if(err) {
            done();
            console.log(err);
            return res.status(500).json({success: false, data: err});
          }
          for (var i = 0 ; i < data.rows.length; i++) {
            results.csvContentsRefactored[data.rows[i].id] = data.rows[i];
          }
          var query = client.query("SELECT * FROM products.product_test", function(err, data) {
            if(err) {
              done();
              console.log(err);
              return res.status(500).json({success: false, data: err});
            }
            var product_test = data.rows; //error handler if there is nothing
            for (var k = 0 ; k < product_test.length; k++) {
              var currProductId = product_test[k].product_id;
              results.csvContentsRefactored[currProductId].tests = results.csvContentsRefactored[currProductId].tests || [];
              results.csvContentsRefactored[currProductId].tests.push(product_test[k]);
            }
          });
          var query = client.query("SELECT * FROM products.test");
          query.on('row', function(row){
            results.tests[row.id] = row;
          });
          query.on('end', function() {
            done();
            console.log('---->*results', results);
            return res.json(results);
          }); 
        });
      })
  },
  saveToDatabase: function(req, res, next) {
    console.log('-------------------> saveToDatabase executed');
    if(!req.body) {
      return res.status(400).json({error:"Bad Request"});
    } else {
      var productId = req.body.productId;
      var updatedProduct = req.body.csvContentsRefactored[productId];
      console.log('-------->productId:', productId);
      console.log('-------->updatedProduct:', updatedProduct);
      pg.connect(config, function(err, client, done) {
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }
        console.log('UPDATE products.product SET state='+updatedProduct.state+' WHERE ID='+productId)
        var query = client.query('UPDATE products.product SET state='+updatedProduct.state+' WHERE ID='+productId);
        for (var j = 0 ; j < updatedProduct.tests.length; j++) {
          console.log("UPDATE products.product_test SET datetime='"+updatedProduct.tests[j].datetime+"', status='"+updatedProduct.tests[j].status+"', comment='"+updatedProduct.tests[j].comment+"' WHERE ID="+updatedProduct.tests[j].id);
          var query = client.query("UPDATE products.product_test SET datetime='"+updatedProduct.tests[j].datetime+"', status='"+updatedProduct.tests[j].status+"', comment='"+updatedProduct.tests[j].comment+"' WHERE ID="+updatedProduct.tests[j].id);
          //-------------------
          // console.log('UPDATE products.product_test SET datetime='+updatedProduct.tests[j].datetime+', status='+JSON.stringify(updatedProduct.tests[j].status)+', comment='+JSON.stringify(updatedProduct.tests[j].comment)+' WHERE ID='+updatedProduct.tests[j].id);
          // var query = client.query('UPDATE products.product_test SET datetime='+updatedProduct.tests[j].datetime+', status='+JSON.stringify(updatedProduct.tests[j].status)+', comment='+JSON.stringify(updatedProduct.tests[j].comment)+' WHERE ID='+updatedProduct.tests[j].id);
          //-------------------
          // console.log('UPDATE products.product_test SET comment='+JSON.stringify(updatedProduct.tests[j].comment)+' WHERE ID='+updatedProduct.tests[j].id);
          // var query = client.query('UPDATE products.product_test SET comment='+JSON.stringify(updatedProduct.tests[j].comment)+' WHERE ID='+updatedProduct.tests[j].id);

        }
        //maybe end here
        query.on('end', function() {
          done();
          // console.log('---->results', results);
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
      var results = {};
      results.csvContentsRefactored = [];
      var csvContent = req.body.csvContent;
      pg.connect(config, function(err, client, done) {
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }
        var query = client.query("SELECT * FROM products.test", function(err, data) {
          results.tests = data.rows;
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
            var query = client.query("INSERT INTO products.product(name, manufacturer, state) values($1, $2, $3)", [tempArr[0], tempArr[1], false]);
            for (var k = 1 ; k <= results.tests.length; k++) {
              var query = client.query("INSERT INTO products.product_test(product_id, test_id) values($1, $2)", [i, k]);
            }
          }
        })
        query.on('end', function() {
          done();
          console.log('---->results', results);
          return res.json(results);
        })
      })
    }
  }

};

// leave extra line at end
