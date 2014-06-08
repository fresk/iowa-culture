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
            "bool": {"must":[
                {"terms" : { "properties.categories": categories }}
            ]}
        }
    };
    searchLocations(search, cb);


};


exports.loadNearByMarkers = function(latlng, cb){
    var search = {
        "from": 0, "size": 50,
        "filter" : {
            "bool": {
                "must": [{}]
            }
        },
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
    console.log("refresh search", app.selectedCategories);
    var search = {
        "size": 50,
        "filter" : {
            "bool": {
                "must": [{
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
                }]
            }
        }
    };
    searchLocations(search, cb);
};




function searchLocations(search, cb){
    console.log("SEARCH", search, window.app.selectedCategories);
    if (window.app.selectedCategories.length > 0){
        console.log("limiting categories",  app.selectedCategories);
        search.filter.bool.must.push({
            "terms" : { "properties.categories": app.selectedCategories }
        });
    }


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
            if (p.properties.icon)
                return true;
            //console.log("omitting", p.properties);
        });

        if (window.markerLayer){
            //window.markerLayer.setGeoJSON(places);
            //
            window.newMarkerLookup = {}
            _.each(places, function(p){
                //console.log(p);
                //already added
                if (window.oldMarkerLookup[p.properties._id]){ 
                    window.newMarkerLookup[p.properties._id] = window.oldMarkerLookup[p.properties._id];
                    return;
                }
                console.log(p)
                var latlng = L.latLng(p.geometry.coordinates[1], p.geometry.coordinates[0]);
                var marker = L.marker(latlng);
                marker.properties = p.properties;
                //console.log("MARKER", p);
                //window.newMarkerLookup[p.properties._id] = marker;
                marker.addTo(window.markerLayer);
            })

            window.markerLayer.eachLayer(function(layer) {
                console.log("LAYER", layer);
                var content = ' <h1><a href="#/location/'+layer.properties._id+'">' + layer.properties.title + '</a></h1>';
                layer.bindPopup(content);
            });
        }

        setTimeout(function(){
            $('.dca-marker').addClass('marker-fade-in')

        }, 100);


        cb(null, places);
    });

}


