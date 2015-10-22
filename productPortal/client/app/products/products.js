angular.module('productPortalApp.products', [])

.controller('productsCtrl', function ($scope, $rootScope, $state, $localStorage, $http) {
  // Array of product_test status options for ng-repeat to loop through for render in dropdown menu inside product_test table.
  $scope.testStatusOptions = ['pending', 'pass', 'fail'];

  // initiates text for 'show/hide product tests' button
  $scope.toggleTestViewText = $scope.toggleTestViewText || "Show";
  // jQuery to handle logic related to showing or hiding test tables for each product. It changes the button text to 'Show' or 'Hide' depending on whether product_test info is displayed. 
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

  // This will get tests status=failed within the past 7 days. No parameter required.
  window.getFailedTestsThisWeek = function() {
    var dateNow = moment();
    var dateSevenDaysAgo = dateNow.subtract(7, 'days');
    var dateNow = moment();
    var failedTestsThisWeek = [];
    // loop through csvContentsRefactored (contains all the product and product test info), if test status is fail and failed test was within 7 days, push to the failedTestThisWeek output array.
    for (var key in $scope.csvContentsRefactored) {
      for (var i = 0 ; i < $scope.csvContentsRefactored[key].tests.length; i++) {
        if($scope.csvContentsRefactored[key].tests[i].datetime >= dateSevenDaysAgo && $scope.csvContentsRefactored[key].tests[i].datetime <= dateNow && $scope.csvContentsRefactored[key].tests[i].status === "fail") {
          failedTestsThisWeek.push({name: $scope.csvContentsRefactored[key].name, manufacturer: $scope.csvContentsRefactored[key].manufacturer, product_test_Id: $scope.csvContentsRefactored[key].tests[i].id, test_name: $scope.productQualityTests[$scope.csvContentsRefactored[key].tests[i].test_id].name, test_description: $scope.productQualityTests[$scope.csvContentsRefactored[key].tests[i].test_id].description, comment: $scope.csvContentsRefactored[key].tests[i].comment, datetimeFailed: $scope.csvContentsRefactored[key].tests[i].datetime, test_status: $scope.csvContentsRefactored[key].tests[i].status});
        }
      }
    }
    return failedTestsThisWeek;
  };

  // Get all pending tests which were started > than 3 days ago. Can also get tests with other status more than X days old. Parameter format: {status: status, daysOlderThan: X}
  window.getTests = function(inputObj) {
    var inputObj = inputObj || {status: 'pending', daysOlderThan: 3};
    var inputStatus = inputObj.status;
    var daysOlderThan = inputObj.daysOlderThan;
    var dateNow = moment();
    var xDaysAgo = dateNow.subtract(daysOlderThan, 'days');
    var dateNow = moment();
    var incompleteTests = [];
    // loop through csvContentsRefactored (contains all the product and product test info), if datetime is more than xDaysAgo. then push it to the returning array of incompleteTests. 
    for (var key in $scope.csvContentsRefactored) {
      for (var i = 0 ; i < $scope.csvContentsRefactored[key].tests.length; i++) {
        if($scope.csvContentsRefactored[key].tests[i].datetime < xDaysAgo && $scope.csvContentsRefactored[key].tests[i].status === inputStatus) {
          incompleteTests.push({name: $scope.csvContentsRefactored[key].name, manufacturer: $scope.csvContentsRefactored[key].manufacturer, product_test_Id: $scope.csvContentsRefactored[key].tests[i].id, test_name: $scope.productQualityTests[$scope.csvContentsRefactored[key].tests[i].test_id].name, test_description: $scope.productQualityTests[$scope.csvContentsRefactored[key].tests[i].test_id].description, comment: $scope.csvContentsRefactored[key].tests[i].comment, test_created_or_updated: $scope.csvContentsRefactored[key].tests[i].datetime, test_status: $scope.csvContentsRefactored[key].tests[i].status});
        }
      }
    }
    return incompleteTests;
  };

  // This will return a list of products that are verified, and the last verified test is within X number of days. Parameter: integer representing number of days.
  window.validateProductsWhichAllTestsAreComplete = function(numberOfDays) {
    var numberOfDays = numberOfDays || 7;
    var dateNow = moment();
    var xDaysAgo = dateNow.subtract(numberOfDays, 'days');
    var dateNow = moment();
    var newlyValidatedProducts = [];
    // Loops through csvContentsRefactored (contains all the product and product test information) and checks for the product state, if state if true, then all tests have passed. Makes a copy of the product_test data and sorts it from newest to oldest time. If the newest time is within the numberOfDays parameter, then push that to the output array of newlyValidatedProducts. 
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

  // This will update product_test and product tables by making a POST request to the server and writing to PostgresSQL. It is invoked when there are any model changes through ng-change listening events. 
  $scope.updateDatabase = function(product) {
    // This for loop checks if all the tests are passed, if all tests are passed, then it will change the product's state to verified. 
    for (var i = 0; i < product.tests.length; i++) {
      if(product.tests[i].status === 'pending' || product.tests[i].status === 'fail') {
        $scope.csvContentsRefactored[product.id].state = false;
        break;
      }
      if(i === product.tests.length-1) {
        $scope.csvContentsRefactored[product.id].state = true;
      }
    }

    // Makes a post request to server. 
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

  // Retrieves products data from database. Invoked upon page load. 
  $scope.retrieveProductsData = function() {
    // This will post GET request to database.
    return $http({
      method:'GET', 
      url:'/api/retrieveProductsData'
    })
    .then(function(resp) {
      console.log('Successfully received response');
      // Saves retrieved producst data content to the scope variable csvContentsRefactored
      $scope.csvContentsRefactored = resp.data.csvContentsRefactored;
      for (var key in $scope.csvContentsRefactored) {
        for (var i = 0 ; i < $scope.csvContentsRefactored[key].tests.length; i++) {
          // Reformats the time format from ISO string to user friendly format.
          $scope.csvContentsRefactored[key].tests[i].datetime = new Date($scope.csvContentsRefactored[key].tests[i].datetime);
          // Creates a new idString property so that this string can be appended onto id names. The id name is required for the calendar dropdown display to be consistent when the calendar dropdown menu is closed
          $scope.csvContentsRefactored[key].tests[i].idString = $scope.csvContentsRefactored[key].tests[i].id.toString();
        }
      }
      // saves response from server to scope variables for render. 
      $scope.productQualityTests = resp.data.tests;
      $scope.productQualityTestData = resp.data.productQualityTestData;
    }, function(err) {
      console.log('Error:', err);
      console.log('Cannot retrieve products data from database')
    });
  };
  $scope.retrieveProductsData();

  // Extracts data from chosen csv file and sends its content to the server database for storage.
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
        // Save csv content to a local variable. 
        var csvContentsRefactored = resp.data.csvContentsRefactored;
        var productQualityTests = resp.data.tests;
        // Invoked retriveProductsData to render the refactored data onto screen
        $scope.retrieveProductsData();
      }, function(err) {
        console.log('Error:', err);
        console.log('Cannot save to database');
      });
    }
  };
});

//leave empty line
