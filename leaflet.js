//1. MAP TEMPLATE
// Leaflet map initialization
let map = L.map('map').setView([35.677, 139.76], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.control.scale().addTo(map);

// //Marker
// map.on("click", function (e) {
//     var marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map)
//         .bindPopup('You are Here')
//         .openPopup();
// });
// //coordinate
// map.on('mousemove', function (e) {
//    console.log(e)
//    $('.coordinate').html(`Lat: ${e.latlng.lat} Lng: ${e.latlng.lng}`)
// })

//2. LEAFLET DRAW FUNCTIONALITY
drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);
var drawControl = new L.Control.Draw({
    draw: {
        rectangle: true,
        polygon: true,
        circle: false,
        marker: false
    },
    edit: {
        featureGroup: drawnItems
    }
});

//draw feature
let drawtype, layer, bounds, north, south, east, west, disastercoordinate;
let y, x, deltax, deltay; 
var disastertags, disasterid;

map.addControl(drawControl);
map.on('draw:created', function (e) {
    drawtype = e.layerType;
    layer = e.layer;
    // Getting the bounding box
    if (drawtype === 'rectangle') {
        bounds = layer.getBounds();
        north = bounds.getNorth();
        south = bounds.getSouth();
        east = bounds.getEast();
        west = bounds.getWest();

        y = Math.ceil((north-south)/0.002);
        deltay = (north-south)/y; 
        x = Math.ceil((east-west)/0.002); 
        deltax = (east-west)/x;
        console.log('Rectangle Bounds: (north, south, east, west)= ', bounds, north, south, east, west, y, x, deltax, deltay);
    }
    else if (drawtype === 'polygon') {
        var disastercoordinate1 = layer.getLatLngs()[0];
        disastercoordinate1.push(disastercoordinate1[0]);
        disastercoordinate = disastercoordinate1;
        console.log('polygon coordinate:', disastercoordinate);

        alert("click on the polygon to input ID and tags");
        // Open a popup for user input
        var popupContent = "<form id='popupForm'>" +
            "<label for='disasterid'>ID: (integer)</label><br>" +
            "<input type='text' id='disasterid' name='disasterid'><br>" +
            "<label for='disastertags'>Disaster Tags: (alphabet)</label><br>" +
            "<input type='text' id='disastertags' name='disastertags'><br><br>" +
            "<input type='button' value='Submit' onclick='submitForm()'>" +
            "</form>";

        layer.bindPopup(popupContent).openPopup();
    }
    drawnItems.addLayer(layer);
});

function submitForm() {
    disasterid = document.getElementById('disasterid').value;
    disastertags = document.getElementById('disastertags').value;

        // Validation
        if (!Number.isInteger(parseInt(disasterid))) {
            alert("ID must be an integer.");
            return; 
        }
        if (!/^[a-zA-Z]+$/.test(disastertags)) {
            alert("Tags should only contain alphabet characters.");
            return;
        }
    console.log('ID:', disasterid, 'Tags:', disastertags);
}

// 4. Database Modification (CRUD)
//4.1 DELETE
function deletingData() {
    const url = "http://localhost:3000/deletedata";
    fetch(url, {
        method: "DELETE",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:3000/"
        }
    })
    .then(() => {
        console.log("data deleted successfully.");
    })
    .catch(error => {
        console.error("Error deleting data:", error);
    });
}

//4.2 REFRESH
function refresh(){
    location.reload();
}

