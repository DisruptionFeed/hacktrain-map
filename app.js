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

function populateSelects(stations, ids) {
    console.log(ids);
    for (var i=0;i<ids.length; i++) {
        ids[i] = document.getElementById(ids[i]);
    }
    console.log(ids);
    for (var i=0;i<stations.length;i++) {
        for (var j=0; j<stations[i].length; j++) {
            var c = stations[i][j].name;
            for (var k=0;k<ids.length;k++) {
                var el = document.createElement("option");
                el.value = c;
                el.appendChild(document.createTextNode(c));
                ids[k].appendChild(el);
            }
        }
    }
    for (var i=0;i<ids.length;i++) {
        ids[i].addEventListener("change", selectUpdated);
    }
}

function zoomTo(a, b, width, height) {
    // zoom to include a and b
    var xdiff = Math.abs(a["read_cam0:x"] - b["read_cam0:x"])+40; // 20px border
    var ydiff = Math.abs(a["read_cam0:y"] - b["read_cam0:y"])+40;

    console.log("xydiff", xdiff, ydiff);

    if (xdiff > ydiff) {
        s.camera.ratio = xdiff/width;
    } else {
        s.camera.ratio = ydiff/height;
    }

    s.camera.x = (a["read_cam0:x"] + b["read_cam0:x"])/2;
    s.camera.y = (a["read_cam0:y"] + b["read_cam0:y"])/2;

    console.log("zoom to", s.camera.x, s.camera.y, s.camera.ratio);

    s.refresh();
}

function reset(sig) {
    var nodes = sig.graph.nodes();
    for (var i=0;i<nodes.length;i++) {
        nodes[i].color = "#444444";
        nodes[i].size = 2;
    }

    var edges = sig.graph.edges();
    for (var i=0;i<edges.length;i++) {
        edges[i].color = "#444444";
        edges[i].size = 2;
    }
}

function selectUpdated() {

    reset(s);

    var from_ = document.getElementById("from_station").value;
    var to_ = document.getElementById("to_station").value;

    var nodes = s.graph.astar(from_, to_, {undirected:true});

    var node_from = nodes[0];
    var node_to = nodes[nodes.length-1];

    nodes[0].color="#00ff00";
    for (var i=1;i<nodes.length;i++) {
        nodes[i].color="#00ff00";
        var edgId = nodes[i-1].id + "_TO_" + nodes[i].id;
        var edge = s.graph.edges(edgId);
        if (edge === undefined) {
            edgId = nodes[i].id + "_TO_" + nodes[i-1].id;
            edge = s.graph.edges(edgId);
        }

        edge.color = "#00ff00";
    }

    // var node_from = s.graph.nodes(from_);
    // var node_to = s.graph.nodes(to_);

    // node_from.color = "#00ff00";
    // node_to.color = "#00ff00";

    var parent = document.getElementById("map");
    zoomTo(node_from, node_to, parent.clientWidth, parent.clientHeight);
}

function pos(no, min, max, mult) {
    var res = mult*((no-min)/(max-min));
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

            populateSelects(data, ["from_station", "to_station"]);

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
