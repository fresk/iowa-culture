
var _= require('lodash');
var mapbox = require('mapbox.js'); //attaches to window.L


exports.HomeScreen = {
  template: require('./views/home.html')
};


exports.ExploreScreen = {
  template: require('./views/explore.html'),

  data: {
    "selected": {},
    "groups": {
      'art': false,
      'history': false,
      'science': false
    },
    "groupSelectAll":{
      'art': false,
      'history': false,
      'science': false
    }
  },

  methods: {

    toggle: function(category){
      if(this.selected[category]) this.selected.$delete(category);
      else this.selected.$add(category, true);
      return true
    },

    isSelected: function(category){
      return this.selected[category] ? 'check' : 'unchecked';
    },

    isSelectAll: function(group){
      return this.groupSelectAll[group] ? 'check' : 'unchecked';
    },

    toggleSelectAll: function(group, ev){

      console.log("DDDD", this.groupSelectAll[group] )

      this.groupSelectAll[group] = ! this.groupSelectAll[group] ;


      console.log("XXX", this.groupSelectAll[group]);

      console.log("AAA", app.categories);
      if (this.groupSelectAll[group] ){
        _.forEach(app.categories[group], function(c){
          this.selected.$add(c, true);
        }, this)
      }
      else {
        _.forEach(app.categories[group], function(c){
          this.selected.$delete(c);
        }, this)
      }

      ev.stopPropagation();
      return true;

    },


  }


};

  exports.LocationListScreen = {
    template: require('./views/location_list.html')
  };


  exports.LocationScreen = {
    template: require('./views/location.html')
  };


  exports.MapScreen = {
    template: require('./views/map.html'),

    ready: function(){
      setTimeout(initMapView, 100);
    }

  };

  function initMapView(){
    L.mapbox.map('map', 'hansent.i1256a9l', {
      tileLayer: {detectRetina: true},
      zoomControl: false,
      attributionControl: false,
      updateWhenIdle:false
    })
  }
