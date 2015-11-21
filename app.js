var colors = {
    disruption: "#990000",
    normal: "#999999",
    normal_station: "#222222",
    disruption_station: "#ff0000"
}

var Map = function(canvasId, colors) {

    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d")
    this.colors = colors;

    this.stations = [[0, "nothing"]];
    this.disruptions = {};

    this.fill = function(colName) {
        this.ctx.strokeStyle = undefined;
        this.ctx.lineWidth = "0px";
        this.ctx.fillStyle = (this.colors[colName]);
        this.ctx.fill();
        console.log("fill!");
    }.bind(this)

    this.stroke = function(colName) {
        this.ctx.strokeStyle = this.colors[colName];
        this.ctx.lineWidth = "3px";
        // this.ctx.fillStyle = undefined;
        this.ctx.stroke();
        console.log("stroke!");
    }.bind(this);

    this.update = function(data) {
        this.disruptions = data["disruptions"];
        this.stations = data["stations"];

        this.draw();
    }.bind(this);

    this.disr = function(a,b) {
        return this.disruptions[a] || this.disruptions[b];
    }.bind(this);

    this.draw = function() {
        this.ctx.clearRect(0,0,this.width,this.height);

        // line
        var longest = this.stations[0];
        var width = 0.9 * this.width;
        var height = 3;
        var x = (this.width - width)/2;
        var y = (this.height - height)/2;

        this.ctx.beginPath();
        this.ctx.rect(x,y,width,height);
        this.fill("normal");
        //this.ctx.closePath();

        var sum = 0;
        for (var i=0;i<longest.length;i++) {
            sum+=longest[i][0];
        }
        var px_per_nr = width / sum;

        for (var i=0;i<longest.length;i++) {
            x += longest[i][0]*px_per_nr;

            // draw a station Circle
            this.ctx.arc(x,y,7,0,2*Math.PI);
            this.stroke(this.disr(longest[i][1], false) ? "disruption_station" : "normal_station");
        }

    }.bind(this);

    this.resize = function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.draw();
    }.bind(this);

    // resize once.
    this.resize();
};

function init() {
    window.map = new Map("canvas", colors);
    window.addEventListener("resize", map.resize);

    var stations = [[
    	[0, "Swindon"],
    	[0.5, "Didcot Parkway"],
    	[0.5, "Cholsey"],
    	[0.5, "Goring & Streatley"],
    	[0.5, "Pangbourne"],
    	[0.5, "Tilehurst"],
    	[0.5, "Reading"],
    	[1, "Twyford"],
    	[1, "Maidenhead"],
    	[0.5, "Taplow"],
    	[0.5, "Burnham"],
    	[0.5, "Slough"],
    	[0.5, "Langley"],
    	[0.5, "Iver"],
    	[0.5, "West Drayton"],
    	[0.5, "Hayes & Harlington"],
    	[0.5, "Southall"],
    	[0.5, "Hanwell"],
    	[1, "West Ealing"],
    	[0.5, "Ealing Broadway"],
    	[0.5, "Acton Main Line"],
    	[0.7, "London Paddington"]
    ]];

    window.map.update({stations:stations, disruptions:{}});
};

window.addEventListener("load", function() {
    init();
});
