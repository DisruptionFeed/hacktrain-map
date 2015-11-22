function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function parseFloats(stations) {
    for (var i=0;i<stations.length;i++) {
        for (var j=0; j<stations[i].length; j++) {
            stations[i][j].lon = parseFloat(stations[i][j].lon);
            stations[i][j].lat = parseFloat(stations[i][j].lat);
        }
    }
    return stations;
}

function minLatLon(stations) {
    var lat = stations[0][0].lat;
    var lon = stations[0][0].lon;
    for (var i=0;i<stations.length;i++) {
        for (var j=0; j<stations[i].length; j++) {
            var c = stations[i][j];
            if (c.lat < lat) {
                lat = c.lat;
            }
            if (c.lon < lon) {
                lon = c.lon;
            }
        }
    }
    return {lat: lat, lon: lon};
}

function maxLatLon(stations) {
    var lat = stations[0][0].lat;
    var lon = stations[0][0].lon;
    for (var i=0;i<stations.length;i++) {
        for (var j=0; j<stations[i].length; j++) {
            var c = stations[i][j];
            if (c.lat > lat) {
                lat = c.lat;
            }
            if (c.lon > lon) {
                lon = c.lon;
            }
        }
    }
    return {lat: lat, lon: lon};
}

function pos(no, min, max, mult) {
    var res = mult*((no-min)/(max-min));
    console.log("POS", no, min, max, mult, res);
    return mult*((no-min)/(max-min));
}

function loadGraph(url, callback) {

    $.getJSON()
    $.ajax({
        dataType: "json",
        url: url,
        success: function(data) {
            console.log("callback called", data);
            data = parseFloats(data);

            var graph = {
                nodes: [],
                edges: []
            };

            var min = minLatLon(data);
            var max = maxLatLon(data);

            var el = document.getElementById("map");
            var width = el.clientWidth;
            var height = el.clientHeight;

            console.log("min", min);
            console.log("max", max);

            nodeIndex = {};
            edgeIndex = {};

            for (var i=0;i<data.length;i++) {
                var line = data[i];
                for (var j=0;j<line.length;j++) {
                    var c = line[j];
                    if (c.x !== undefined) {
                        continue;
                    }
                    // add some x,y to it.
                    data[i][j].x = pos(c.lon, min.lon, max.lon, width);
                    data[i][j].y = pos(c.lat, min.lat, max.lat, -height);
                }
            }

            for (var i=0;i<data.length;i++) {
                var line = data[i];
                for (var j=0;j<line.length;j++) {
                    if (nodeIndex[line[j].name] === undefined) {
                        graph.nodes.push({
                            "id": line[j].name,
                            "label": line[j].name,
                            "size": 3,
                            "x": line[j].x,
                            "y": line[j].y
                        });
                        nodeIndex[line[j].name] = true;
                    }

                    if (j > 0) {
                        var prev = line[j-1];
                        var key = prev.name+"_TO_"+line[j].name
                        if (edgeIndex[key] === undefined) {
                            graph.edges.push({
                                id: key,
                                source: prev.name,
                                target: line[j].name
                            });
                            edgeIndex[key] = true;
                        }
                    }
                }
            }
            console.log("gets here yo");
            callback(graph);
        }
    });
}

function initSigma(graph) {
    console.log("Loading graph into sigma.", graph);
    window.s = new sigma({
        graph: graph,
        // container: 'map',
        settings: {
            animationsTime: 100
        },
        renderers: [
            {
              container: document.getElementById('map'),
              type: 'canvas' // sigma.renderers.canvas works as well
            }
        ]
    });
}

function init() {
    loadGraph("coords.json", initSigma);
}

window.addEventListener("load", init);

/*
angular.module('mapApp', [])
  .controller('DelaysController', function($scope) {
      $scope.date = new Date();
  });
*/
