var _ = require('lodash');
var sanitize = require('sanitize-caja');
var request = require("superagent");
var queries = require('./queries');
var utils = require('./utils');
var $ = require('jquery');


function dump(obj) {
    console.log(JSON.parse(JSON.stringify(obj)));
}

module.exports = {

    "/help": function() {
        // 2 because /back counts itself too
        //app.transition = 'slide-back';
        window.app.currentScreen = 'help';
    },


    "/back": function() {
        // 2 because /back counts itself too
        app.transition = 'slide-back';
        setTimeout(function() {
            window.history.go(-2);
        }, 100);
    },


    "/home": function() {
        //console.log("HOME");
        //this.app.setRootView(screens.HomeScreen);
        app.selectedCategories = [];
        window.map_reset = true;
        app.activeTab = 'home';
        window.app.currentScreen = 'home';
        setTimeout(function() {
            app.transition = 'slide'
        }, 1000);
    },

    "/suggestaplace": function() {
        //console.log("SEARCH RESULTS");
        //console.log(app.searchResults);
        //screens.LocationListScreen.data.listData = app.searchResults;
        //this.app.setRootView(screens.LocationListScreen);
        window.app.currentScreen = 'suggest-a-place';
    },


    "/suggestthankyou": function() {
        window.app.currentScreen = 'thankyou';

    },

    "/search": function() {
        //console.log("SEARCH");
        //this.app.setRootView(screens.SearchScreen);

        setTimeout(function() {
            // console.log("set focus");
            $("input").focus();
        }, 200);


        window.app.currentScreen = 'search';
    },

    "/search/limitlocation": function() {
        //console.log("SEARCH RESULTS");
        //console.log(app.searchResults);
        //screens.LocationListScreen.data.listData = app.searchResults;
        //this.app.setRootView(screens.LocationListScreen);
        window.app.currentScreen = 'limit-location';
    },



    "/search/results": function() {
        //console.log(app.searchResults);
        //screens.LocationListScreen.data.listData = app.searchResults;
        //this.app.setRootView(screens.LocationListScreen);
        //        app.activeTab = 'explore';
        console.log("SEARCH RESULTS");
        app.mapMode = 'search';
        window.app.currentScreen = 'map';
    },

    "/nearme": function() {

        //console.log("nearme");
        //screens.MapScreen.data.listData = app.locations;
        //this.app.setRootView(screens.MapScreen);
        app.mapMode = 'nearme';
        app.activeTab = 'explore';
        window.app.currentScreen = 'map';
    },


    "/explore": function() {
        //console.log("EXPLORE");
        //this.app.setRootView(screens.ExploreScreen);
        app.activeTab = 'explore';
        window.app.currentScreen = 'explore';
        // console.log("explore");
    },

    "/explore/locate": function() {
        // console.log('/explore/locate going to show map');
        //app.activeTab = 'explore';
        //alert("explore locate");
        app.mapMode = 'explore';
        window.app.currentScreen = 'map';
    },


    "/tours": function() {
        // console.log("TOURS");
        app.selectedCategories = [];
        app.activeTab = 'tours';
        app.currentScreen = 'tours';
    },

    "/tours/:id": function(id) {

        app.tourContext = _.find(app.myTours, {
            "id": id
        });
        // console.log("context", app.tourContext);
        app.currentScreen = 'tour-list';
    },


    "/tour-map/:id": function() {

        app.tourContext = _.find(app.myTours, {
            "id": id
        });
        // console.log("context", app.tourContext);
        app.mapMode = 'tour';
        app.currentScreen = 'map';
    },





    "/featured": function() {
        app.selectedCategories = [];
        // console.log("FEATURED");
        //app.searchResults = app.featuredLocations;
        queries.findFeaturedLocations(function(err, places) {
            app.featuredLocations = places;
            app.activeTab = 'featured';
            app.currentScreen = 'featured';
        });

    },



    "/feature_tour/:slug": function(slug) {
        app.selectedCategories = [];
        // console.log("FEATURED");
        //app.searchResults = app.featuredLocations;
        app.selectedFeaturedTour = _.find(app.featuredTourList, function(t) {
            console.log("tour", utils.makePlain(t));

            return t.slug == slug;
        });
        queries.findFeaturedTour(slug, function(err, places) {
            console.log("fetured places", utils.makePlain(places))
            app.featuredLocations = places;
            app.activeTab = 'featured';
            app.currentScreen = 'featured-tour';
        });

    },


    "/location/:id": function(uid) {
        // console.log("LOCATION", uid);

        queries.getPlaceByID(uid, function(err, p) {
            if (err) console.log("ERROE", err, p);
            app.detailLocationData = p;
            app.context = p.properties;
            app.currentScreen = "location-detail";
        });


    }

}