//4.3.1 POST (POINT)
const postingData = (postId, posttype, posttags, postlat, postlon) => {
    const url = "http://localhost:3000/postdata";
    fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:3000/"
        },
        body: JSON.stringify({
            id: postId,
            type: posttype,
            tags: posttags,
            latitude: postlat,
            longitude: postlon
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();})
    .then(data => {
        console.log("Data successfully inserted into database (point):", data.message);
    })
    .catch(error => {
        if (error.status = 409){
            console.error("data is already in database",error.status);
        }
        else {
            console.error("Error inserting data into database (point):", error, error.status);
        }
    });
};
//4.3.2 POST (POLYGON)
const postingDatapolygon = (postId, posttype, posttags, postcoordinates) => {
    const url = "http://localhost:3000/postdatapolygon";
    fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:3000/"
        },
        body: JSON.stringify({
            id: postId,
            type: posttype,
            tags: posttags,
            geometry: postcoordinates
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();})
    .then(data => {
        console.log("Data successfully inserted into database (polygon):", data.message);
    })
    .catch(error => {
        if (error.status = 409){
            console.error("data is already in database",error.status);
        }
        else {
            console.error("Error inserting data into database (point):", error, error.status);
        }
    });
};

//4.3.3 POST (Disaster)
const postingdraw = (disasterid, disastertags, disastercoordinate) => {
    const url = "http://localhost:3000/postdraw";
    fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:3000/"
        },
        body: JSON.stringify({
            id: disasterid,
            tags: disastertags,
            geometry: disastercoordinate
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();})
    .then(data => {
        console.log("Data successfully inserted into database (polygon):", data.message);
    })
    .catch(error => {
        if (error.status = 409){
            console.error("data is already in database",error.status);
        }
        else {
            console.error("Error inserting data into database (point):", error, error.status);
        }
    });
};

//4.3.4 POST (LINE)
const postingdataline = (postId, posttype, posttags, postcoordinates) => {
    const url = "http://localhost:3000/postdataline";
    fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:3000/"
        },
        body: JSON.stringify({
            id: postId,
            type: posttype,
            tags: posttags,
            geometry: postcoordinates
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();})
    .then(data => {
        console.log("Data successfully inserted into database (line):", data.message);
    })
    .catch(error => {
        if (error.status = 409){
            console.error("data is already in database",error.status);
        }
        else {
            console.error("Error inserting data into database (point):", error, error.status);
        }
    });
};

//3. DOWNLOAD OSM DATA VIA OVERPASS----------------------------------------------------------------------------------------------------
// 3.1 Function to download OSM data using Overpass API
var elements;
async function downloadOSMData() {
    //1. retrieve input tags from user
    let type;
    const nodeRadio = document.getElementById('node');
    const wayRadio = document.getElementById('way');

    if (nodeRadio.checked) {
        type = 'node';
    } else if (wayRadio.checked) {
        type = 'way';
    } else {
        alert('Please select either Node or Way.');
        return;
    }

    // Retrieve the values from the text input fields
    let key = document.getElementById('key').value;
    let value = document.getElementById('value').value;

    console.log('Type:', type);
    console.log('Key:', key);
    console.log('Value here:', value);
    
    // 2. Defining osmquery
    for(let i = 0; i < y; i++){
        for(let j = 0; j < x; j++){
            // checking if the rectangle is drawn
            if (drawtype === 'rectangle') {
                //check if tags has value
                const selectedcheckboxes = Array.from(document.querySelectorAll('.form-check-input:checked'));
                if (selectedcheckboxes.length === 0) {
                  alert('Please select at least one tag.');
                  return;
                }
                const conditions = selectedcheckboxes.map(checkbox => {
                    if (value === undefined || value === null || value === ''){
                        return `${type}(${south+i*deltay},${west+j*deltax},${south+(i+1)*deltay},${west+(j+1)*deltax})["${key}"];`;
                    }
                    else {
                        return `${type}(${south+i*deltay},${west+j*deltax},${south+(i+1)*deltay},${west+(j+1)*deltax})["${key}"="${value}"];`;
                    }
                });
                console.log("after: " , conditions);
                const osmquery = `[out:json];(${conditions.join('')});(._;>;);out;`;
                // Fetch data from Overpass API using the combined query
                await fetchDataFromOverpass(osmquery);
            }
        
            else if (drawtype !== 'rectangle'){
                alert('Please draw a rectangle')
            }        
        }
    }
}
//3.2 Fetching data from Ovrpass
async function fetchDataFromOverpass(osmquery) {
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    try {
        const response = await fetch(overpassUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ data: osmquery }),
        });
        const data = await response.json();
        elements = data.elements.map(element => {
            if (element.type === 'node') {
                return {
                    id: element.id,
                    type: element.type,
                    tags: element.tags,
                    latitude: element.lat,
                    longitude: element.lon,
                };
            } else if (element.type === 'way') {
                const waycoordinates = element.nodes.map(nodeId => {
                    const node = data.elements.find(el => el.type === 'node' && el.id === nodeId);
                    return {
                        longitude: node.lon,
                        latitude: node.lat,
                    };
                });
                return {
                    id: element.id,
                    type: element.type,
                    tags: element.tags,
                    coordinates: waycoordinates,
                };
            }
        });
        console.log('Extracted Data:', data, elements.length);
        console.log('element: ', elements);
        processElements();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
