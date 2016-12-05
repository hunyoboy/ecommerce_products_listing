'use strict';

angular.module('productsListingApp')
  .directive('sidebar', function () {
    return {
      templateUrl: '/templates/sidebar.html',
      restrict: 'E',
      controller: 'SidebarCtrl'
    };
  });
