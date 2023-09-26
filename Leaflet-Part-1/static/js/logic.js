// Create the tile layer that will be the background of our map.
let Quakes = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let layers = {
    earthQuake: new L.LayerGroup()
};

// Create the map with our layers.
let map = L.map("map-id", {
    center: [37.0902, -95.7129],
    zoom: 15,
    layers: [
      layers.earthQuake
    ]
});

// Add our "streetmap" tile layer to the map.
Quakes.addTo(map);

// Create an overlays object to add to the layer control.
let overlays = {
    "Earth Quakes": layers.earthQuake,   //this changes the name of the label
};

// Create a control for our layers, and add our overlays to it.
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map.
let info = L.control({
    position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend".
info.onAdd = function() {
    let div = L.DomUtil.create("div", "legend");
    return div;
};
// Add the info legend to the map.
info.addTo(map);

// Perform an API call to the USGS GeoJSON information endpoint.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson").then(function(data) {
    let quakes = data.features;

    // initialize quake counts at zero
    let quakeCount = {
        earthQuake: 0,
    };

    // loop through the earthquake data and create markers
    quakes.forEach(function(quake){
        let quakeMag = quake.properties.mag;
        let quakeDepth = quake.geometry.coordinates[2];
        let quakeLat = quake.geometry.coordinates[1];
        let quakeLong = quake.geometry.coordinates[0];

        // set up the circles on the map overlay
        let circle = L.circle([quakeLat, quakeLong], {
            color: getColor(quakeDepth),
            fillColor: getColor(quakeDepth),
            fillOpacity: 0.6,
            radius: quakeMag * 1000 // *1000 is a radius scaling factor
        }).addTo(layers.earthQuake);

        // update the station count for the function
        stationCount.earthQuake++;

        // popup some info from each quake shall we :3
        circle.bindPopup("magnitude: " + quakeMag + "<br>Depth: " + quakeDepth + " km")
    });

    updateLegend(new Date().getTime(), quakeCount);

};
// Chroma.js lib for color gradient
const chroma = require('chroma-js');

// color scale for depth gradient
const colorScale = chroma.scale(['#8AFB28', '#0E9C19']).domain([0, 100]);

// define a functoin to calculate the color based on the depth
function getColor(depth) {
    let colorValue = colorScale(depth);
    return colorValue.hex(); 
};

// Update the legend's innerHTML with the last updated time and station count.
function updateLegend(time, stationCount) {
    document.querySelector(".legend").innerHTML = [
      "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
      "<p class='Color Shade: " + stationCount.earthQuake + "</p>",
    ].join("");
};