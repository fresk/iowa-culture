var Vue = require('vue');
var VueTouch = require('vue-touch');
var fastclick = require('fastclick');
var director = require('director');
var $ = require('jquery');

Vue.use(VueTouch);
fastclick(document.body);


Vue.filter('ifTrue', function(value, check){
  if (check) return vale;
  return "";
});


module.exports = Vue.extend({

  created: function(){
    this.$router = new director.Router(this.$options.routes);
    this.$router.app = this;
    this.$router.init("/home");

    this.$data.rootView = null;
    this.$data.rootContext = null;
  },

  methods: {
    setRootView: function(viewConfig){
      if (this.rootView) this.rootView.$destroy();
      viewConfig.parent = this;
      viewConfig.replace = true;
      this.rootView = new Vue(viewConfig);
      this.rootView.$appendTo(this.$el);
    },

    setRoute: function(route){
      this.$router.setRoute(route);
    },

    callRoute: function(route){
      var routeFn = this.$options.routes[route];
      var args = Array.prototype.slice.call(arguments, 1);
      routeFn.apply(this.$router, args)
    }

  }

});








