var _ = require('lodash');
var sanitize = require('sanitize-caja');
var request = require("superagent");
var queries = require('./queries');
var $ = require('jquery');


module.exports = {

    "/back" : function(){
        // 2 because /back counts itself too
        app.transition = 'slide-back';
        setTimeout(function(){
            window.history.go(-2);
        }, 100);
    },


    "/home": function(){
        //console.log("HOME");
        //this.app.setRootView(screens.HomeScreen);
        app.selectedCategories = [];
        window.map_reset = true;
        app.activeTab = 'home';
        window.app.currentScreen = 'home';
        setTimeout(function(){app.transition='slide'}, 1000);
    },

    "/suggestaplace": function(){
        //console.log("SEARCH RESULTS");
        //console.log(app.searchResults);
        //screens.LocationListScreen.data.listData = app.searchResults;
        //this.app.setRootView(screens.LocationListScreen);
        window.app.currentScreen = 'suggest-a-place';
    },


    "/suggestthankyou": function(){
        window.app.currentScreen = 'thankyou';

    },

    "/search": function(){
        //console.log("SEARCH");
        //this.app.setRootView(screens.SearchScreen);
        
        setTimeout(function(){
            console.log("set focus");
            $("input").focus();
        }, 200);


        window.app.currentScreen = 'search';
    },

    "/search/limitlocation": function(){
        //console.log("SEARCH RESULTS");
        //console.log(app.searchResults);
        //screens.LocationListScreen.data.listData = app.searchResults;
        //this.app.setRootView(screens.LocationListScreen);
        window.app.currentScreen = 'limit-location';
    },



    "/search/results": function(){
        //console.log("SEARCH RESULTS");
        //console.log(app.searchResults);
        //screens.LocationListScreen.data.listData = app.searchResults;
        //this.app.setRootView(screens.LocationListScreen);
        window.app.currentScreen = 'location-list';
    },

    "/nearme": function(){

        //console.log("nearme");
        //screens.MapScreen.data.listData = app.locations;
        //this.app.setRootView(screens.MapScreen);
        app.activeTab = 'explore';
        window.app.currentScreen = 'map';
    },

    "/explore": function(){
        //console.log("EXPLORE");
        //this.app.setRootView(screens.ExploreScreen);
        app.activeTab = 'explore';
        window.app.currentScreen = 'explore';
        console.log("explore");
    },

    "/explore/locate": function(){

        include_categories = _.keys(app.rootView.selected);



        //var result = _.filter(app.locations, function(loc){
        //return _.any(loc.categories, function(cat){
        //return _.contains(include_categories, cat);
        //});
        //});

        //console.log("EXPLORE LOCATE", result, include_categories);

        //screens.LocationListScreen.data.listData = result;
        //this.app.setRootView(screens.LocationListScreen);
        //this.app.rootView.listData = result;

    },

    "/tours": function(){
        console.log("TOURS");
        app.selectedCategories = [];
        app.activeTab = 'tours';
        app.currentScreen = 'tours';
    },

    "/tours/:id": function(id){

        app.tourContext = _.find(app.myTours, {"id": id});
        console.log("context", app.tourContext);
        app.currentScreen = 'tour-list';
    },



    "/featured": function(){
        app.selectedCategories = [];
        console.log("FEATURED");
        app.activeTab = 'featured';
        app.currentScreen = 'featured';
    },


    "/location/:id": function(uid){
        console.log("LOCATION", uid);

        queries.getPlaceByID(uid, function(err, p){
            if(err) console.log("ERROE", err, p);
            app.context = p.properties;
            app.currentScreen = "location-detail";
        });


    }

}






