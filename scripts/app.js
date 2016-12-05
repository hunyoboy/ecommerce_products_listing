'use strict';

angular.module('productsListingApp', [
    'ngResource',
    'ui.router',
    'ngAnimate',
    'ngSanitize',
    'ntt.TreeDnD'
])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
            .otherwise('/');
        $locationProvider.html5Mode(true);

        $stateProvider
            .state('products', {
                url: '/products',
                templateUrl: '/templates/products-list.html?cache_bust=' + Date.now(),
                controller: 'ProductsCtrl'
            })
            .state('viewProduct', {
                url: '/products/:id/view',
                templateUrl: '/templates/product-view.html?cache_bust=' + Date.now(),
                controller: 'ProductViewCtrl'
            });
    });
