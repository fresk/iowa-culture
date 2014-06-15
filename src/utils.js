
var _ = require('lodash');

var urlencode = require('urlencode');


exports.assignCategoryAssets = function(p){
    var icon = false;
    var cat = null;


    for( var i=0; i < p.properties.categories.length; i++){
        cat = p.properties.categories[i];
        if (app.markers[cat]){
            if(app.markers[cat].indexOf("art")> -1){
                p.properties._category = "art";
            }
            if(app.markers[cat].indexOf("history")> -1){
                p.properties._category = "history";
            }
            if(app.markers[cat].indexOf("science")> -1){
                p.properties._category = "science";
            }
            break;
        }
    }

    //<F10>throw "SDAS"
    
    if(p.properties.featured == "true" ){
        p.properties._category = "featured";
        cat = "featured";
    }

    p.properties.icon = {
        "iconUrl": "img/markers/512/"+app.markers[cat]+".png",
        "iconSize": [32, 32],
        "iconAnchor": [15, 15],
        "popupAnchor": [0, -20],
        "color": app.colors[cat],
        "className": "dca-marker "
    }
    p.properties.description = L.mapbox.sanitize(p.properties.description);

    var addr = urlencode(p.properties.address1 +","+p.properties.city+","+p.properties.zip+",IA");
    p.properties.nav_link =  "maps:daddr="+addr;

    if(window.app.userLatLng){
        var latlng = L.latLng(p.geometry.coordinates[1], p.geometry.coordinates[0]);
        p._distance = latlng.distanceTo(window.app.userLatLng);
        p.properties._distance = (p._distance* 0.000621371).toFixed(1) ;
    }
    else {
        p._distance = "";
    }

    return p;
}

