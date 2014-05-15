
var Vue = require('vue');
var _ = require('lodash');
var request = require("superagent");
var es = require("elasticsearch");
var $ = require('jquery');
//require('./lib/leaflet/leaflet'); //attaches to window.L
//require('./lib/leaflet/bouncemarker'); //attaches to window.L
//require('./lib/leaflet/leaflet.restoreview'); //attaches to window.L//
require('./lib/leaflet/leaflet.usermarker'); //attaches to window.L

//L.Icon.Default.imagePath = "./lib/leaflet/images"




// HOME /////////////////////////////////////////////////
Vue.component('home', {
  template: require('./views/home.html')
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

      window.es.search({
        q: this.query,
        size: 2000
      }, function(err, res) {
        self.numHits = res.hits.total;
        self.showSpinner = false;
        self.showResults = true;
        app.searchResults = _.pluck(res.hits.hits, "_source");
      });

    }
  }
});



// EXPLORE /////////////////////////////////////////////////
Vue.component('explore', {
  template: require('./views/explore.html'),

  data: {
    "selected": {},
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
      this.groupSelectAll[group] = !this.groupSelectAll[group] ;
      if (this.groupSelectAll[group]) {
        _.forEach(app.categories[group], function(c) {
          this.selected.$add(c, true);
        }, this)
      } else {
        _.forEach(app.categories[group], function(c) {
          this.selected.$delete(c);
        }, this)
      }
      ev.stopPropagation();
      return true;
    },
  }
});


// LOCATION LIST /////////////////////////////////////////////////
Vue.component('locatio-list', {
  template: require('./views/location_list.html'),
  data: {
    listData: []
  }
});


// LOCATION DETAIL /////////////////////////////////////////////////
Vue.component('location-detail', {
  template: require('./views/location_detail.html')
});



// MY TOURS /////////////////////////////////////////////////
Vue.component('tours', {
  template: require('./views/tours.html'),
  data: {
    listData: []
  }
});


// FEATURED /////////////////////////////////////////////////
Vue.component('featured', {
  template: require('./views/featured.html'),
  data: {
    listData: []
  }
});



Vue.component('map', {
  template: require('./views/map.html'),

  data: {
    map: null,
    userMarker: null
  },

  ready: function() {
    var self = this;
    Vue.nextTick(function(){
      self.initMap()
    });
  },


  methods: {

    updateMarkers: function(){
      console.log(window.lat, window.lng);

      var search = {
        "from": 0,
        "size": 50,
        "sort" : [
          {
          "_geo_distance" : {
            "geometry.coordinates" : {
              "lat" : 41.666,
              "lon" : -91.53
            },
            "order" : "asc",
            "unit" : "m"
          }
        }
        ]
      };


      request.post("http://iowaculture.fresk.io:9200/dca/location/_search", search, function(err, resp){
        window.markerLayer.setGeoJSON(_.pluck(resp.body.hits.hits, "_source"));
        window.markerLayer.eachLayer(function(layer) {
          var content = ' <h1><a href="#/location/'+layer.feature.properties._id+'">' + layer.feature.properties.title + '</a></h1>';
          layer.bindPopup(content);
        });

        window.markerLayer.on('click', function(e) {
          e.layer.openPopup();
        });

      } );

    },

    initMap: function() {
      var self = this;
      console.log(this);

      window.map = L.mapbox.map('map', 'hansent.i7jbkp90', {
        zoomControl: false,
        tileLayer: {
          detectRetina: true,
          retinaVersion: 'hansent.i7jbkp90'
        }
      });

      window.markerLayer = L.mapbox.featureLayer();
      markerLayer.addTo(map);



      //L.hash(map);

      map.on("locationfound", function(location) {
        window.userMarker = L.userMarker(location.latlng, {
          pulsing:true,
          accuracy:100,
          smallIcon:true
        })
        window.lat = location.latlng.lat;
        window.lng = location.latlng.lng;
        window.userMarker.addTo(map);
        window.userMarker.setLatLng(location.latlng);
        window.userMarker.setAccuracy(location.accuracy);
        self.updateMarkers();
      });


      if (!map.restoreView()) {
        map.locate({
          watch: false,
          locate: true,
          setView: true,
          enableHighAccuracy: true,
          maxZoom: 12
        });
      }
      else {
        map.locate({
          watch: false,
          locate: true,
          setView: false,
          enableHighAccuracy: true,
        });


      }

    }
  }
});





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








