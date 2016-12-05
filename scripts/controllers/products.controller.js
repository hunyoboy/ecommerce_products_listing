'use strict';

angular.module('productsListingApp')

    .controller('ProductsCtrl', function($scope, $rootScope, Product, $location, SideBar) {

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
            $scope.searchTerm = '';
        });

        $scope.search = function() {
            if ($scope.searchTerm && $scope.searchTerm.trim().length > 0) {
                $scope.breadCrumb = $scope.searchTerm;
                Product.search($scope.searchTerm).then(function(data) {
                    $scope.products = data;
                });
            }
            else {
                $scope.breadCrumb = 'all';
            }
            $rootScope.$broadcast('search:term', $scope.searchTerm);
        };


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
