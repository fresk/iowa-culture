var Vue = require('vue');
var _ = require('lodash');
var $ = require('jquery');
var uuid = require('uuid');
var queries = require('../queries');
// var utils = require('./utils');






// MY TOURS /////////////////////////////////////////////////
Vue.component('tours', {
    template: require('../views/tours.html'),

    data: {
        showCreateTour: false,
    },
    methods: {
        createTour: function() {
            this.showCreateTour = true;
        },

        showTour: function(id) {
            window.location = "#/tours/" + id;
        }
    }
});

Vue.component('tour-list', {
    template: require('../views/tour-list.html'),
    data: {
        searchField: null,
        editMode: false,
        showEditTour: false,
    },

    ready: function() {
        this.sortByName();
        app.mapMode = 'tour';
    },

    methods: {

        editTour: function() {
            //console.log("EDIT TOUR");
            this.showEditTour = true;
        },

        deleteFromTour: function(item, ev) {
            ev.preventDefault();
            ev.stopPropagation();
            _.pull(app.tourContext.places, item);
            app.tourContext.places = _.filter(app.tourContext.places, function(p) {
                return p != item;
            });
            //console.log("SAVE TOUR DATA");
            app.saveTours();

        },

        toggleEditMode: function() {
            this.editMode = !this.editMode;
        },

        showDetailView: function(uid, ev) {
            //console.log("SHOW DETAILVIEW", uid);
            window.location = "#/location/" + uid;
        },
        showInMapView: function() {
            app.mapMode = 'tour';
            app.currentScreen = 'map';
        },

        showSortMenu: function() {
            $(".sort-order-option-box").addClass("show-sort");
        },

        hideSortMenu: function() {
            $(".sort-order-option-box").removeClass("show-sort");
            //console.log("hideSortMenu");
        },


        sortByName: function() {
            app.tourContext.places = _.sortBy(app.tourContext.places, function(place) {
                return place.properties.title;
            });
            this.hideSortMenu();
        },

        sortByDistance: function() {
            app.tourContext.places = _.sortBy(app.tourContext.places, function(place) {
                return place._distance;
            });
            this.hideSortMenu();

        },

        sortByCategory: function() {
            app.tourContext.places = _.sortBy(app.tourContext.places, function(place) {
                return place.properties.icon.iconUrl;
            });
            this.hideSortMenu();
        },



    }
});




Vue.component('add-tour-overlay', {
    template: require('../views/tours-overlay.html'),
    replace: true,
    data: {
        title: "",
        color: "#B4D588",
    },
    methods: {
        selectColor: function(color, ev) {
            //console.log(color, ev);
            //console.log(ev.target.id);
            this.color = color;
            //$(".add-tour-color-choice").css("border",0);
            //$(ev.target).css("border", "2px solid #fff");
            ev.preventDefault();
        },
        cancel: function(ev) {
            ev.preventDefault();
            this.$parent.showCreateTour = false;
        },
        create: function(ev) {
            ev.preventDefault();
            app.myTours.push({
                id: uuid.v4(),
                title: this.title,
                color: this.color,
                places: []
            });
            this.$parent.showCreateTour = false;
            app.saveTours();
        }
    }
});




Vue.component('edit-tour-overlay', {
    template: require('../views/tours-overlay-edit.html'),
    replace: true,
    data: {
        title: "",
        color: "#B4D588",
    },
    methods: {

        deleteTour: function() {
            //console.log("EDIT TOUR");
            this.showEditTour = true;
            if (confirm("Are you sure you want to delete this tour and all places within?")) {
                app.myTours = _.filter(app.myTours, function(t) {
                    return t.id != app.tourContext.id;
                });
                app.saveTours();
                window.location = "#/tours"
            }
        },


        selectColor: function(color, ev) {
            //console.log(color, ev);
            // console.log(ev.target.id);
            this.color = color;
            //$(".add-tour-color-choice").css("border",0);
            //$(ev.target).css("border", "2px solid #fff");
            ev.preventDefault();
        },
        cancel: function(ev) {
            ev.preventDefault();
            this.$parent.showEditTour = false;
        },
        create: function(ev) {
            ev.preventDefault();
            // console.log("TOUR:", app.tourContext);
            this.$parent.showEditTour = false;
            app.saveTours();
        }
    }
});


function tourHasPlaceWithId(tour, placeId) {
    var places = _.compact(tour.places);
    return _.any(places, function(p) {
        return (p.properties._id == placeId);
    });
}


function addPlaceToTour(place, tour) {
    console.log("adding", place.properties.title, "to", tour.title);
    var alreadyInTour = false;
    var oldPlaces = tour.places;
    tour.places = [];
    _.each(oldPlaces, function(p) {
        if (p.properties._id == place.properties._id)
            alreadyInTour = true;
        tour.places.push(p);
    });
    if (alreadyInTour == false) {
        console.log("pushing to array");
        tour.places.push(place);
        return;
    }
    console.log("skipping, already in tour");
}

function removePlaceFromTour(place, tour) {
    var oldPlaces = tour.places;
    tour.places = _.filter(oldPlaces, function(p) {
        return p.properties._id != place.properties._id;
    });
}



Vue.component('add-to-tour-overlay', {
    template: require('../views/add-to-tours-overlay.html'),
    replace: true,
    data: {
        selectedTours: {},
        showCreateTour: false,
    },

    attached: function() {
        var self = this;
        setTimeout(function() {
            self.loadSelectionState();
        }, 10);
    },

    methods: {

        createAdditionalTour: function() {
            this.showCreateTour = true;

        },

        loadSelectionState: function() {
            this.selectedTours = {};
            var self = this;
            _.each(app.myTours, function(tour) {
                if (tourHasPlaceWithId(tour, app.selectedLocationId))
                    self.selectedTours.$add(tour.id, true);
            });
        },

        add: function(ev) {
            ev.preventDefault();
            this.$parent.showAddToTour = false;
            var self = this;

            var selectedLocation = _.find(app.searchResults, function(p) {
                console.log(p.properties._id, p);
                return p.properties._id == app.selectedLocationId;
            });

            queries.getPlaceByID(app.selectedLocationId, function(err, place) {
                _.each(app.myTours, function(tour) {
                    if (self.tourIsSelected(tour.id))
                        addPlaceToTour(place, tour);
                    else
                        removePlaceFromTour(place, tour);
                });
                app.saveTours();
            });


        },

        cancel: function(ev) {
            ev.preventDefault();
            this.$parent.showAddToTour = false;
            this.selectedTours = {};
        },

        tourIsSelected: function(id) {
            //console.log("is selected?", this.selectedTours[id]);
            return this.selectedTours[id] == true;
        },
        toggleTourSelection: function(id) {
            console.log("toggle", this.selectedTours[id], !this.selectedTours[id]);
            if (this.selectedTours[id] === undefined)
                this.selectedTours.$add(id, false);
            this.selectedTours[id] = !this.selectedTours[id];
        }
    }
});