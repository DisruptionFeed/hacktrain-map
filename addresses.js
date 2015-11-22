var fs = require("fs")
var request = require('sync-request');

var url = "http://nominatim.openstreetmap.org/search?format=json&q="

var stations = JSON.parse(fs.readFileSync('stations.json', 'utf8'));

for (var i = 0; i<stations.length; i++) {
    var line = stations[i];
    for (var j=0; j<line.length; j++) {
        var station = line[j];

        console.log("Req", station, url+station);
        var res = request('GET', url+station+",UK");
        var c = JSON.parse(res.getBody());
        c=c[0];

        if (c !== undefined) {
            console.log(c.lat, c.lon);

            stations[i][j] = {name: station, lat: c.lat, lon: c.lon};
        } else {
            console.log("ATTENTION NEEDED ***", station);
        }
    }
}

fs.writeFileSync("stations_coords.json", JSON.stringify(stations));
