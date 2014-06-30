var Vue = require('vue');
var _ = require('lodash');
var request = require("superagent");
var queries = require('../queries');
var utils = require('../utils');


Vue.component('map', {
    template: require('../views/map.html'),

    data: {
        map: null,
        userMarker: null,
    },

    attached: function() {
        var map_widget = this.$el.querySelector(".map-widget");
        Vue.nextTick(function() {
            initMap(map_widget);
        });
    },

    methods: {
        locateUser: function() {
            map.locate({
                watch: false,
                locate: true,
                setView: true,
                enableHighAccuracy: true,
                maxZoom: 16
            });
        },

        showInListView: function() {
            if (app.mapMode == 'tour') {
                app.currentScreen = "tour-list";
                return;
            }
            app.currentScreen = "location-list";
        }
    }
});


//http://api.tiles.mapbox.com/v3/hansent.i7jbkp90/geocode/johnson.json



function initMap(el) {

    window.map = L.mapbox.map(el, 'hansent.i7jbkp90', {
        minZoom: 6,
        zoomControl: false,
        bounceAtZoomLimits: true,
        tileLayer: {
            detectRetina: true,
            retinaVersion: 'hansent.i7jbkp90',
            updateWhenIdle: true
        }
    });
    //fit to iowa bounds by default;
    //map.setMaxBounds(L.latLngBounds([35, -96], [47, -87]));
    map.setMaxBounds(L.latLngBounds([38.145, -96.965], [45.95, -89.934]));
    map.fitBounds(L.latLngBounds([38.145, -96.965], [45.95, -89.934]));
    map.restoreView();

    // layer for markers
    window.markerLayer = L.mapbox.featureLayer();
    markerLayer.addTo(map);

    //for caching what markers are already on the map
    window.oldMarkerLookup = {};

    window._MAP_LOADED = false;

    // in tour mode, we only ever want to show the places in the tour
    if (app.mapMode == "tour") {
        utils.populateMap(app.tourContext.places);
    }

    // start out by showing all the search results in explore mode
    if (app.mapMode == "explore") {
        utils.populateMap(app.searchResults);
        fitMapToMarkers();
    }

    if (app.mapMode == 'search') {
        utils.populateMap(app.searchResults);
        fitMapToMarkers();
    }

    if (app.mapMode == 'nearme') {
        queries.loadNearByMarkers(app.userLatLng, function(err, places) {
            console.log("NEARME", places);
            app.searchResults = _.sortBy(places, function(place) {
                return place._distance;
            });
            fitMapToMarkers();
        });

    }

    if (app.userLatLng)
        updateUserLocation(app.userLatLng);

    map.on("dragend", onMapDragEnd);
    map.on("zoomend", onMapDragEnd);

    setTimeout(forceMapRefresh, 50);



}



function forceMapRefresh() {
    L.Util.requestAnimFrame(map.invalidateSize, map, false, map._container);
    window._MAP_LOADED = true;
}


function fitMapToMarkers() {
    setTimeout(function() {
        var bounds = window.markerLayer.getBounds();
        window.map.fitBounds(bounds, {
            padding: [5, 5]
        });

    }, 100);
}


function onMapDragEnd(e) {
    if (window._MAP_LOADED == false)
        return;

    if (app.mapMode == "explore" || app.mapMode == "nearme") {
        setTimeout(loadPlaceMarkersInView, 50);
    }
}


function loadPlaceMarkersInView() {
    queries.loadMarkersInBounds(map.getBounds(), function() {});
}



function updateUserLocation(coords) {
    window.userMarker = L.userMarker(coords, {
        pulsing: true,
        accuracy: 100,
        smallIcon: true
    });
    window.userMarker.addTo(map);
    window.userMarker.setLatLng(coords);
    //window.userMarker.setAccuracy(coords.accuracy);
}


function centerOnUser(location) {
    queries.loadNearByMarkers(location.latlng, function(err, places) {});
}



var RestoreViewMixin = {
    restoreView: function() {
        var storage = window.localStorage || {};
        if (!this.__initRestore) {
            this.on('moveend', function(e) {
                if (!this._loaded)
                    return; // Never access map bounds if view is not set.

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
        } catch (err) {
            return false;
        }
    }
};



require('../lib/leaflet/leaflet.usermarker'); //attaches to window.L
L.Map.include(RestoreViewMixin);