
var Vue = require('vue');
var _ = require('lodash');
var request = require("superagent");
var es = require("elasticsearch");
var $ = require('jquery');
var queries = require('./queries');
var uuid = require('uuid');
//require('./lib/leaflet/leaflet'); //attaches to window.L
//require('./lib/leaflet/bouncemarker'); //attaches to window.L
//require('./lib/leaflet/leaflet.restoreview'); //attaches to window.L//
//L.Icon.Default.imagePath = "./lib/leaflet/images"
require('./lib/leaflet/leaflet.usermarker'); //attaches to window.L




// HOME /////////////////////////////////////////////////
Vue.component('home', {
    template: require('./views/home.html')
});



// MY TOURS /////////////////////////////////////////////////
Vue.component('screenMenuTabs', {
    replace: true,
    template: require('./views/screenMenuTabs.html'),
    data: {
    },
    methods: {
    }
});



Vue.component('limit-location', {
    template: require('./views/limit-location-screen.html'),
    methods: {
        showSearchResults: function(){
            console.log("show search results");
            window.location = "#/nearme";
        },
        showNearbySearchResults: function(){
            console.log("show search results");
            window.location = "#/nearme";
        }

        
    }
});


Vue.component('thankyou', {
    template: require('./views/thankyou.html'),
    methods: {
        goHome: function(){
            window.location = "#/home";
        }
    }
});



Vue.component('suggest-a-place', {
    template: require('./views/suggest-a-place.html'),
    data: {
        showLoadingSpinner: false
    },
    methods: {
        submitSuggestion: function(){
            this.showLoadingSpinner = true;
            console.log("submitSuggestedPlace");
            var data = {
                title: $("#input-title").val(),
                address: $("#input-address").val(),
                city: $("#input-city").val(),
                zip: $("#input-zip").val(),
                submitter_name: $("#input-submitter").val(),
            };

            request.post('http://iowaculture.fresk.io:8080/app/suggest')
                .send(data)
                .end(function(error, res){
                });

            window.location = "#/suggestthankyou";


        }
    }
});









// SEARCH /////////////////////////////////////////////////
Vue.component('search', {
    template: require('./views/search.html'),
    data: {
        query: "",
        showSpinner: false,
        showResults: false,
        numHits: 0
    },
    attach: function() {
        this.showSpinner = false;
        this.showResults = false;
    },
    methods: {
        doSearch: function() {
            this.showSpinner = true;
            var elastic_query = "http://saskavi.com:9200/dca/_search?size=2000&q=" + this.query;
            var self = this;

            //window.es.search({
            queries.searchLocations({
                q: this.query,
                size: 100
            }, function(err, res) {
                //self.numHits = res.hits.total;
                self.showSpinner = false;
                //self.showResults = true;
                app.searchResults = _.pluck(res.hits.hits, "_source");
                window.location = "/#/search/results";
            });
        }
    }
});



// EXPLORE /////////////////////////////////////////////////
Vue.component('explore', {
    template: require('./views/explore.html'),

    data: {
        "categories": require('./data/categories.json'),
        "selected": {},
        "selectAll": false,
        "groups": {
            'art': false,
            'history': false,
            'science': false
        },
        "groupSelectAll": {
            'art': false,
            'history': false,
            'science': false
        }
    },

    methods: {

        suggestAPlace: function(){
            window.location = "#/suggestaplace";
        },

        submit: function (msg, e) {
            //console.log("SUBMIT", this.selected);
            include_categories = _.keys(this.selected);
            app.selectedCategories = include_categories;

            queries.findLocationsWithCategory(include_categories, function(err, places){
                //console.log(places);
                app.searchResults = places;
            });
            window.location = "#/search/limitlocation"
        },

        toggle: function(category) {
            if (this.selected[category]) this.selected.$delete(category);
            else this.selected.$add(category, true);
            return true
        },

        isSelected: function(category) {
            return this.selected[category] ? 'check' : 'unchecked';
        },

        isSelectAll: function(group) {
            return this.groupSelectAll[group] ? 'check' : 'unchecked';
        },

        toggleSelectAll: function(group, ev) {
            console.log('toggle select all', group);
            if (group === "ALL"){
                this.selectAll = !this.selectAll;
                this.groupSelectAll['art'] = false;
                this.groupSelectAll['history'] = false;
                this.groupSelectAll['science'] = false;
                this.toggleSelectAll('art');
                this.toggleSelectAll('history');
                this.toggleSelectAll('science');
                if (ev){
                    ev.stopPropagation();
                }
                return true;
            }
            this.groupSelectAll[group] = !this.groupSelectAll[group] ;
            if (this.groupSelectAll[group]) {
                _.forEach(this.categories[group], function(c) {
                    this.selected.$add(c, true);
                }, this)
            } else {
                _.forEach(this.categories[group], function(c) {
                    this.selected.$delete(c);
                }, this)
            }
            if (ev){
                ev.stopPropagation();
            }

            console.log(this.isSelectAll('art'));
            return true;
        },
    }
});


