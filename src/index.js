var Vue = require('vue');
var director = require('director');
var elasticsearch = require('elasticsearch');
var fastclick = require('fastclick');
var screens = require('./screens');
var queries = require('./queries');
var uuid = require('uuid');
var $ = require('jquery');







function main(){

    //remove any delay between touchstart and click event
    fastclick(document.body);

    //router
    window.router =  new director.Router(require('./routes'));

    //elastic search backend
    window.es = new elasticsearch.Client({
        host: 'iowaculture.fresk.io:9200',
        log: 'info'
    });

    //tours / user data is stored in loca storage
    var defaultTourData = [{
        id: "favorites",
        title: "Favorites",
        color: "#7c6f63",
        places: []
    }];
    var tourData = JSON.parse(localStorage.getItem("tours") || JSON.stringify(defaultTourData));

    var initialScreen = getParameterByName('screen') || 'home';
    console.log(initialScreen);






    //our main view controller
    window.app = new Vue({
        el: '#app',

        data: {
            activeTab: 'home',
            transition: 'slide',
            currentScreen: initialScreen,//'suggest-a-place', //getParameterByName('screen') || 'home',

            categories: require('./data/categories.json'),
            shades: require('./data/shades.json'),
            colors: require('./data/colors.json'),
            markers: require('./data/markers.json'),

            searchResults: [],
            selectedCategories: [],
            featuredLocations: [],

            userLocation: null,
            showMap: false,

            myTours: tourData,
            activeTour: null,
            tourContext: {},
            context: {},


        },

        ready: function(){

            navigator.geolocation.getCurrentPosition(
                function(position){
                    window.app.userLocation = {
                        'lat': position.coords.latitude,
                        'lon': position.coords.longitude
                    };

                    window.app.userLatLng =  L.latLng(
                        position.coords.latitude,
                        position.coords.longitude
                    );          
                    console.log("user location", window.app.userLocation)
                }, 
                function onError(error) {
                    alert('code: '+error.code + '\nmessage: ' + error.message + '\n');
                }    
            );   



            window.router.init("/"+this.currentScreen);
            setTimeout(function(){
                queries.findFeaturedLocations(function(err, places){
                    console.log(places);
                    app.featuredLocations = places;
                });
            }, 1000);


        },

        methods: {
            saveTours: function(){
                localStorage.setItem("tours", JSON.stringify(app.myTours));
                console.log(localStorage.getItem('tours'));
            },


        }

    });

    console.log("APP", window.app);


    window.map_reset = true;
}





// Wait for device API libraries to load
function onDeviceReady() {
    console.log("=== DEVICE READY =========================");
    if (window.StatusBar){
        StatusBar.overlaysWebView(false);
        StatusBar.hide();
    }
    main();
}


// ONLY USED TO START ON SPECIFIC SCFEEN WHILE DEVELOPING
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


// if not on an actual device...just run main (to allow testing in chrome)
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
    document.addEventListener("deviceready", onDeviceReady, false);
} else {
    main(); //this is the browser
}













