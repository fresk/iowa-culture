var _ = require('lodash');
var $ = require('jquery');

var urlencode = require('urlencode');



exports.makePlain = function(d) {
    return JSON.parse(JSON.stringify(d));
};


exports.populateMap = function(places) {


    //console.log("POPULATE", places.length, places);
    window.newMarkerLookup = {};
    _.each(places, function(p) {
        //console.log(p);
        //already added
        if (window.oldMarkerLookup[p.properties._id]) {
            window.newMarkerLookup[p.properties._id] = window.oldMarkerLookup[p.properties._id];
            return;
        }
        window.oldMarkerLookup[p.properties._id] = 1;

        var latlng = L.latLng(p.geometry.coordinates[1], p.geometry.coordinates[0]);
        var marker = L.marker(latlng);

        marker.properties = p.properties;
        marker.setIcon(L.icon(marker.properties.icon));
        marker.addTo(window.markerLayer);
    });


    window.markerLayer.eachLayer(function(layer) {
        //console.log(layer.properties);
        p = layer.properties;
        //var addr = urlencode(p.address1 + "," + p.city + "," + p.zip + ",IA");
        var addr = urlencode(layer.getLatLng().lat.toString() + "," + layer.getLatLng().lng.toString());
        var content = ' <h1><a href="#/location/' + layer.properties._id + '">' + layer.properties.title + '<br/>' + layer.properties._distance + 'mi</a></h1>';
        content += '<a class="route-btn ' + layer.properties._category + '" href="maps:daddr=' + addr + '" target="_system"></a>'
        //var latlngString = layer.getLatLng().lat.toString() + "," + layer.getLatLng().lng.toString();
        //content += '<a class="route-btn ' + layer.properties._category + '" href="maps:daddr=' + latlngString + '" target="_system"></a>'

        layer.bindPopup(content, {
            className: layer.properties._category
        });
    });

    setTimeout(function() {
        $('.dca-marker').addClass("marker-fade-in");
    }, 200);

};




var maxBounds = L.latLngBounds([37.145 - 2, -96.965 - 2], [45.95 + 2, -89.934 + 2]);

exports.assignCategoryAssets = function(p) {
    var icon = false;
    var cat = null;

    var latlng = L.latLng(p.geometry.coordinates[1], p.geometry.coordinates[0]);
    //console.log(latlng);
    // if (latlng.lat == 0) {
    //     return;
    // }
    // if (latlng.lng == 0) {
    //     return;
    // }
    //if p.geometry.coordinates[0] == 0
    if (maxBounds.contains(latlng) == false) {
        //console.log(p.properties.title);
        p.properties.icon = false;
        return;
    }

    for (var i = 0; i < p.properties.categories.length; i++) {
        cat = p.properties.categories[i];
        if (app.markers[cat]) {
            if (app.markers[cat].indexOf("art") > -1) {
                p.properties._category = "art";
            }
            if (app.markers[cat].indexOf("history") > -1) {
                p.properties._category = "history";
            }
            if (app.markers[cat].indexOf("science") > -1) {
                p.properties._category = "science";
            }
            break;
        }
    }

    if (p.properties.categories.length === 0){
        p.properties.icon = false;
        return;
    }

    cat = p.properties.categories[0];

    console.log("featured", typeof(p.properties.featured), p.properties.featured);
    console.log("public", typeof(p.properties.public), p.properties.public);
    if (p.properties.featured) {
        p.properties._category = "featured";
        cat = "featured";
    }

    p.properties.state = p.properties.state || "IA";

    p.properties.icon = {
        "iconUrl": "img/markers/512/" + app.markers[cat] + ".png",
        "iconSize": [40, 40],
        "iconAnchor": [20, 40],
        "popupAnchor": [0, -20],
        "color": app.colors[cat],
        "className": "dca-marker "
    };
    p.properties.description = L.mapbox.sanitize(p.properties.description);

    //var addr = urlencode(p.properties.address1 + "," + p.properties.city + "," + p.properties.zip + ",IA");

    var addr = urlencode(latlng.lat.toString() + "," + latlng.lng.toString());

    p.properties.nav_link = "maps:daddr=" + addr;

    if (window.app.userLatLng) {

        p._distance = latlng.distanceTo(window.app.userLatLng);
        p.properties._distance = (p._distance * 0.000621371).toFixed(1);
    } else {
        p._distance = "";
    }

    return p;
}