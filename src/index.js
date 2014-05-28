var Vue = require('vue');
var director = require('director');
var elasticsearch = require('elasticsearch');
var fastclick = require('fastclick');
var screens = require('./screens');
var queries = require('./queries');






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
            currentScreen: getParameterByName('screen') || 'home',

            categories: require('./data/categories.json'),
            shades: require('./data/shades.json'),
            colors: require('./data/colors.json'),
            markers: require('./data/markers.json'),

            searchResults: [],
            featuredLocations: [],
            
            userLocaton: null,
            showMap: false,
            
            myTours: [],
            context: {},
        },

        ready: function(){
            window.router.init("/"+this.currentScreen);


            queries.findFeaturedLocations(function(err, places){
                console.log(places);
                app.featuredLocations = places;
            });

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



function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