// LOCATION LIST /////////////////////////////////////////////////
Vue.component('location-list', {
    template: require('./views/location_list.html'),

    data: {
        showAddToTour: false,
        searchField: null,
        selectedPlace: null
    },

    methods: {
    
        addToTour: function(place){
            jsonData = JSON.stringify(place.$data);
            this.selectedPlace = JSON.parse(jsonData);
            this.showAddToTour = true;
        },

        sortByName: function(){
            app.searchResults = _.sortBy(app.searchResults, function(place){
                return place.properties.title;
            });
            this.hideSortMenu();
        },
        
        sortByDistance: function(){
            app.searchResults = _.sortBy(app.searchResults, function(place){
                return place._distance;
            });
            this.hideSortMenu();

        },

        sortByCategory: function(){
            app.searchResults = _.sortBy(app.searchResults, function(place){
                return place.properties.icon.iconUrl;
            });
            this.hideSortMenu();
        },

        showInMapView: function(){
            app.currentScreen = 'map';
        },


        showSortMenu: function(){
            $(".sort-order-option-box").addClass("show-sort");
        },

        hideSortMenu: function(){
            $(".sort-order-option-box").removeClass("show-sort");
            console.log("hideSortMenu");
        }

    
    }
});


// LOCATION DETAIL /////////////////////////////////////////////////
Vue.component('location-detail', {
    template: require('./views/location_detail.html'),

    computed: {
        preview_image: function(){
            if (app.context.images.length > 0 && app.context.images[0].length > 2)
                return app.context.images[0];

            console.log(app.context);
            return app.context.icon.iconUrl;
        },
        preview_image_class: function(){
            if (app.context.images.length > 0 && app.context.images[0].length > 2)
                return "icon-photo";
            return "icon-preview";
        }
    }
});




// MY TOURS /////////////////////////////////////////////////
Vue.component('tours', {
    template: require('./views/tours.html'),

    data: {
        showCreateTour: false,
    },
    methods: {
        createTour: function(){
            this.showCreateTour = true;
        },

        showTour: function(id){
            window.location = "#/tours/"+id;
        }
    }
});

Vue.component('tour-list', {
    template: require('./views/tour-list.html'),
    methods: {
        showDetailView: function(data, ev){
            console.log(data.properties._id);
            window.location = "#/location/"+data.properties._id;
        }
    
    }
});






Vue.component('add-tour-overlay', {
    template: require('./views/tours-overlay.html'),
    replace: true,
    data: {
        title: "",
        color: "#B4D588",
    },
    methods: {
        selectColor: function(color, ev){
            console.log(color, ev);
            console.log(ev.target.id);
            this.color = color;
            //$(".add-tour-color-choice").css("border",0);
            //$(ev.target).css("border", "2px solid #fff");
            ev.preventDefault();
        },
        cancel: function(ev){
            ev.preventDefault();
            this.$parent.showCreateTour = false;
        },
        create: function(ev){
            ev.preventDefault();
            app.myTours.push({
                id: uuid.v4(),
                title: this.title,
                color: this.color,
                places: []
            });
            this.$parent.showCreateTour = false;
            app.saveTours();
        }
    }
});


