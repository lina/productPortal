// Bootstrap the app and controllers
angular.module('productPortalApp', [
  'productPortalApp.products',
  'ui.router',
  'ngMaterial',
  'ngStorage',
  'ngCsvImport',
  'smart-table',
  'ui.bootstrap.datetimepicker'
])

// config the app states
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('products', {
      url: '/',
      templateUrl: 'app/products/products.html',
      controller: 'productsCtrl'
    });
    $urlRouterProvider.otherwise('/');
});
