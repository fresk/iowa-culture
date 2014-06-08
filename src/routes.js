var _ = require('lodash');
var sanitize = require('sanitize-caja');
var request = require("superagent");
var queries = require('./queries')

module.exports = {

    "/back" : function(){
        // 2 because /back counts itself too
        window.history.go(-2);
    },


    "/home": function(){
        //console.log("HOME");
        //this.app.setRootView(screens.HomeScreen);
        window.map_reset = true;
        app.activeTab = 'home';
        window.app.currentScreen = 'home';
    },

    "/search": function(){
        //console.log("SEARCH");
        //this.app.setRootView(screens.SearchScreen);
        window.app.currentScreen = 'search';
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
        app.activeTab = 'tours';
        app.currentScreen = 'tours';
    },

    "/featured": function(){
        console.log("FEATURED");
        app.activeTab = 'featured';
        app.currentScreen = 'featured';
    },


    "/location/:id": function(uid){
        console.log("LOCATION", uid);
        app.context = window.es.get({
            index: 'dca',
            type: 'location',
            id: uid
        }, function(err, response){
            //console.log(response._source.properties);
            var p = response._source;
            for( var i=0; i < p.properties.categories.length; i++){
                var cat = p.properties.categories[i];
                if (app.markers[cat]){
                    icon = "img/markers/512/"+app.markers[cat]+".png";
                    console.log(icon);
                    p.properties.icon = {
                        "iconUrl": icon,
                        "iconSize": [32, 32],
                        "iconAnchor": [15, 15],
                        "popupAnchor": [0, -20],
                        "className": "dca-marker",
                        "color": app.colors[cat]
                    }
                }
            }




            var data = p.properties;
            data.description = sanitize(data.description);
            app.context = data;
            app.currentScreen = "location-detail";
        });

    }

}






