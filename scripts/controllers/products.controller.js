'use strict';

angular.module('productsListingApp')

    .controller('ProductsCtrl', function($scope, Product, $location, SideBar) {

        var getProducts = function() {
            var slug = SideBar.getSlug();
            SideBar.showBreadCrumb($scope, 100);
            if (slug) {
                return Product.getBySlug(slug);
            }
            return Product.query().$promise;
        };

        //listen to change on URL
        $scope.$on('$locationChangeSuccess', function() {
            getProducts().then(function(data) {
                $scope.products = data;
            });
        });


        $scope.onLoad = function() {
            getProducts().then(function(data) {
                $scope.products = data;
            });
        };

        SideBar.showBreadCrumb($scope, 800);

    })
    .controller('ProductViewCtrl', function($scope, $state, $stateParams, Product) {
        Product.getById($stateParams.id).then(function(product) {
            $scope.product = product;
        });
    });
