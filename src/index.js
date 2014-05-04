var VueApp = require('./lib/vue-app');

window.app = new VueApp({
  el: "#app",
  routes: require('./routes'),
  data: require('./data'),
});


document.addEventListener('deviceready', function() {
  if (window.StatusBar) StatusBar.hide();
});








