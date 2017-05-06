
var express           = require("express"),
    app               = express(), 
    randomner         = require('randomner'),
    GooglePlaces      = require('node-googleplaces'),
    fs                = require('fs');
    




// API KEY
const places = new GooglePlaces('AIzaSyAvsl7KOmIyQalzMse5idBGElZa8GOdPG0');

var file = 'campgrounds.json';

var campgrounds = [];
var currNumCampgrounds = 0



/* ------------------------------------------------- */ 
/* -------------- CREATE CAMPGROUNDS --------------- */
/* ------------------------------------------------- */ 

function createCampgroundsJSON() {
    createCampgrounds();
    for(var i=1; i<20; i++) {
        setTimeout(function() {createCampgrounds() }, i*3000);
    }
    setTimeout(function() { 
        var myJSON = JSON.stringify(campgrounds, null, 2);
        console.log("Num: ", currNumCampgrounds);
        record(myJSON);
    }, 70000);
};

function createCampgrounds() {
    var latlng = randomner.randCoordinates().split(",");
    for(var i=0; i<20; i++) {
        var lat = parseFloat(latlng[0]) + 5*i;
        var lng = parseFloat(latlng[1]) + 5*i;
        createLocation(lat +"," + lng);
    }
}

function createLocation(latlng) {
    const params = {
        //location: latlng,
        //radius: 50000, //50000 is max
        types: 'campground'
    };
    places.details(params, textSearchCallback);
    // place.textSearch
}

function textSearchCallback(err, response) {
    if(err || response.body.status === "INVALID_REQUEST") {
        console.log("Invalid Request");
        return;
    }
    var results = response.body.results;
    for (var i = 0; i < results.length; i++) {
        var place = results[i];
        if(place) { console.log(place);
            if(!checkIfRecorded(place)) {
                currNumCampgrounds++;
                var campground = {};
                if(place.name) { campground.name = place.name; }
                if(place.formatted_address) { campground.location = place.formatted_address;}
                if(place.photos) { campground.image = place.photos[0].photo_reference; }
                if(place.place_id) { campground.googlePlaceID = place.place_id; }
                if(place.geometry) {
                    var placelat = place.geometry.location.lat;
                    var placelng = place.geometry.location.lng;
                    campground.latlng = + placelat + ',' + placelng;
                }
                campgrounds.push(campground);
            }
        }
    }
}

function checkIfRecorded(place) {
    var id = place.place_id;
    console.log("ID: ", id);
    for(var i=0; i<campgrounds.length; i++) {
        if(campgrounds[i].googlePlaceID === id) {
            console.log("RECORDED");
            return true;
        }
    }
    console.log("returning false");
    return false;
}


// Record
function record(string) {
    fs.appendFile(file, string +"\n", function (jerr) {
  		if(jerr) { console.log(jerr) }
    }); 
}


/***************************************************/
/********************** MAIN ***********************/
/***************************************************/



createCampgroundsJSON(); 