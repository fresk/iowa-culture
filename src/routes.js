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

  "/nearme": function(){
    console.log("nearme");
    this.app.setRootView(screens.MapScreen);
  },

  "/explore": function(){
    console.log("EXPLORE");
    this.app.setRootView(screens.ExploreScreen);
  },

  "/explore/locate": function(){
    console.log("EXPLORE LOCATE", app.selected);
    this.app.setRootView(screens.LocationListScreen);

  },


  "/location/:id": function(uid){
    console.log("LOCATION", uid)
    app.context = this.app.getLocation(uid);
    console.log(app.contect, uid, app.getLocation(uid))
    app.setRootView(screens.LocationScreen);
  }



}






