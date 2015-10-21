angular.module('productPortalApp.products', [])

.controller('productsCtrl', function ($scope, $rootScope, $state, $localStorage, $http) {
  $scope.toggleTestViewText = $scope.toggleTestViewText || "Show";
  $scope.testStatusOptions = ['pending', 'pass', 'fail'];

  $(document).ready(function(){
    $('.products_page_show_tests_button_wrapper').click(function() {
      if($scope.toggleTestViewText === "Show") {
        $('.products_page_table_product_tests_row').show();
        $scope.toggleTestViewText = 'Hide';
      } else {
        $('.products_page_table_product_tests_row').hide();
        $scope.toggleTestViewText = 'Show';
      }
    });
  });

  window.getFailedTestsThisWeek = function() {
    var dateNow = moment();
    var dateSevenDaysAgo = dateNow.subtract(7, 'days');
    var dateNow = moment();
    var failedTestsThisWeek = [];
    for (var key in $scope.csvContentsRefactored) {
      for (var i = 0 ; i < $scope.csvContentsRefactored[key].tests.length; i++) {
        if($scope.csvContentsRefactored[key].tests[i].datetime >= dateSevenDaysAgo && $scope.csvContentsRefactored[key].tests[i].datetime <= dateNow && $scope.csvContentsRefactored[key].tests[i].status === "fail") {
          failedTestsThisWeek.push({name: $scope.csvContentsRefactored[key].name, manufacturer: $scope.csvContentsRefactored[key].manufacturer, product_test_Id: $scope.csvContentsRefactored[key].tests[i].id, test_name: $scope.productQualityTests[$scope.csvContentsRefactored[key].tests[i].test_id].name, test_description: $scope.productQualityTests[$scope.csvContentsRefactored[key].tests[i].test_id].description, comment: $scope.csvContentsRefactored[key].tests[i].comment, datetimeFailed: $scope.csvContentsRefactored[key].tests[i].datetime, test_status: $scope.csvContentsRefactored[key].tests[i].status});
        }
      }
    }
    return failedTestsThisWeek;
  };

  window.getTests = function(inputObj) {
    var inputObj = inputObj || {status: 'pending', daysOlderThan: 3};
    var inputStatus = inputObj.status;
    var daysOlderThan = inputObj.daysOlderThan;
    var dateNow = moment();
    var xDaysAgo = dateNow.subtract(daysOlderThan, 'days');
    var dateNow = moment();
    var incompleteTests = [];
    for (var key in $scope.csvContentsRefactored) {
      for (var i = 0 ; i < $scope.csvContentsRefactored[key].tests.length; i++) {
        if($scope.csvContentsRefactored[key].tests[i].datetime < xDaysAgo && $scope.csvContentsRefactored[key].tests[i].status === inputStatus) {
          incompleteTests.push({name: $scope.csvContentsRefactored[key].name, manufacturer: $scope.csvContentsRefactored[key].manufacturer, product_test_Id: $scope.csvContentsRefactored[key].tests[i].id, test_name: $scope.productQualityTests[$scope.csvContentsRefactored[key].tests[i].test_id].name, test_description: $scope.productQualityTests[$scope.csvContentsRefactored[key].tests[i].test_id].description, comment: $scope.csvContentsRefactored[key].tests[i].comment, test_created_or_updated: $scope.csvContentsRefactored[key].tests[i].datetime, test_status: $scope.csvContentsRefactored[key].tests[i].status});
        }
      }
    }
    return incompleteTests;
  };

  window.validateProductsWhichAllTestsAreComplete = function(numberOfDays) {
    var numberOfDays = numberOfDays || 7;
    var dateNow = moment();
    var xDaysAgo = dateNow.subtract(numberOfDays, 'days');
    var dateNow = moment();
    var newlyValidatedProducts = [];
    for (var key in $scope.csvContentsRefactored) {
      if($scope.csvContentsRefactored[key].state) {
        var tempTestsArray = $scope.csvContentsRefactored[key].tests.slice();
        tempTestsArray.sort(function(a, b) {
          return b.datetime - a.datetime;
        })
        var latestTime = tempTestsArray[0].datetime;
        if(latestTime > xDaysAgo && latestTime < dateNow) {
          newlyValidatedProducts.push($scope.csvContentsRefactored[key]);
        }
      }
    }
    return newlyValidatedProducts;
  };

  $scope.updateDatabase = function(product) {
    for (var i = 0; i < product.tests.length; i++) {

      if(product.tests[i].status === 'pending' || product.tests[i].status === 'fail') {
        $scope.csvContentsRefactored[product.id].state = false;
        break;
      }
      if(i === product.tests.length-1) {
        $scope.csvContentsRefactored[product.id].state = true;
      }
    }
    // }
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
      $scope.csvContentsRefactored = resp.data.csvContentsRefactored;
      for (var key in $scope.csvContentsRefactored) {
        for (var i = 0 ; i < $scope.csvContentsRefactored[key].tests.length; i++) {
          $scope.csvContentsRefactored[key].tests[i].datetime = new Date($scope.csvContentsRefactored[key].tests[i].datetime);
          $scope.csvContentsRefactored[key].tests[i].idString = $scope.csvContentsRefactored[key].tests[i].id.toString();
        }
      }
      $scope.productQualityTests = resp.data.tests;
      $scope.productQualityTestData = resp.data.productQualityTestData;
    }, function(err) {
      console.log('Error:', err);
      console.log('Cannot retrieve products data from database')
    });
  };
  $scope.retrieveProductsData();

  $scope.uploadCsvFile = function() {
    // save Csv content to database;  
    if($scope.csv.result) {
      return $http({
        method: 'POST', 
        url: '/api/uploadCsvFile',
        data: {csvContent: $scope.csv.result}
      })
      .then(function(resp) {
        console.log('Successfully saved to database');
        var csvContentsRefactored = resp.data.csvContentsRefactored;
        var productQualityTests = resp.data.tests;
        $scope.retrieveProductsData();
      }, function(err) {
        console.log('Error:', err);
        console.log('Cannot save to database');
      });
    }
  };
});

//leave empty line
