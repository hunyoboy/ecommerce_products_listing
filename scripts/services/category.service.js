'use strict';

angular.module('productsListingApp')
    .factory('Category', function($resource) {
        return $resource('/data/categories.json');
    });
