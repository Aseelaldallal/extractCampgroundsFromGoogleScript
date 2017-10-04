
var express           = require("express"),
    app               = express(), 
    randomner         = require('randomner'),
    GooglePlaces      = require('node-googleplaces'),
    fs                = require('fs');




// API KEY
const places = new GooglePlaces(process.env.GOOGLE_API_KEY);

var file = 'campgrounds.json';

var campgrounds = [];
var currNumCampgrounds = 0;


/* ------------------------------------------------- */ 
/* -------------- CREATE CAMPGROUNDS --------------- */
/* ------------------------------------------------- */ 

function createCampgroundsJSON() {
    createCampgrounds();
   for(var i=1; i<42; i++) {
        setTimeout(function() {createCampgrounds() }, i*2000);
    }
    setTimeout(function() {
        var myJSON = JSON.stringify(campgrounds, null, 2);
        console.log("Num: ", currNumCampgrounds);
        record(myJSON);
    }, 75000)
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
        location: latlng,
        radius: 50000, //50000 is max
        types: 'campground'
    };
    places.textSearch(params, textSearchCallback);
}

function textSearchCallback(err, response) {
    if(err || response.body.status === "INVALID_REQUEST") {
        console.log("Invalid Request");
        return;
    }
    var results = response.body.results;
    for (var i = 0; i < results.length; i++) {
        var place = results[i];
        if(place) { 
            if(!checkIfRecorded(place) && place.photos) {
                currNumCampgrounds++;
                var query = { placeid: place.place_id}
                places.details(query, function(err, res) { 
                    if(err) { console.log(err); }
                    var thePlace = res.body.result;
                    var campground = {};
                    if(thePlace.name) { campground.name = thePlace.name; }
                    if(thePlace.formatted_address) { campground.location = thePlace.formatted_address;}
                    if(thePlace.photos) { campground.image = thePlace.photos[0].photo_reference; }
                    if(thePlace.place_id) { campground.googlePlaceID =thePlace.place_id; }
                    if(thePlace.geometry) {
                        var placelat = thePlace.geometry.location.lat;
                        var placelng = thePlace.geometry.location.lng;
                        campground.latlng = + placelat + ',' + placelng;
                    }
                    var comments = new Array();
                    if(thePlace.reviews) {
                        for(var j=0; j<thePlace.reviews.length; j++) {
                            if(thePlace.reviews[j].text !== "") {
                                comments.push(thePlace.reviews[j].text);
                            }
                        }
                        campground.comments = comments;
                    }
                    if(thePlace.address_components) {
                        for(var j=0; j<thePlace.address_components.length; j++) {
                            if(thePlace.address_components[j].types.indexOf('country') !== -1) {
                                campground.country = thePlace.address_components[j].long_name;
                            }
                        }
                    }
                    if(campground.country) {
                        campgrounds.push(campground);
                    }
                });
            }
        }
    }
}

function checkIfRecorded(place) {
    var id = place.place_id;
    for(var i=0; i<campgrounds.length; i++) {
        if(campgrounds[i].googlePlaceID === id) {
            return true;
        }
    }
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


/*var query = { placeid: 'ChIJZcWZbicNXBURGX0eqoK-neM' }
places.details(query, function(err, res) { 
    console.log(JSON.stringify(res.body, null,2));
});
*/
createCampgroundsJSON(); 