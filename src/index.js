var Vue = require('vue');
var director = require('director');
var elasticsearch = require('elasticsearch');
var fastclick = require('fastclick');
var screens = require('./screens');


function main(){
  //router
  window.router =  new director.Router(require('./routes'));


  //elastic search backend
  window.es = new elasticsearch.Client({
    host: 'iowaculture.fresk.io:9200',
    log: 'info'
  });


  //our main view controller
  window.app = new Vue({
    el: '#app',

    data: {
      userLocaton: null,
      showMap: false,
      currentScreen: 'home',
      searchResults: [],
      context: {}
    },

    ready: function(){
      window.router.init("/home");

    }
  });
}





// Wait for device API libraries to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// device APIs are available
//
function onDeviceReady() {

  fastclick(document.body);
  if (window.StatusBar)
    StatusBar.hide();

  main();

  navigator.geolocation.getCurrentPosition(onSuccess, onError);
  // onSuccess Geolocation
  function onSuccess(position) {
    app.userLocaton = position
  }
  // onError Callback receives a PositionError object
  function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
  }
}





