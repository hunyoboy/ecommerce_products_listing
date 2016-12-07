'use strict';

angular.module('productsListingApp')
    .factory('SideBar', function ($location, $timeout) {
        var breadCrumb = '',
            //configurable constants
            productListBaseUrl = '/products',
            paramName = 'category';

        return {
            /**
             * Recurse and expand each nodes from the given array of node _ids
             * @param array nodes the collections of nodes to recurse   
             * @param array nodeIds the collection of node ids to expand 
             */
            expandNodesByIds: function (nodes, nodeIds) {
                var i, node, len = nodes.length, index;
                for (i = 0; i < len; i++) {
                    node = nodes[i];
                    index = nodeIds.indexOf(node._id);

                    if (index > -1) {
                        nodeIds.splice(index, 1);
                        node.__expanded__ = true;
                    }

                    //there is always one node id left w/c is that of the root
                    //remember that we exclude the root node from the nodes to loop
                    if (nodeIds.length === 1) {
                        break;
                    }
                    //check if this node has children
                    if (node.__children__) {
                        this.expandNodesByIds(node.__children__, nodeIds);
                    }
                }

                return nodes;
            },
            /**
             * Return the ancestor ids of the matched slug value
             * @param array categories collection of categories from the database
             * @param string slug the value of the slug to match
             */
            getAncestorIds: function (categories, slug) {
                var i, category, len = categories.length, matched;
                for (i = 0; i < len; i++) {
                    category = categories[i];
                    if (category && category.slug === slug) {
                        matched = category.ancestors;
                        break;
                    }
                }
                return matched;
            },
            /**
             * Expand active/selected nodes based from the slug
             * @param array nodes the array of category tree nodes
             * @param slug string the slug of the node selected
             * @param array ancestorIds collection of ancestor ids for the selected node to expand
             */
            expandActiveNodes: function (nodes, slug, ancestorIds) {

                var secondLevelNodes = nodes[0].__children__; //only second level nodes are included and root node should be excluded 

                //close all second level nodes that have children by default
                secondLevelNodes.forEach(function (node) {
                    if (node.__children__) {
                        node.__expanded__ = false;
                    }
                });

                if (!slug && slug.trim().length === 0) {
                    return nodes;
                }

                if (ancestorIds && ancestorIds.length > 0) {
                    var ancestorIdsTemp = [];
                    ancestorIds.forEach(function(id){
                        ancestorIdsTemp.push(id);
                    });
                    this.expandNodesByIds(secondLevelNodes, ancestorIdsTemp);
                    ancestorIdsTemp = [];
                }
                
                //return expanded nodes
                return nodes;

            },
            /**
             * Checks the querystring for the category parameter and assign as the category slug
             * @param string defaultSlug the slug to assign if none found from the url
             * @returm string slug
             */
            getSlug: function (defaultSlug) {
                var queryString = $location.search(),
                    slug = queryString.category;
                if (!slug && defaultSlug) {
                    slug = defaultSlug;
                }
                return slug;
            },
            /**
             * Updates the url with new selected category's slug value
             * @param object node the selected node
             */
            updateCategoryUrl: function (node, queryString) {
                if (!queryString) {
                    queryString = 'category';
                }
                $location.url($location.path() + '?' + queryString + '=' + node.slug);
            },
            /**
             * This will retrieve categories by slug or given array of ids
             * @param array categories the collection of objects to search
             * @param string slug the slug to match within the collection of categories
             * @param array ids the collection of ids to match within the collection of categories
             * @returns array matches collection of objects 
             */
            getCategoriesByIdsOrSlug: function (categories, slug, ids) {
                var i, category, len = categories.length, matches = [];
                for (i = 0; i < len; i++) {
                    category = categories[i];

                    if (!category) {
                        continue;
                    }

                    if (ids.indexOf(category._id) > -1 || category.slug === slug) {
                        var obj = {
                            id: category._id,
                            name: category.name,
                            slug: category.slug
                        };
                        matches.push(obj);
                    }

                    //check if we found all the ids plus the slug match
                    if (matches.length === ids.length + 1) {
                        break;
                    }
                }
                return matches;
            },
            /**
             * Reconstruct slug as breadcrumb
             * @param array ids collection of ids of categories and needed to base the order/sequence of the breadcrumb items
             * @param string slug the current slug and the last category node on the breadcrumb
             * @param mixed categoryObjCollection collection of category objects that will compose the breadcrumb
             */
            createBreadCrumb: function (ids, slug, categoryObjCollection) {
                var categoryName = '', that = this;

                //loop through ids to get the correct sequence
                _.forEach(ids, function (id) {
                    var matchedObj = _.filter(categoryObjCollection, function (name) {
                        return name.id === id;
                    });
                    categoryName += that.createBreadCrumbUrl(matchedObj[0]);
                });

                //the last item
                var selectedCategoryName = _.find(categoryObjCollection, function (name) {
                    return name.slug === slug;
                });

                return categoryName + selectedCategoryName.name;
            },
            createBreadCrumbUrl: function (obj) {
                return '<a href="' + productListBaseUrl + '?' + paramName + '=' + obj.slug + '">' + obj.name + '</a>  &#62; ';
            },
            getBreadCrumb: function () {
                return breadCrumb;
            },
            /**
             * This will show the breadcrumb to the view
             * Example usage : <span ng-bind-html="breadCrumb"></span>
             * 
             * @param object scope the scope object on the controller
             * @param integer time delay for the update of the breadCrumb needed to sync the update if breadcrumb is displayed on a different controller or view
             */
            showBreadCrumb: function (scope, time) {
                if (!time) {
                    scope.breadCrumb = breadCrumb;
                    return undefined;
                }
                var promise = $timeout(function () {
                    scope.breadCrumb = breadCrumb;
                    $timeout.cancel(promise);
                }, time);
            },
            /**
             * Update the breadcrumb to the selected one
             * @param string slug the selected slug value 
             * @param array categories the collection of new category objects from the db
             * @param array ids collection of ids to form the breadcrumb (optional)
             */
            setBreadCrumb: function (slug, categories, ids) {
                if (!ids && categories) {
                    ids = this.getAncestorIds(categories, slug);
                }
                if (ids) {
                    var categoryNamesObj = this.getCategoriesByIdsOrSlug(categories, slug, ids),
                        newBreadCrumbs = this.createBreadCrumb(ids, slug, categoryNamesObj);

                    //broadcast the new breadcrumb to the listeners
                    breadCrumb = newBreadCrumbs.toLowerCase();
                }
            }
        };
    });