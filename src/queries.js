var categories = require("./data/categories.json");

var request = require("superagent");
var es = require("elasticsearch");
var _ = require('lodash');





exports.findFeaturedLocations = function(cb){
    var search = {
        "query": {
        "match" : {
            "properties.featured" : true
        }
      } 
    };

    searchLocations(search, cb);

};



exports.findLocationsWithCategory = function(categories, cb){
    var search = {
        "from": 0, "size": 50,
        "filter" : {
            "terms" : { "properties.categories": categories }
        }
    };
    searchLocations(search, cb);


};


exports.loadNearByMarkers = function(latlng, cb){
    var search = {
        "from": 0, "size": 50,
        "sort" : [{
            "_geo_distance" : {
                "geometry.coordinates" : {"lat" : latlng.lat, "lon" : latlng.lng},
                "order" : "asc", "unit" : "m"
            }
        }]
    };
    searchLocations(search, cb);
};



exports.loadMarkersInBounds = function(bounds, cb){
    var search = {
        "size": 50,
        "filter" : {
            "geo_bounding_box" : {
                "geometry.coordinates" : {
                    "topRight" : {
                        "lat" : bounds._northEast.lat,
                        "lon" : bounds._northEast.lng
                    },
                    "bottomLeft" : {
                        "lat" : bounds._southWest.lat,
                        "lon" : bounds._southWest.lng,
                    }
                }
            }
        }
    };
    searchLocations(search, cb);
};




function searchLocations(search, cb){

    request.post("http://iowaculture.fresk.io:9200/dca/location/_search", search, function(err, resp){

        var places = _.pluck(resp.body.hits.hits, "_source");
        _.forEach(places, function(p){
            var color = "#b45658";
            var icon = "marker";
            var i, cat;
            for( i=0; i < p.properties.categories.length; i++){
                cat = p.properties.categories[i];
                color = categories.markerColor[cat];
                if (color)
                    break;
            }
            for( i=0; i < p.properties.categories.length; i++){
                cat = p.properties.categories[i];
                icon = categories.markerIcons[cat];
                if (color)
                    break;
            }
            p.properties.description = L.mapbox.sanitize(p.properties.description);
            console.log(p.properties.description );
            p.properties['marker-color'] = color;
            p.properties['marker-symbol'] = icon;
            console.log(p.properties.title, p.properties.categories, p.properties['marker-symbol']);
        });

        if (window.markerLayer){
            window.markerLayer.setGeoJSON(places);
            window.markerLayer.eachLayer(function(layer) {
                var content = ' <h1><a href="#/location/'+layer.feature.properties._id+'">' + layer.feature.properties.title + '</a></h1>';
                layer.bindPopup(content);
            });
        }

        cb(null, places);
    });

}


