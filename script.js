const APIKEY = "50992613b883a656889bd86194b3003e";
const ISSID = "25544"

var locationObject; /*delete when ready*/
var passesObject; /*delete when ready*/

function locationError(show) {
    document.getElementById("errorMessage").hidden = !show;
}

function search() {
    const location = document.getElementById("location").value;
    if (location === "") {
        locationError(true);
        return;
    }
    console.log(location);

    let locationurl = "";
    var zip;

    if (isNaN(location)) {
        zip = false;
        locationurl = "https://api.openweathermap.org/geo/1.0/direct?q=" + location + "&APPID=" + APIKEY;
    } else {
        zip = true;
        locationurl = "https://api.openweathermap.org/geo/1.0/zip?zip=" + location + "&APPID=" + APIKEY;
    }
    
    fetch(locationurl)
        .then(function(response) {
            if (!response.ok) {
                locationError(true);
                return;
            }
            locationError(false);
            return response.json();
        }).then(function(json) {
            locationObject = json; /*delete when ready*/
            let lat = "";
            let lon = "";

            if (zip) {
                lat = json.lat;
                lon = json.lon;
            } else {
                if (json.length == 0) {
                    locationError(true);
                }
                lat = json[0].lat;
                lon = json[0].lon;
            }

            const numPasses = document.getElementById("numPasses").value;
            const showPasses = document.getElementById("showPasses").value;
            var visiblePasses;

            if (showPasses == "Visible Passes Only") {
                visiblePasses = "true";
            } else {
                visiblePasses = "false";
            }

            const passesurl = "https://satellites.fly.dev/passes/" + ISSID + "?lat=" + lat + "&lon=" + lon + "&limit=" + numPasses + "&visible_only=" + visiblePasses;

            fetch(passesurl)
                .then(function(response) {
                    return response.json();
                }).then(function(json) {
                    passesObject = json; /*delete when ready*/
                    document.getElementById("results").innerHTML = "";
                    for (let pass of json) {
                        let results = "<h3>Rise</h3>";
                        results += "<h4>" + pass.rise.utc_datetime.split(".")[0] + " UTC</h4>";
                        results += "<p>Direction: " + pass.rise.az + "&deg; (" + pass.rise.az_octant + ")</p>";
                        results += "<h3>Culmination</h3>";
                        results += "<h4>" + pass.culmination.utc_datetime.split(" ")[1].split(".")[0] + " UTC</h4>";
                        results += "<p>Altitude: " + pass.culmination.alt + "&deg;</p>";
                        results += "<p>Direction: " + pass.culmination.az + "&deg; (" + pass.culmination.az_octant + ")</p>";
                        if (pass.culmination.visible) {
                            results += "<p>Visible</p>";
                        } else {
                            results += "<p>Not Visible</p>";
                        }
                        results += "<h3>Set</h3>";
                        results += "<h4>" + pass.set.utc_datetime.split(" ")[1].split(".")[0] + " UTC</h4>";
                        results += "<p>Direction: " + pass.set.az + "&deg; (" + pass.rise.az_octant + ")</p>";

                        passElement = document.createElement("div");
                        passElement.setAttribute("class", "passBox");
                        passElement.innerHTML = results;
                        document.getElementById("results").appendChild(passElement);
                    }
                    document.getElementById("results").hidden = false;
                });
        });
}

document.getElementById("submit").addEventListener("click", function(event) {
    event.preventDefault();
    search();
});

