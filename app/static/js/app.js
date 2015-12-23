// Declare app level module which depends on filters, and services
angular.module('infiniworld', ['ngResource', 'ngRoute', 'ui.bootstrap', 'ui.date'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home/home.html', 
        controller: 'HomeController'})
      .when('/x/:x/y/:y/', {
        templateUrl: 'views/surface.html', 
        controller: 'SurfaceController'})
      .when('/x/:x/y/:y/city/', {
        templateUrl: 'views/city.html', 
        controller: 'CityController'})
      .otherwise({redirectTo: '/'});
  }]);
