var VueApp = require('./lib/vue-app');
var elasticsearch = require("elasticsearch");

window.es = new elasticsearch.Client({
  host: 'saskavi.com:9200',
  log: 'info'
});


window.app = new VueApp({

  el: "#app",

  routes: require('./routes'),

  data: require('./data'),

  ready: function() {
    this.$router.init("/home");
  }
});


document.addEventListener('deviceready', function() {
  if (window.StatusBar) StatusBar.hide();
});









