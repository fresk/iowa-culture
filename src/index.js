var VueApp = require('./lib/vue-app');
var _ = require('lodash');

window.app = new VueApp({
  el: "#app",

  routes: require('./routes'),

  data: require('./data'),

  methods: {
    getLocation: function(location_id){
      return _.find(this.locations, function(loc){
        return loc._id == location_id;
      });
    }
  }

});


document.addEventListener('deviceready', function() {
  if (window.StatusBar) StatusBar.hide();
});








