var _ = require('lodash');

module.exports = {

    "/back" : function(){
        // 2 because /back counts itself too
        window.history.go(-2);
    },


    "/home": function(){
        //console.log("HOME");
        //this.app.setRootView(screens.HomeScreen);
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
        window.app.currentScreen = 'map';
    },

    "/explore": function(){
        //console.log("EXPLORE");
        //this.app.setRootView(screens.ExploreScreen);
        window.app.currentScreen = 'explore';
        console.log("explore");
    },

    "/explore/locate": function(){

        include_categories = _.keys(app.rootView.selected);
        var result = _.filter(app.locations, function(loc){
            return _.any(loc.categories, function(cat){
                return _.contains(include_categories, cat);
            });
        });

        console.log("EXPLORE LOCATE", result, include_categories);

        screens.LocationListScreen.data.listData = result;
        this.app.setRootView(screens.LocationListScreen);
        //this.app.rootView.listData = result;

    },

    "/tours": function(){
        console.log("TOURS");
        screens.ToursScreen.data.listData = _.filter(app.locations, function(loc){
            return false;
        })
        this.app.setRootView(screens.ToursScreen);
    },

    "/featured": function(){
        console.log("FEATURED");
        app.currentScreen = 'featured';
    },



    "/location/:id": function(uid){
        console.log("LOCATION", uid);
        app.context = window.es.get({
          index: 'dca',
          type: 'location',
          id: uid
        }, function(err, response){
          console.log(response)
          app.context = response._source.properties;
          console.log(app.context);
          app.currentScreen = "location-detail";
        });

    }

}






