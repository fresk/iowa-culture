var Vue = require('vue');
var $ = require('jquery');
var _ = require('lodash');
var queries = require('../queries');
var uuid = require('uuid');


// FEATURED /////////////////////////////////////////////////
Vue.component('featured', {
    template: require('../views/featured.html'),

    methods: {

        addToTour: function(ev) {

            app.selectedLocationId = ev.targetVM.properties._id;

            this.showAddToTour = true;
        },

        addFeaturedTour: function(ev) {


            console.log("add to tours:", ev.targetVM.slug);
            var create = confirm("Do you want to add a new Tour based on '" + ev.targetVM.title + "' ?");
            console.log(create);
            if (create) {

                queries.findFeaturedTour(ev.targetVM.slug, function(err, places) {
                    app.myTours.push({
                        id: uuid.v4(),
                        title: ev.targetVM.title,
                        color: "#3A4050",
                        places: places
                    });
                    window.location = "#/tours"
                });
                //this.showAddToTour = true;
            }
        },

        sortByName: function() {
            app.searchResults = _.sortBy(app.searchResults, function(place) {
                return place.properties.title;
            });
            this.hideSortMenu();
        },

        sortByDistance: function() {
            app.searchResults = _.sortBy(app.searchResults, function(place) {
                return place._distance;
            });
            this.hideSortMenu();

        },

        sortByCategory: function() {
            app.searchResults = _.sortBy(app.searchResults, function(place) {
                return place.properties.icon.iconUrl;
            });
            this.hideSortMenu();
        },

        showInMapView: function() {
            app.mapMode = 'featured';
            app.currentScreen = 'map';
        },


        showSortMenu: function() {
            if ($(".sort-order-option-box").hasClass("show-sort")) {
                return this.hideSortMenu();
            }
            $(".sort-order-option-box").addClass("show-sort");
        },

        hideSortMenu: function() {
            $(".sort-order-option-box").removeClass("show-sort");
            console.log("hideSortMenu");
        },



    }
});




Vue.component('featured-tour', {
    template: require('../views/featured-tour.html'),

    methods: {

        addToTour: function(ev) {

            app.selectedLocationId = ev.targetVM.properties._id;

            this.showAddToTour = true;
        },

        addFeaturedTour: function(ev) {

            ev.targetVM.properties.slug;
            console.log("add to tours:", ev.targetVM.properties.slug);
            //this.showAddToTour = true;
        },

        sortByName: function() {
            app.featuredLocations = _.sortBy(app.featuredLocations, function(place) {
                return place.properties.title;
            });
            this.hideSortMenu();
        },

        sortByDistance: function() {
            app.featuredLocations = _.sortBy(app.featuredLocations, function(place) {
                return place._distance;
            });
            this.hideSortMenu();

        },

        sortByCategory: function() {
            app.featuredLocations = _.sortBy(app.featuredLocations, function(place) {
                return place.properties.icon.iconUrl;
            });
            this.hideSortMenu();
        },

        showInMapView: function() {
            app.mapMode = 'featured';
            app.currentScreen = 'map';
        },


        showSortMenu: function() {
            if ($(".sort-order-option-box").hasClass("show-sort")) {
                return this.hideSortMenu();
            }
            $(".sort-order-option-box").addClass("show-sort");
        },

        hideSortMenu: function() {
            $(".sort-order-option-box").removeClass("show-sort");
            console.log("hideSortMenu");
        },



    }
});