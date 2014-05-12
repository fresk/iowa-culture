var _ = require('lodash');
var screens = require('./screens');

module.exports = {

    "/back" : function(){
        // 2 because /back counts itself too
        window.history.go(-2);
    },


    "/home": function(){
        console.log("HOME");
        this.app.setRootView(screens.HomeScreen);
    },

    "/search": function(){
        console.log("SEARCH");
        this.app.setRootView(screens.SearchScreen);
    },


    "/search/results": function(){
        console.log("SEARCH RESULTS");
        console.log(app.searchResults);
        screens.LocationListScreen.data.listData = app.searchResults;
        this.app.setRootView(screens.LocationListScreen);
    },

    "/nearme": function(){
        console.log("nearme");
        //screens.MapScreen.data.listData = app.locations;
        this.app.setRootView(screens.MapScreen);
    },

    "/explore": function(){
        console.log("EXPLORE");
        this.app.setRootView(screens.ExploreScreen);
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
        screens.FeaturedScreen.data.listData = _.filter(app.locations, function(loc){
            return loc.featured == "true";
        })
        this.app.setRootView(screens.FeaturedScreen);
    },



    "/location/:id": function(uid){
        console.log("LOCATION", uid)
            //app.context = this.app.getLocation(uid);
            //console.log(app.contect, uid, app.getLocation(uid))
            app.context = _.find(app.locations, {_id: uid});
        app.setRootView(screens.LocationScreen);
    }

}






