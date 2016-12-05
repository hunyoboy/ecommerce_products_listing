'use strict';

angular.module('productsListingApp')
    .controller('SidebarCtrl', function($scope, Category, $TreeDnDConvert, SideBar) {

        $scope.selectedNode = null;

        var tree = {}, categoriesFromDb;
        $scope.categories = {};
        $scope.categoriesTree = tree = {};

        $scope.expandingProperty = {
            field: 'name',
            titleClass: 'text-center',
            cellClass: 'v-middle'
        };


        $scope.onLoad = function() {
            var slug = SideBar.getSlug('all'),
                treeFormattedCategories;
            $scope.selectedNode = slug;
            return Category.query().$promise.then(function(categories) {
                treeFormattedCategories = $TreeDnDConvert.line2tree(categories, '_id', 'parent');

                categoriesFromDb = categories;

                var ancestorIds = SideBar.getAncestorIds(categoriesFromDb, slug);

                //update breadcrumb
                SideBar.setBreadCrumb(slug, categoriesFromDb, ancestorIds);

                //open selected node based from the slug on the url
                $scope.categories = SideBar.expandActiveNodes(treeFormattedCategories, slug, ancestorIds);

                return categories;

            });
        };

        //listen on url change
        $scope.$on('$locationChangeSuccess', function() {
            $scope.selectedNode = SideBar.getSlug('all');
            //update breadcrumb
            SideBar.setBreadCrumb($scope.selectedNode, categoriesFromDb);
        });

        $scope.$on('search:term', function(event, data) {
            if (data && data.trim().length > 0) {
                $scope.selectedNode = null;
            }
            else {
                $scope.selectedNode = SideBar.getSlug('all');
                SideBar.updateCategoryUrl({ slug: 'all' });
            }
        });

        $scope.customToogleNode = function(node) {
            if (node.__children__.length > 0) {
                node.__expanded__ = !node.__expanded__;
                node.__children__.forEach(function(childNode) {
                    childNode.__visible__ = node.__expanded__;
                });
            }
        };

        $scope.toogleCatalog = function(node) {
            SideBar.updateCategoryUrl(node);
            $scope.selectedNode = node.slug;
            //update breadcrumb     
            SideBar.setBreadCrumb($scope.selectedNode, categoriesFromDb);
        };

    });
