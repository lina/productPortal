var productsController = require('./productsController');

module.exports = function(router){
  router.post('/uploadCsvFile', productsController.uploadCsvFile);
  router.get('/retrieveProductsData', productsController.retrieveProductsData);
  router.post('/saveToDatabase', productsController.saveToDatabase);
};
