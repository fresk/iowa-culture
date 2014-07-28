var Vue = require('vue');
var _ = require('lodash');
var request = require("superagent");
// var es = require("elasticsearch");
var $ = require('jquery');
var queries = require('../queries');
var uuid = require('uuid');
// var utils = require('./utils');
require('./explore');
require('./featured');
require('./location');
require('./map');
require('./tours');


// HOME /////////////////////////////////////////////////
Vue.component('home', {
    template: require('../views/home.html'),
    methods: {
        share: function() {
            window.plugins.socialsharing.share(
                'Check out the Iowa Culture app',
                null,
                null,
                'http://iowacultureapp.com');
        }
    }
});

Vue.component('help', {
    template: require('../views/help.html')
});


Vue.component('screenMenuTabs', {
    replace: true,
    template: require('../views/screenMenuTabs.html'),
    data: {},
    methods: {}
});


// SEARCH /////////////////////////////////////////////////
Vue.component('search', {
    template: require('../views/search.html'),
    data: {
        query: "",
        showSpinner: false,
        showResults: false,
        numHits: 0
    },
    attached: function() {
        this.showSpinner = false;
        this.showResults = false;
        var self = this;

        setTimeout(function() {
            $('input').on('touchstart', function() {
                $(this).focus(); // inside this function the focus works
            });

            setTimeout(function() {
                $('input').trigger('touchstart');
            }, 100);

        }, 100);
    },

    methods: {

        doSearchKey: function(ev) {
            //alert('key search');
            if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            }
            this.showSpinner = true;
            //var elastic_query = "http://saskavi.com:9200/dca/_search?size=100&q=" + this.query;
            var self = this;

            queries.textSearch(this.query, function(err, places) {
                //alert("got text search results", places.length);
                self.showSpinner = false;
                app.searchResults = places;
                window.location = "#/search/results";
            });
        },

        doSearchBlur: function(ev) {
            //alert('blur search');
            if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            }
            this.showSpinner = true;
            //var elastic_query = "http://saskavi.com:9200/dca/_search?size=100&q=" + this.query;
            var self = this;

            queries.textSearch(this.query, function(err, places) {
                //alert("got text search results", places.length);
                self.showSpinner = false;
                app.searchResults = places;
                window.location = "#/search/results";
            });
        }

    }
});



Vue.component('suggest-a-place', {
    template: require('../views/suggest-a-place.html'),
    data: {
        showLoadingSpinner: false
    },
    methods: {
        submitSuggestion: function() {
            this.showLoadingSpinner = true;
            //console.log("submitSuggestedPlace");
            var data = {
                title: $("#input-title").val(),
                address: $("#input-address").val(),
                city: $("#input-city").val(),
                zip: $("#input-zip").val(),
                submitter_name: $("#input-submitter").val(),
            };

            request.post('http://iowaculture.fresk.io:80/app/suggest')
                .send(data)
                .end(function(error, res) {});

            window.location = "#/suggestthankyou";


        }
    }
});




Vue.component('thankyou', {
    template: require('../views/thankyou.html'),
    methods: {
        goHome: function() {
            window.location = "#/home";
        }
    }
});