Vue.component('add-to-tour-overlay', {
    template: require('./views/add-to-tours-overlay.html'),
    replace: true,
    data: {
        selectedTours: {},
    },
    methods: {
        add: function(ev){
            ev.preventDefault();
            this.$parent.showAddToTour = false;
            var self = this;
            _.each(app.myTours, function(tour){
                if (self.tourIsSelected(tour.id)){
                    console.log("add to tour:", tour.title,  self.$parent.selectedPlace);
                    tour.places.push(self.$parent.selectedPlace);
                }
            });
            app.saveTours();
        },

        cancel: function(ev){
            ev.preventDefault();
            this.$parent.showAddToTour = false;
            this.selectedTours = {};
        },

        tourIsSelected: function(id){
            console.log("is selected?", this.selectedTours[id] );
            return this.selectedTours[id] == true;
        },
        toggleTourSelection: function(id){
            console.log("toggle", this.selectedTours[id] , !this.selectedTours[id] );
            if(this.selectedTours[id] === undefined)
               this.selectedTours.$add(id, false);               
            this.selectedTours[id]  = !this.selectedTours[id] ;
        }
    }
});






// FEATURED /////////////////////////////////////////////////
Vue.component('featured', {
    template: require('./views/featured.html'),
});



Vue.component('map', {
    template: require('./views/map.html'),

    data: {
        map: null,
        userMarker: null
    },

    attached: function() {
        var map_widget = this.$el.querySelector(".map-widget");
        Vue.nextTick(function(){
            initMap(map_widget);
        });
    },

    methods: {
        locateUser: function(){
            map.locate({
                watch: false,
                locate: true,
                setView: true,
                enableHighAccuracy: true,
                maxZoom: 16
            });
        },

        showInListView: function(){
            app.currentScreen = "location-list";
        }
    }
});





function initMap(el){
    window.map = L.mapbox.map(el, 'hansent.i7jbkp90', {
        zoomControl: false,
        tileLayer: {
            detectRetina: true,
            retinaVersion: 'hansent.i7jbkp90',
            updateWhenIdle: false
        }
    });

    map.restoreView();

    map.on("dragend", onMapDragEnd);
    map.on("zoomend", onMapDragEnd);

    window.oldMarkerLookup = {};
    window.markerLayer = L.mapbox.featureLayer();
    markerLayer.addTo(map);

    // Customize each added layer
    markerLayer.on('layeradd', function(e) {
        var marker = e.layer;
        marker.setIcon(L.icon(marker.properties.icon));
        marker._icon.className += " .marker-fade-in"; 
    });

    markerLayer.on('click', function(e) {
        e.layer.openPopup();
    });


    window.gotoUser = false;
    if(window.map_reset){
        window.gotoUser = true;
        window.map_reset = false;
    }

    map.on("locationfound", updateUserLocation);
    map.locate({
        watch: false,
        locate: true,
        setView: gotoUser,
        enableHighAccuracy: true,
        maxZoom: 16
    });

}


function onMapDragEnd(e){
    setTimeout(function(){
        queries.loadMarkersInBounds(map.getBounds(), function(err, places){
            setTimeout(function(){
                //window.oldMarkerLookup = {};
                _.forEach(places, function(p){
                    window.oldMarkerLookup[p.properties._id] = 1;
                });
            },500);
        });
    },50)
}


function updateUserLocation(location){
    window.userMarker = L.userMarker(location.latlng, {
        pulsing:true,
        accuracy:100,
        smallIcon:true
    });
    window.userMarker.addTo(map);
    window.userMarker.setLatLng(location.latlng);
    window.userMarker.setAccuracy(location.accuracy);

    onMapDragEnd();
}


function centerOnUser(location){

    queries.loadNearByMarkers(location.latlng, function(err, places){

    })
}




