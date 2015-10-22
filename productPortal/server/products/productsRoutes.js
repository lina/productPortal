var productsController = require('./productsController');

module.exports = function(router){
  // routes post or get requests from client to the relevant server function
  router.post('/uploadCsvFile', productsController.uploadCsvFile);
  router.get('/retrieveProductsData', productsController.retrieveProductsData);
  router.post('/saveToDatabase', productsController.saveToDatabase);
};
