// // GeoServer WMS layer
// var wmsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/webgis/wms', {
//   layers: 'webgis:osm_data1',
//   format: 'image/png',
//   transparent: true,
//   version: '1.1.1',
// attribution: ''
// });
// wmsLayer.addTo(vectorLayerGroup);

// var wmsLayerPoly = L.tileLayer.wms('http://localhost:8080/geoserver/webgis/wms', {
//   layers: 'webgis:osm_polygon',
//   format: 'image/png',
//   transparent: true,
//   version: '1.1.1',
// attribution: ''
// });
// wmsLayerPoly.addTo(vectorLayerGroup);

// var wmsLayerPoly = L.tileLayer.wms('http://localhost:8080/geoserver/webgis/wms', {
//   layers: 'webgis:vineyards',
//   format: 'image/png',
//   transparent: true,
//   version: '1.1.1',
// attribution: ''
// });
// wmsLayerPoly.addTo(vectorLayerGroup);

// var wmsLayerline = L.tileLayer.wms('http://localhost:8080/geoserver/webgis/wms', {
//   layers: 'webgis:osm_line',
//   format: 'image/png',
//   transparent: true,
//   version: '1.1.1',
// attribution: ''
// });
// wmsLayerline.addTo(vectorLayerGroup);

// var wmsLayerdraw = L.tileLayer.wms('http://localhost:8080/geoserver/webgis/wms', {
//   layers: 'webgis:osm_draw',
//   format: 'image/png',
//   transparent: true,
//   version: '1.1.1',
// attribution: ''
// });
// wmsLayerdraw.addTo(vectorLayerGroup);

// var landsatLayer = L.tileLayer.wms('http://localhost:8080/geoserver/your_workspace/wms', {
//   layers: 'your_workspace:landsat_layer',
//   format: 'image/png',
//   transparent: true,
//   attribution: 'Landsat Data © USGS'
// }).addTo(map);