var RestoreViewMixin = {
    restoreView: function () {
        var storage = window.localStorage || {};
        if (!this.__initRestore) {
            this.on('moveend', function (e) {
                if (!this._loaded)
                    return;  // Never access map bounds if view is not set.

                var view = {
                    lat: this.getCenter().lat,
                    lng: this.getCenter().lng,
                    zoom: this.getZoom()
                };
                storage['mapView'] = JSON.stringify(view);
            }, this);
            this.__initRestore = true;
        }

        var view = storage['mapView'];
        try {
            view = JSON.parse(view || '');
            this.setView(L.latLng(view.lat, view.lng), view.zoom, true);
            return true;
        }
        catch (err) {
            return false;
        }
    }
};

L.Map.include(RestoreViewMixin);








//Retain the value of the original onAdd and onRemove functions
//var originalOnAdd = L.Marker.prototype.onAdd;
//var originalOnRemove = L.Marker.prototype.onRemove;

//Add bounceonAdd options
//L.Marker.mergeOptions({
//bounceOnAdd: true,
//bounceOnAddOptions: {
//duration: 1000,
//height: -1
//},
//bounceOnAddCallback: function() {},
//});

//L.Marker.include({

//_toPoint: function (latlng) {
//return this._map.latLngToContainerPoint(latlng);
//},
//_toLatLng: function (point) {
//return this._map.containerPointToLatLng(point);
//},

//_motionStep: function (opts) {
//var self = this;

//var start = new Date();
//self._intervalId = setInterval(function () {
//var timePassed = new Date() - start;
//var progress = timePassed / opts.duration;
//if (progress > 1) {
//progress = 1;
//}
//var delta = opts.delta(progress);
//opts.step(delta);
//if (progress === 1) {
//opts.end();
//clearInterval(self._intervalId);
//}
//}, opts.delay || 10);
//},

//_bounceMotion: function (delta, duration, callback) {
//var original = L.latLng(this._origLatlng),
//start_y = this._dropPoint.y,
//start_x = this._dropPoint.x,
//distance = this._point.y - start_y;
//var self = this;

//this._motionStep({
//delay: 10,
//duration: duration || 1000,  1 sec by default
//delta: delta,
//step: function (delta) {
//self._dropPoint.y =
//start_y
//+ (distance * delta)
//- (self._map.project(self._map.getCenter()).y - self._origMapCenter.y);
//self._dropPoint.x =
//start_x
//- (self._map.project(self._map.getCenter()).x - self._origMapCenter.x);
//self.setLatLng(self._toLatLng(self._dropPoint));
//},
//end: function () {
//self.setLatLng(original);
//if (typeof callback === "function") callback();
//}
//});
//},

//Many thanks to Robert Penner for this function
//_easeOutBounce: function (pos) {
//if ((pos) < (1 / 2.75)) {
//return (7.5625 * pos * pos);
//} else if (pos < (2 / 2.75)) {
//return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
//} else if (pos < (2.5 / 2.75)) {
//return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
//} else {
//return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
//}
//},

//Bounce : if options.height in pixels is not specified, drop from top.
//If options.duration is not specified animation is 1s long.
//bounce: function(options, endCallback) {
//this._origLatlng = this.getLatLng();
//this._bounce(options, endCallback);
//},

//_bounce: function (options, endCallback) {
//if (typeof options === "function") {
//endCallback = options;
//options = null;
//}
//options = options || {duration: 1000, height: -1};

//backward compatibility
//if (typeof options === "number") {
//options.duration = arguments[0];
//options.height = arguments[1];
//}

//Keep original map center
//this._origMapCenter = this._map.project(this._map.getCenter());
//this._dropPoint = this._getDropPoint(options.height);
//this._bounceMotion(this._easeOutBounce, options.duration, endCallback);
//},

//This will get you a drop point given a height.
//If no height is given, the top y will be used.
//_getDropPoint: function (height) {
//Get current coordidates in pixel
//this._point = this._toPoint(this._origLatlng);
//var top_y;
//if (height === undefined || height < 0) {
//top_y = this._toPoint(this._map.getBounds()._northEast).y;
//} else {
//top_y = this._point.y - height;
//}
//return new L.Point(this._point.x, top_y);
//},

