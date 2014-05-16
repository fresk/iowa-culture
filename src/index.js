var Vue = require('vue');
var director = require('director');
var elasticsearch = require('elasticsearch');
var fastclick = require('fastclick');
var screens = require('./screens');


function main(){
  fastclick(document.body);

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

window.map_reset = true;
}





// Wait for device API libraries to load
function onDeviceReady() {
  console.log("=== DEVICE READY =========================")
  if (window.StatusBar){
    StatusBar.overlaysWebView(false);
    StatusBar.hide();
  }
  main();
}


if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
  document.addEventListener("deviceready", onDeviceReady, false);
} else {
  main(); //this is the browser
}


