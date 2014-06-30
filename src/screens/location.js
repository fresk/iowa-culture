var Vue = require('vue');
var _ = require('lodash');
var $ = require('jquery');


// LOCATION DETAIL /////////////////////////////////////////////////
Vue.component('location-detail', {
    template: require('../views/location_detail.html'),

    data: {
        showAddToTour: false
    },

    attached: function() {
        app.selectedLocationId = app.detailLocationData.properties._id;
    },

    methods: {
        addToTour: function() {
            var jsonData = JSON.stringify(app.detailLocationData);
            this.selectedPlace = JSON.parse(jsonData);
            this.showAddToTour = true;
        },



        callPhone: function() {
            window.open("tel:" + app.context.phone, '_system');
        },
        openWebsite: function() {
            window.open(app.context.website, '_system');
        },
        openSocial: function(network) {
            window.open(app.context[network], '_system');
        }

    },
    computed: {
        preview_image: function() {
            if (app.context.images.length > 0 && app.context.images[0].length > 2)
                return app.context.images[0];

            //console.log(app.context);
            return app.context.icon.iconUrl;
        },
        preview_image_class: function() {
            if (app.context.images.length > 0 && app.context.images[0].length > 2)
                return "icon-photo";
            return "icon-preview";
        }
    }
});




// LOCATION LIST /////////////////////////////////////////////////
Vue.component('location-list', {
    template: require('../views/location_list.html'),

    data: {
        showAddToTour: false,
        searchField: null,

    },

    methods: {

        addToTour: function(ev) {

            app.selectedLocationId = ev.targetVM.properties._id;

            this.showAddToTour = true;
        },

        sortByName: function() {
            app.searchResults = _.sortBy(app.searchResults, function(place) {
                return place.properties.title;
            });
            this.hideSortMenu();
        },

        sortByDistance: function() {
            app.searchResults = _.sortBy(app.searchResults, function(place) {
                return place._distance;
            });
            this.hideSortMenu();

        },

        sortByCategory: function() {
            app.searchResults = _.sortBy(app.searchResults, function(place) {
                return place.properties.icon.iconUrl;
            });
            this.hideSortMenu();
        },

        showInMapView: function() {
            app.currentScreen = 'map';
        },


        showSortMenu: function() {
            $(".sort-order-option-box").addClass("show-sort");
        },

        hideSortMenu: function() {
            $(".sort-order-option-box").removeClass("show-sort");
            //console.log("hideSortMenu");
        },

        suggestAPlace: function() {
            window.location = "#/suggestaplace";
        },


    }
});