//onAdd: function (map) {
//if(this.feature){
//console.log("adding marker for ", this.feature.properties._id);
//var _id = this.feature.properties._id;
//if (window.oldMarkerLookup[_id]){
//this.options.bounceOnAdd = false;
//}
//}
//this._map = map;
//Keep original latitude and longitude
//this._origLatlng = this._latlng;

//We need to have our drop point BEFORE adding the marker to the map
//otherwise, it would create a flicker. (The marker would appear at final
//location then move to its drop location, and you may be able to see it.)
//if (this.options.bounceOnAdd === true ) {
//backward compatibility
//if (typeof this.options.bounceOnAddDuration !== 'undefined') {
//this.options.bounceOnAddOptions.duration = this.options.bounceOnAddDuration;
//}

//backward compatibility
//if (typeof this.options.bounceOnAddHeight !== 'undefined') {
//this.options.bounceOnAddOptions.height = this.options.bounceOnAddHeight;
//}

//this._dropPoint = this._getDropPoint(this.options.bounceOnAddOptions.height);
//this.setLatLng(this._toLatLng(this._dropPoint));
//}

//Call leaflet original method to add the Marker to the map.
//originalOnAdd.call(this, map);

//if (this.options.bounceOnAdd === true) {
//this._bounce(this.options.bounceOnAddOptions, this.options.bounceOnAddCallback);
//}
//},

//onRemove: function (map) {
//clearInterval(this._intervalId);
//originalOnRemove.call(this, map);
//}
//});







//window.es.search(q, function(err, res) {
//});

/*
   var q = {
   "index": "dca",
   "type": "location",
   "body": {
   "sort": [{
   "_geo_distance": {
   "location.loc.coordinates": [-91.629, 41.75],
   "unit": "mi",
   "order" : "asc"

   }
   }],
   "size": 10
   }
   };
   */














/*
   function locationMarker(loc) {
   return new L.Marker([loc.loc.coordinates[1], loc.loc.coordinates[0]], {
title: loc.title,
icon: "home",
markerColor: "orange",
alt: loc.title,
bounceOnAdd: true,

});

}




function setMarkers(places) {

}


function initMapView() {

var map = L.map('map');

var mapboxid = 'https://{s}.tiles.mapbox.com/v3/hansent.i1256a9l/{z}/{x}/{y}.png';
var mapboxTiles = L.tileLayer(mapboxid).addTo(map);


//var markers = new L.MarkerClusterGroup({
//	maxClusterRadius: 20,
//
//});
//
//
//



_.forEach(places, function(item) {
var latlng = L.latLng(item.loc.coordinates[1], item.loc.coordinates[0]);
var m = new L.Marker(latlng, {
title: item.title
});
m.bindPopup('<a href="#/location/' + item._id + '" >' + item.title + '</a>');
m.addTo(map);
})

var userMarker = null;
map.on("locationfound", function(location) {
if (!userMarker) {
var opts = {
pulsing: true,
accuracy: 100,
smallIcon: true
};
userMarker = L.userMarker(location.latlng, opts).addTo(map);
}
userMarker.setLatLng(location.latlng);
userMarker.setAccuracy(location.accuracy);
});


//if (!map.restoreView())
map.locate({
locate: true,
setView: true,
maxZoom: 12
});
//else
//  map.locate({
//    locate: true,
//    setView: false,
//    maxZoom: 12
//  });



//if (!map.restoreView()){
//}

}



function makeMyLocationMarker(latlng) {
    return {
type: "Feature",
          geometry: {
type: "Point",
      coordinates: [latlng.lng, latlng.lat]
          },
properties: {
title: "Your Location",
       'marker-color': '#00f',
       'marker-symbol': 'star-stroked'
            }
    }


}


function locationsGeoJSON(places) {
    return _.map(places, function(place) {
            return {
type: 'Feature',
geometry: place.loc,
properties: {
'title': place.title,
'url': '#/location/' + place._id,
'marker-symbol': 'museum',
'marker-color': "#f00"
},
}
});

}


*/