//3.3 POSTING data to DATABASE
function processElements() {
    for (var x = 0; x < elements.length; x++) {
        const { id, type, tags, coordinates, latitude, longitude } = elements[x];
        if (type === 'way' && JSON.stringify(coordinates[0]) === JSON.stringify(coordinates[coordinates.length - 1])) {
            postingDatapolygon(id, type, tags, coordinates);
            console.log('x:', [x], 'coordinate: ', coordinates);
        } else if (type === 'way' && JSON.stringify(coordinates[0]) !== JSON.stringify(coordinates[coordinates.length - 1])) {
            postingdataline(id, type, tags, coordinates);
            console.log('x:', [x], 'coordinate: ', coordinates);
        } if (type === 'node' && tags !== undefined) {
            postingData(id, type, tags, latitude, longitude);
            console.log('x:', [x]);
        }
    }
}

//5 Posting Draw Functionality
function adddraw(){
    if(drawtype === 'polygon'){
        postingdraw(disasterid, disastertags, disastercoordinate)
    } else if(drawtype !== 'polygon'){
        alert("Please Draw a Polygon!")
    }
}

// 6. REMOTE SENSING PART
//6.1 Defining Date
let selectedDate, threemonthago;
document.getElementById('date').addEventListener('submit', function (event) {
  event.preventDefault();
  //USED
  selectedDate = document.getElementById('day_of_disaster').value;
  //PROCESS
  const currentDate = new Date(selectedDate);
  const threemonth = new Date(currentDate);
  threemonth.setMonth(currentDate.getMonth() - 3);

  //USED
  threemonthago = threemonth.toISOString().split('T')[0];
  console.log("selected Date: ", selectedDate, "3 month: ", threemonthago);
});

//6.2 Defining Satellite
var selectedsatellites = ['landsat9before','sentinel2before', 'modisbefore']; // Global variable to store the selected satellite
function updateSatellite(checkboxId) {
  var checkbox = document.getElementById(checkboxId);
  // Check if the checkbox is checked or unchecked
  if (checkbox.checked) {
      // Add the checkboxId to the array if it's not already present
     if (!selectedsatellites.includes(checkboxId)) {
        selectedsatellites.push(checkboxId);
     }
  } else {
      // Remove the checkboxId from the array if it's present
      selectedsatellites = selectedsatellites.filter(id => id !== checkboxId);
  }
  console.log('Selected Satellites:', selectedsatellites);
}

//6.3 ADDING LAYER
const addingLayer = (urlLayer,satellite) =>{
    const geeLayer = L.tileLayer(urlLayer, {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: "false",
        crossOrigin: true
      });
    console.log('urllayer= ', urlLayer)
    let layerGroup;
    if (satellite === 'Landsat9') {
        layerGroup = landsatlayer;
    } else if (satellite === 'Sentinel2') {
        layerGroup = sentinellayer;
    } else if (satellite === 'Modis') {
        layerGroup = modislayer;
    } else if (satellite === 'landsat9before') {
        layerGroup = landsatbefore;
    } else if (satellite === 'sentinel2before') {
        layerGroup = sentinelbefore;
    } else if (satellite === 'modisbefore') {
        layerGroup = modisbefore;
    }
    geeLayer.addTo(layerGroup);
};

