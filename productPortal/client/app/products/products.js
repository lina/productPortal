angular.module('productPortalApp.products', [])

.controller('productsCtrl', function ($scope, $rootScope, $state, $localStorage, $http) {

  $scope.testStatusOptions = ['pending', 'pass', 'fail'];

  $scope.updateDatabase = function(product) {
    console.log('updateDatabase invoked');
    console.log('$scope.csvContentsRefactored', $scope.csvContentsRefactored);
    // if(product && product_test) {
    for (var i = 0; i < product.tests.length; i++) {

      if(product.tests[i].status === 'pending' || product.tests[i].status === 'fail') {
        $scope.csvContentsRefactored[product.id].state = false;
        break;
      }
      if(i === product.tests.length-1) {
        console.log('change product state');
        $scope.csvContentsRefactored[product.id].state = true;
        console.log('product.id', product.id);
        console.log('$scope.csvContentsRefactored[product.id].state', $scope.csvContentsRefactored[product.id].state)
        console.log('$scope.csvContentsRefactored', $scope.csvContentsRefactored);
        // $scope.$apply();
      }
    }
    // }
    console.log('about to make post request');
    return $http({
      method:"POST",
      url: "/api/saveToDatabase",
      data: {csvContentsRefactored: $scope.csvContentsRefactored, productId: product.id}
    })
    .then(function(resp) {
      console.log('Successfully saved to database');

    }, function(err) {
      console.log("Error:", err);
      console.log("Cannot update database");
    });
  };

  $scope.retrieveProductsData = function() {
    return $http({
      method:'GET', 
      url:'/api/retrieveProductsData'
    })
    .then(function(resp) {
      console.log('Successfully received response');
      console.log('retrieveProductsData --->resp.data', resp.data);

      console.log('retrieveProductsData BEFORE --->resp.data.csvContentsRefactored', resp.data.csvContentsRefactored);

      $scope.csvContentsRefactored = resp.data.csvContentsRefactored;
      for (var key in $scope.csvContentsRefactored) {
        for (var i = 0 ; i < $scope.csvContentsRefactored[key].tests.length; i++) {
          $scope.csvContentsRefactored[key].tests[i].datetime = new Date($scope.csvContentsRefactored[key].tests[i].datetime);
          $scope.csvContentsRefactored[key].tests[i].idString = $scope.csvContentsRefactored[key].tests[i].id.toString();
        }
      }
      $scope.productQualityTests = resp.data.tests;
      // $scope.productQualityTestData = resp.data.productQualityTestData;
      console.log('retrieveProductsData AFTER --->resp.data.csvContentsRefactored', resp.data.csvContentsRefactored);
      console.log('retrieveProductsData --->resp.data.tests', resp.data.tests);
      // console.log('retrieveProductsData --->resp.data.productQualityTestsData', resp.data.productQualityTestData);


    }, function(err) {
      console.log('Error:', err);
      console.log('Cannot retrieve products data from database')
    });
  };
  $scope.retrieveProductsData();

  $scope.uploadCsvFile = function() {
    // save Csv content to database;  
    if($scope.csv.result) {
      console.log('-------------->csv.result', $scope.csv.result); 
      return $http({
        method: 'POST', 
        url: '/api/uploadCsvFile',
        data: {csvContent: $scope.csv.result}
      })
      .then(function(resp) {
        // render the re;ponse
        console.log('Successfully saved to database');
        console.log('----->resp.data', resp.data);

        console.log('----->resp.data.csvContentsRefactored', resp.data.csvContentsRefactored);
        var csvContentsRefactored = resp.data.csvContentsRefactored;
        var productQualityTests = resp.data.tests;
        // for (var i = 0 ; i < csvContentsRefactored.length; i++) {
        //   var currRow = csvContentsRefactored[i];
        //   // if(!currRow[2]) {
        //   //   currRow[2] = 'unverified';
        //   // } else {
        //   //   currRow[2] = 'verified';
        //   // }
        //   // var newRow = '<tr><td>'+currRow[0]+'</td><td>'+currRow[1]+'</td><td>'+currRow[2]+'<td></tr>';
        //   // $('.products_page_table').append(newRow);
        // }
        // // $scope.csvContentsRefactored = csvContentsRefactored;
        // $scope.productQualityTests = productQualityTests;
        // console.log('$scope.csvContentsRefactored', $scope.csvContentsRefactored);
        // console.log('$scope.productQualityTests', $scope.productQualityTests);

        // $localStorage.csvContentsRefactored = $scope.csvContentsRefactored;
        // $localStorage.productQualityTests = $scope.productQualityTests;
        $scope.retrieveProductsData();

      }, function(err) {
        console.log('Error:', err);
        console.log('Cannot save to database');
      });
    }
  };
});

//leave empty line
