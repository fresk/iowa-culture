var categories = require("./data/categories.json");

var request = require("superagent");
var es = require("elasticsearch");
var _ = require('lodash');
var $ = require('jquery');
var urlencode = require('urlencode');
var utils = require('./utils')





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



function processResponse(resp, cb) {

   var places = _.pluck(resp.body.hits.hits, "_source");
        _.forEach(places, function(p){
            utils.assignCategoryAssets(p)
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
                var latlng = L.latLng(p.geometry.coordinates[1], p.geometry.coordinates[0]);
                var marker = L.marker(latlng);

                marker.properties = p.properties;
                //console.log("MARKER", p);
                //window.newMarkerLookup[p.properties._id] = marker;
                marker.addTo(window.markerLayer);
            })

            window.markerLayer.eachLayer(function(layer) {
                console.log(layer.properties);
                p = layer.properties;
                var addr = urlencode(p.address1 +","+p.city+","+p.zip+",IA");
                var content = ' <h1><a href="#/location/'+layer.properties._id+'">' + layer.properties.title + '<br/>'+layer.properties._distance+'mi</a></h1>';
                content += '<a class="route-btn '+layer.properties._category+'" href="http://maps.apple.com/?daddr='+addr+'" target="_system"></a>'
                layer.bindPopup(content, {className: layer.properties._category});
            });
        }

        setTimeout(function(){
            $('.dca-marker').addClass('marker-fade-in')

        }, 100);

        
        app.searchResults = places;
        cb(null, places);



}





exports.textSearch = function(q, cb){ 
    var url = "http://iowaculture.fresk.io:9200/_search?size=60&q="+urlencode(q);
    request.get(url, function(err, resp){
        processResponse(resp, cb);
    });
}




function searchLocations(search, cb){

    if (window.app.selectedCategories.length > 0){
        console.log("limiting categories",  app.selectedCategories);
        search.filter.bool.must.push({
            "terms" : { "properties.categories": app.selectedCategories }
        });
    }


    request.post("http://iowaculture.fresk.io:9200/dca/location/_search", search, function(err, resp){
        processResponse(resp, cb);
    });
}


exports.searchLocations = searchLocations;




exports.getPlaceByID = function(uid, callback){

    window.es.get({
        index: 'dca',
        type: 'location',
        id: uid
    }, function(err, response){
        if(err) return callback(err);
        var p = utils.assignCaytegoryAssets( response._source );
        console.log("ES INDIVIDUAL RECORD", dump( response._source ), dump(p));
        callback(null, p);
       
    });



}


dump = function(d){
return JSON.parse(JSON.stringify(d));
}
