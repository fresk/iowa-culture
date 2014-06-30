var Vue = require('vue');
var _ = require('lodash');
var request = require("superagent");
var queries = require('../queries');


// EXPLORE /////////////////////////////////////////////////
Vue.component('explore', {
    template: require('../views/explore.html'),

    data: {
        "categories": require('../data/categories.json'),
        "selected": {},
        "selectAll": false,
        "groups": {
            'art': false,
            'history': false,
            'science': false
        },
        "groupSelectAll": {
            'art': false,
            'history': false,
            'science': false
        }
    },

    methods: {

        suggestAPlace: function() {
            window.location = "#/suggestaplace";
        },

        submit: function(msg, e) {
            //console.log("SUBMIT", this.selected);
            include_categories = _.keys(this.selected);
            app.selectedCategories = include_categories;

            queries.findLocationsWithCategory(include_categories, function(err, places) {
                //console.log(places);
                app.searchResults = places;
            });
            window.location = "#/search/limitlocation"
        },

        toggle: function(category) {
            if (this.selected[category]) this.selected.$delete(category);
            else this.selected.$add(category, true);
            return true
        },

        isSelected: function(category) {
            return this.selected[category] ? 'check' : 'unchecked';
        },

        isSelectAll: function(group) {
            return this.groupSelectAll[group] ? 'check' : 'unchecked';
        },

        toggleSelectAll: function(group, ev) {
            // console.log('toggle select all', group);
            if (group === "ALL") {
                this.selectAll = !this.selectAll;
                this.groupSelectAll['art'] = false;
                this.groupSelectAll['history'] = false;
                this.groupSelectAll['science'] = false;
                this.toggleSelectAll('art');
                this.toggleSelectAll('history');
                this.toggleSelectAll('science');
                if (ev) {
                    ev.stopPropagation();
                }
                return true;
            }
            this.groupSelectAll[group] = !this.groupSelectAll[group];
            if (this.groupSelectAll[group]) {
                _.forEach(this.categories[group], function(c) {
                    this.selected.$add(c, true);
                }, this)
            } else {
                _.forEach(this.categories[group], function(c) {
                    this.selected.$delete(c);
                }, this)
            }
            if (ev) {
                ev.stopPropagation();
            }

            // console.log(this.isSelectAll('art'));
            return true;
        },
    }
});



Vue.component('limit-location', {
    template: require('../views/limit-location-screen.html'),
    data: {
        query: "",
        showSpinner: false
    },
    methods: {
        showSearchResults: function(ev) {
            console.log("SEARCH RESULTS");
            if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            }
            // console.log("show search results");
            //window.location = "#/nearme";
            var bounds = L.latLngBounds([40, -97], [44, -90]);;
            queries.loadMarkersInBounds(bounds, function(err, places) {
                // console.log("QUERY", places);
                this.showSpinner = false;
                // console.log('settoing location', '/#/explore/locate');
                window.location = '/#/explore/locate';
            });
        },
        showQuerySearchResults: function() {
            console.log("QUERY RESULTS");
            // console.log("show search results");
            var url = "http://open.mapquestapi.com/nominatim/v1/search.php";
            //?&countrycodes=US&q=" + this.query + "+ia";
            this.showSpinner = true;
            request.get(url)
                .query({
                    countrycodes: 'US',
                    q: this.query + ", ia",
                    format: 'json'
                })
                .end(function(res) {
                    //console.log(res.body);
                    if (res.body.length == 0) {
                        return;
                    }
                    //console.log(res.body[0]);
                    if (res.body[0].boundingbox) {
                        //console.log(res.body[0].boundingbox, _.map(res.body[0].boundingbox, parseFloat))
                        var b = _.map(res.body[0].boundingbox, parseFloat);
                        var bounds = L.latLngBounds([
                            [b[0], b[2]],
                            [b[1], b[3]]
                        ]);
                        //console.log("search within", bounds.isValid(), bounds);

                        queries.loadMarkersInBounds(bounds, function(err, places) {
                            //console.log("QUERY", places);
                            this.showSpinner = false;
                            //console.log('settoing location', '/#/explore/locate')
                            window.location = '/#/explore/locate';
                        });
                        return
                    }
                });
            //window.location = "#/nearme";
        },
        showNearbySearchResults: function() {
            console.log("NEARBY RESULTS");
            this.showSpinner = true;

            queries.loadNearByMarkers(app.userLocation, function() {
                this.showSpinner = false;
                window.location = '/#/explore/locate';
                //window.location = "#/nearme";
            });
            //console.log("show search results");
        }


    }
});