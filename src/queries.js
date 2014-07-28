var categories = require("./data/categories.json");

var request = require("superagent");
var es = require("elasticsearch");
var _ = require('lodash');
var $ = require('jquery');
var urlencode = require('urlencode');
var utils = require('./utils');





exports.findFeaturedLocations = function(cb) {
    var search = {
        "size": 50,
        "filter": {
            "term": {
                "properties.featured": true
            }
        }
    };

    searchLocations(search, cb);

};


exports.findFeaturedTour = function(slug, cb) {
    var search = {
        "size": 100,
        "filter": {
            "term": {
                "properties.featured_tour": slug
            }
        }
    };

    searchLocations(search, cb);

};





exports.findLocationsWithCategory = function(categories, cb) {
    var search = {
        "from": 0,
        "size": 50,
        "filter": {
            "bool": {
                "must": [{
                    "terms": {
                        "properties.categories": categories
                    }
                }]
            }
        }
    };
    searchLocations(search, cb);
};


exports.findLocationsWithCategoryAndNearby = function(categories, latlng, cb) {
    var search = {
        "from": 0,
        "size": 50,
        "filter": {
            "bool": {
                "must": [{
                    "terms": {
                        "properties.categories": categories
                    }
                }]
            }
        },
        "sort": [{
            "_geo_distance": {
                "geometry.coordinates": {
                    "lat": latlng.lat,
                    "lon": latlng.lng
                },
                "order": "asc",
                "unit": "m"
            }
        }]
    };
    searchLocations(search, cb);
};




exports.loadNearByMarkers = function(latlng, cb) {
    if (latlng === undefined) {
        cb("error");
    }

    var search = {
        "from": 0,
        "size": 20,
        "filter": {
            "bool": {
                "must": [{}]
            }
        },
        "sort": [{
            "_geo_distance": {
                "geometry.coordinates": {
                    "lat": latlng.lat,
                    "lon": latlng.lng
                },
                "order": "asc",
                "unit": "m"
            }
        }]
    };
    searchLocations(search, cb);
};



exports.loadMarkersInBounds = function(bounds, cb) {
    // console.log("refresh search", app.selectedCategories);
    var search = {
        "size": 50,
        "filter": {
            "bool": {
                "must": [{
                    "geo_bounding_box": {
                        "geometry.coordinates": {
                            "topRight": {
                                "lat": bounds._northEast.lat,
                                "lon": bounds._northEast.lng
                            },
                            "bottomLeft": {
                                "lat": bounds._southWest.lat,
                                "lon": bounds._southWest.lng,
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

    // console.log("process Response");
    //
    console.log("PROCESS", resp, cb);

    var places = _.pluck(resp.body.hits.hits, "_source");
    _.forEach(places, function(p) {
        utils.assignCategoryAssets(p);
    });


    places = _.filter(places, function(p) {
        if (p.properties.categories[0] == "")
            return false;
        if (p.properties.icon)
            return true;
        //console.log("omitting", p.properties);
    });


    if (window.markerLayer) {
        //window.markerLayer.setGeoJSON(places);
        utils.populateMap(places);
    }




    app.searchResults = places;
    cb(null, places);



}






exports.textSearch = function(q, cb) {
    var url = "http://iowaculture.fresk.io:9200/_search?size=100&q=" + encodeURIComponent(q);
    request.get(url)
        .end(function(err, resp) {
            processResponse(resp, cb);
        });
};




function searchLocations(search, cb) {

    if (window.app.selectedCategories.length > 0) {
        // console.log("limiting categories", app.selectedCategories);
        search.filter.bool.must.push({
            "terms": {
                "properties.categories": app.selectedCategories
            }
        });
    }


    request.post("http://iowaculture.fresk.io:9200/dca/location/_search", search, function(err, resp) {
        console.log(err, resp);
        processResponse(resp, cb);
    });
}


exports.searchLocations = searchLocations;




exports.getPlaceByID = function(uid, callback) {

    window.es.get({
        index: 'dca',
        type: 'location',
        id: uid
    }, function(err, response) {
        if (err) return callback(err);
        var p = utils.assignCategoryAssets(response._source);
        // console.log("ES INDIVIDUAL RECORD", dump(response._source), dump(p));
        callback(null, p);

    });



}


dump = function(d) {
    return JSON.parse(JSON.stringify(d));
}