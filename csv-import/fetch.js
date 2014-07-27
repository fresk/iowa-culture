var _ = require("underscore");
var jf = require("jsonfile");
var uuid = require('node-uuid');
var elasticsearch = require('elasticsearch');
var async = require('async');
var tabletop = require('tabletop');

var client = new elasticsearch.Client({
    host: 'iowaculture.fresk.io:9200',
    log: 'error'
});



var es_index_mapping = {
    "mappings": {
        "location": {
            "properties": {

                "type": {
                    "type": "string"
                },

                "geometry": {
                    "type": "object",
                    "properties": {
                        "coordinates": {
                            "type": "geo_point"
                        }
                    }
                },

                "properties": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string"
                        },
                        "email": {
                            "type": "string"
                        },
                        "phone": {
                            "type": "string"
                        },
                        "website": {
                            "type": "string"
                        },
                        "address1": {
                            "type": "string"
                        },
                        "address2": {
                            "type": "string"
                        },
                        "city": {
                            "type": "string"
                        },
                        "state": {
                            "type": "string"
                        },
                        "zip": {
                            "type": "string"
                        },
                        "county": {
                            "type": "string"
                        },
                        "facebook": {
                            "type": "string"
                        },
                        "twitter": {
                            "type": "string"
                        },
                        "youtube": {
                            "type": "string"
                        },
                        "instagram": {
                            "type": "string"
                        },
                        "public": {
                            "type": "boolean"
                        },
                        "hide": {
                            "type": "boolean"
                        },
                        "featured": {
                            "type": "boolean"
                        },
                        "featured_text": {
                            "type": "string"
                        },
                        "featured_tour": {
                            "type": "string"
                        },
                        "description": {
                            "type": "string"
                        },
                        //"_id"          : {"type":"string"},
                        "images": {
                            "type": "string"
                        },
                        "tags": {
                            "type": "string"
                        },
                        "categories": {
                            "type": "string"
                        }
                    }

                }
            }
        }
    }
};





function toGeoJson(d) {
    console.log("toGeoJson", d);

    d.longitude = parseFloat(d.longitude) || 0.0;
    d.latitude = parseFloat(d.latitude) || 0.0;

    if (d.website === "http://")
        d.website = "";

    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [d.longitude, d.latitude]
        },
        "properties": {
            "title": d.title,
            "email": d.email,
            "phone": d.phone,
            "website": d.website,
            "address1": d.address1,
            "address2": d.address2,
            "city": d.city,
            "state": d.state,
            "zip": d.zip,
            "county": d.county,
            "facebook": d.facebook,
            "twitter": d.twitter,
            "youtube": d.youtube,
            "instagram": d.instagram,
            "public": d.public == "TRUE",
            "hide": d.hide != "FALSE",
            "featured": d.featured == "TRUE",
            "featured_text": d.featuredtext,
            "featured_tour": d.featuredtour,
            "description": d.description,
            "_id": uuid.v4(), //d._id,
            "images": _.map(d.images.split(','), function(s) {
                return s.trim();
            }),
            "tags": _.map(d.tags.split(','), function(s) {
                return s.trim();
            }),
            "categories": _.map(d.categories.split(','), function(s) {
                return s.trim().toLowerCase();
            })
        }
    };
}



function indexRows(rows) {

    var indexName = "dca";
    var geoJson = {
        "type": "FeatureCollection",
        "features": _.map(rows, toGeoJson)
    };

    function indexLocations() {
        _.each(geoJson.features, function(d) {
            client.index({
                "index": indexName,
                "type": "location",
                "id": d.properties._id,
                "body": d
            }, function(err, resp) {
                console.log("indexed", d.properties.title);
            });
        });
        console.log("done");
    }

    client.indices.delete({
        "index": indexName
    }, function() {
        client.indices.create({
            "index": indexName,
            "body": es_index_mapping
        }, indexLocations);
    });
}







tabletop.init({
    //key: 'https://docs.google.com/spreadsheets/d/19gxWjSY210fhdkOuR6XaZKcFj9y6P9kRyGb9_gnhRyQ/pubhtml',
    key: "https://docs.google.com/spreadsheets/d/1PC9RVOwSarhu4X7As1zOkZhHGhST7NECJsF1yNrrM2s/pubhtml",
    callback: function(data, tabletop) {
        console.log('fetched', data.length, 'rows');
        indexRows(data);
    },
    simpleSheet: true
});
