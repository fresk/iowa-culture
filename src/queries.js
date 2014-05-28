var categories = require("./data/categories.json");

var request = require("superagent");
var es = require("elasticsearch");
var _ = require('lodash');
var $ = require('jquery');





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
            var icon = false;
            //for( var i=0; i < p.properties.categories.length; i++){
                //var cat = p.properties.categories[i];
                //if (app.colors[cat]){
                    //color = app.colors[cat];
                    //break;
                //}
            //}
            for( var i=0; i < p.properties.categories.length; i++){
                var cat = p.properties.categories[i];
                if (app.markers[cat]){
                    icon = "img/markers/64/"+app.markers[cat]+".png";
                    console.log(icon);
                    p.properties.icon = {
                        "iconUrl": icon,
                        "iconSize": [32, 32],
                        "iconAnchor": [15, 15],
                        "popupAnchor": [0, -20],
                        "className": "dca-marker"
                    }
                    break;
                }
            }
            p.properties.description = L.mapbox.sanitize(p.properties.description);
            //p.properties['marker-symbol'] = icon;
        });


        places = _.filter(places, function(p){
            console.log("filter", p.properties.icon);
            if (p.properties.icon)
                return true;
                //console.log("omitting", p.properties);
        });

        if (window.markerLayer){
            window.markerLayer.setGeoJSON(places);
            window.markerLayer.eachLayer(function(layer) {
                var content = ' <h1><a href="#/location/'+layer.feature.properties._id+'">' + layer.feature.properties.title + '</a></h1>';
                layer.bindPopup(content);
            });
        }

        setTimeout(function(){
            $('.dca-marker').addClass('marker-fade-in')
        
        }, 100);


        cb(null, places);
    });

}