// 6.4 Fetching Data to Backend
const fetchingData = async () => {
    for (const satellite of selectedsatellites) {
        await fetch("http://localhost:3000/GEE", {
            method: "POST",
            mode: "cors",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                north: north,
                south: south,
                east: east,
                west: west,
                selectedDate: selectedDate,
                threemonthago: threemonthago,
                selectedsatellites: [satellite]
            })
        })
        .then((response) => response.json())
        .then(urlLayer  => {
            addingLayer(urlLayer, satellite);
        });
    }
};

// 6.5 Remotesensing Trigger Button
function retrievedata() {
    if (selectedDate === undefined){alert ('Please define Date')}
    else if (north === undefined){alert ('Please Draw Rectangle area')}
    else if (selectedsatellites.length < 4){alert('Please Select satellite')}
    else fetchingData(north, south, east, west, selectedDate, threemonthago, selectedsatellites);
}

//7. ldproxy
const ldproxy_API = 'http://localhost:7080/rest/services/osm_polygon/collections/osm_polygon/tiles/WebMercatorQuad/{z}/{y}/{x}?f=mvt';
var ldproxyLayer = L.vectorGrid.protobuf(ldproxy_API, {
    vectorTileLayerStyles: {
        osm_polygon: {
            fill        : true,
            fillOpacity : 1, // Adjust the fill opacity here (value between 0 and 1)
            fillColor   : 'black', // Fill color
            color       : 'black', // Outline color
            weight      : 1, // Outline weight
        }
    }
}).addTo(map);

// 8. Geoserver WFS
var geojsonStyle = {
    fillColor: "black",
    color: "black",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
};

var wfs_poly_url =
    "http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=webgis:osm_polygon&outputFormat=application/json&srsName=epsg:4326";

$.getJSON(wfs_poly_url).then((res) => {
    var wfslayer = L.geoJson(res, {
        style: geojsonStyle,
    }).addTo(vectorLayerGroup);
    map.fitBounds(wfslayer.getBounds());
});

var wfs_draw_url =
    "http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=webgis:osm_draw&outputFormat=application/json&srsName=epsg:4326";

$.getJSON(wfs_draw_url).then((res) => {
    var wfslayer = L.geoJson(res, {
        style: geojsonStyle,
    }).addTo(vectorLayerGroup);
    map.fitBounds(wfslayer.getBounds());
});

var wfs_line_url =
    "http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=webgis:osm_line&outputFormat=application/json&srsName=epsg:4326";

$.getJSON(wfs_line_url).then((res) => {
    var wfslayer = L.geoJson(res, {
        style: geojsonStyle,
    }).addTo(vectorLayerGroup);
    map.fitBounds(wfslayer.getBounds());
});

var wfs_point_url =
    "http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeNames=webgis:osm_data1&outputFormat=application/json&srsName=epsg:4326";

$.getJSON(wfs_point_url).then((res) => {
    var wfslayer = L.geoJson(res, {
        style: geojsonStyle,
    }).addTo(vectorLayerGroup);
    map.fitBounds(wfslayer.getBounds());
});

// 9. CONTROL LAYER
var vectorLayerGroup = L.layerGroup();
var landsatlayer     = L.layerGroup();
var sentinellayer    = L.layerGroup();
var modislayer       = L.layerGroup();
var landsatbefore    = L.layerGroup();
var sentinelbefore   = L.layerGroup();
var modisbefore      = L.layerGroup();

var baseLayers = {
    "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
};

var overlays = {
    "Geoserver layer"         : vectorLayerGroup,
    "Landsat 9 Recent"    : landsatlayer,
    "Sentinel 2 Recent"   : sentinellayer,
    "Modis Recent"        : modislayer,
    "Landsat 9 Before"    : landsatbefore,
    "Sentinel 2 Before"   : sentinelbefore,
    "Modis Before"        : modisbefore,
    "ldproxy layer"       : ldproxyLayer
};
L.control.layers(baseLayers, overlays).addTo(map);