
var _= require('lodash');
require('./lib/leaflet/leaflet'); //attaches to window.L
require('./lib/leaflet/bouncemarker'); //attaches to window.L
require('./lib/leaflet/leaflet.restoreview'); //attaches to window.L
require('./lib/leaflet/leaflet.usermarker'); //attaches to window.L

L.Icon.Default.imagePath = "./lib/leaflet/images"




// HOME /////////////////////////////////////////////////
exports.HomeScreen = {
    template: require('./views/home.html')
};


// EXPLORE /////////////////////////////////////////////////
exports.ExploreScreen = {
    template: require('./views/explore.html'),

    data: {
        "selected": {},
        "groups": {
            'art': false,
            'history': false,
            'science': false
        },
        "groupSelectAll":{
            'art': false,
            'history': false,
            'science': false
        }
    },

    methods: {

        toggle: function(category){
            if(this.selected[category]) this.selected.$delete(category);
            else this.selected.$add(category, true);
            return true
        },

        isSelected: function(category){
            return this.selected[category] ? 'check' : 'unchecked';
        },

        isSelectAll: function(group){
            return this.groupSelectAll[group] ? 'check' : 'unchecked';
        },

        toggleSelectAll: function(group, ev){
            this.groupSelectAll[group] = ! this.groupSelectAll[group] ;
            if (this.groupSelectAll[group] ){
                _.forEach(app.categories[group], function(c){
                    this.selected.$add(c, true);
                }, this)
            }
            else {
                _.forEach(app.categories[group], function(c){
                    this.selected.$delete(c);
                }, this)
            }
            ev.stopPropagation();
            return true;
        },
    }
};


// LOCATION LIST /////////////////////////////////////////////////
exports.LocationListScreen = {
    template: require('./views/location_list.html'),
    data:{
        listData: []
    }
};


// LOCATION DETAIL /////////////////////////////////////////////////
exports.LocationScreen = {
    template: require('./views/location_detail.html')
};



// MY TOURS /////////////////////////////////////////////////
exports.ToursScreen = {
    template: require('./views/tours.html'),
    data:{
        listData: []
    }
};


// FEATURED /////////////////////////////////////////////////
exports.FeaturedScreen = {
    template: require('./views/featured.html'),
    data:{
        listData: []
    }
};




// MAP /////////////////////////////////////////////////
exports.MapScreen = {
    template: require('./views/map.html'),

    data:{
        listData: []
    },


    ready: function(){
        items = _.sample(this.listData, 100);
        setTimeout(function(){
            initMapView(items);
        }, 100);
    }

};



function locationMarker(loc){
    return new L.Marker([loc.loc.coordinates[1], loc.loc.coordinates[0]], {
        title: loc.title,
           icon: "home",
           markerColor: "orange",
           alt: loc.title,
           bounceOnAdd: true,

    });

}


function initMapView(places){

    var map = L.map('map');

    var mapboxid = 'https://{s}.tiles.mapbox.com/v3/hansent.i1256a9l/{z}/{x}/{y}.png';
    var mapboxTiles = L.tileLayer(mapboxid).addTo(map);


    //var markers = new L.MarkerClusterGroup({
    //	maxClusterRadius: 20,
    //
    //});
    //
    //
    _.forEach(app.locations, function(item){
        var latlng = L.latLng(item.loc.coordinates[1], item.loc.coordinates[0]);
        var m = new L.Marker(latlng, {
            title: item.title
        });
        m.bindPopup('<a href="#/location/'+item._id+'" >'+item.title+'</a>');
        m.addTo(map);
    })


    var userMarker = null;
    map.on("locationfound", function(location) {
        if (!userMarker){
            var opts = {pulsing:true, accuracy:100, smallIcon:true};
            userMarker = L.userMarker(location.latlng, opts).addTo(map);
        }
        userMarker.setLatLng(location.latlng);
        userMarker.setAccuracy(location.accuracy);
    });


    if (!map.restoreView())
        map.locate({locate: true, setView: true, maxZoom: 12})
    else
        map.locate({locate: true, setView: false, maxZoom: 12});



    //if (!map.restoreView()){
    //}

}




function makeMyLocationMarker(latlng){
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
    return  _.map(places, function(place){
        return {
            type: 'Feature',
            geometry: place.loc,
            properties: {
                'title': place.title,
            'url': '#/location/'+place._id,
            'marker-symbol': 'museum',
            'marker-color': "#f00"
            },
        }
    });

}



