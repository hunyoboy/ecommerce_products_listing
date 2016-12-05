'use strict';

angular.module('productsListingApp')
    .factory('Product', function($resource, Category) {

        var resource = $resource('/data/products.json'),
            iterateChildrenCategory = function(data, children, filteredProducts) {
                _.forEach(children, function(id) {
                    var childProducts = _.filter(data.products, function(product) { return product.categories.indexOf(id) !== -1; });
                    _.forEach(childProducts, function(childProduct) {
                        filteredProducts.push(childProduct);
                    });

                    var childCategory = _.find(data.categories, function(category) { return id === category._id; });
                    if (childCategory.children && childCategory.children.length > 0) {
                        iterateChildrenCategory(data, childCategory.children, filteredProducts);
                    }
                });
                return filteredProducts;
            },
            addProductsOfChildren = function(dataSource, children, filteredProducts) {
                filteredProducts = iterateChildrenCategory(dataSource, children, filteredProducts);
                return _.uniqBy(filteredProducts, '_id');
            },
            findById = function(id) {
                return function(products) {
                    return _.find(products, function(product) { return id === product._id; });
                };
            },
            onAllCategoriesFound = function(categoryData, slug, Product) {
                return function(categories) {
                    //cache all categories
                    categoryData.categories = categories;
                    //cache selected category 
                    categoryData.category = _.find(categories, function(category) { return slug === category.slug; });
                    if (categoryData.category) {
                        return Product.query().$promise;
                    }
                    return undefined;
                };
            },
            onProductSearch = function(searchTerm) {
                return function(products) {
                    return _.filter(products, function(product) {
                        return (product.title.toLowerCase().indexOf(searchTerm) !== -1 ||
                            product.description.toLowerCase().indexOf(searchTerm) !== -1);
                    });
                };
            },
            onAllProductsFound = function(categoryData) {
                return function(products) {
                    if (!categoryData.category) {
                        return [];
                    }

                    var filteredProducts = _.filter(products, function(product) { return product.categories.indexOf(categoryData.category._id) !== -1; }),

                        //combine all categories and all products into a single object
                        dataSource = {
                            categories: categoryData.categories,
                            products: products
                        };

                    //include all products that belong to each children of the current category               
                    filteredProducts = addProductsOfChildren(dataSource, categoryData.category.children, filteredProducts);

                    return filteredProducts;
                };
            };


        resource.getBySlug = function(slug) {
            var Product = this,
                categoryData = {
                    categories: [],
                    category: null //will hold the selected category
                };

            return Category.query().$promise
                .then(onAllCategoriesFound(categoryData, slug, Product))
                .then(onAllProductsFound(categoryData));

        };

        resource.search = function(searchTerm) {
            return this.query().$promise
                .then(onProductSearch(searchTerm.toLowerCase()));
        };

        resource.getById = function(id) {
            return this.query().$promise.then(findById(id));
        };

        return resource;
    });
