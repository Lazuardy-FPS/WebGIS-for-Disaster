const express = require ('express');
const bodyparser = require ('body-parser');
const app = express();
const {Client} = require('pg');
const cors = require('cors');
const ee = require('@google/earthengine');
const disasterKey = require('./key/disasterkey.json');
const PORT = process.env.PORT || 3000;

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

//define database
const pgdatabase = new Client({
  user: 'postgres',
  password: 'postgres',
  database: 'osm_db',
  host: 'localhost', 
  port: 5432,
});

pgdatabase.connect((err)=>{
    if(err) throw err;
    else console.log("database is sucesfully connected")
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//REQUEST
app.get('/data', (req,res)=>{
  pgdatabase.query('select * from osm_data', (err,results)=>{
    if(err) console.log(err);
    res.status(200).json(results.rows);
  })
});

//DELETE
app.delete('/deletedata', cors(), (req, res) => {
  const queryFetching = `DELETE FROM osm_data;
                         DELETE FROM osm_polygon;
                         DELETE FROM osm_draw;
                         DELETE FROM osm_line;`;
  pgdatabase.query(queryFetching, (err, results) => {
      if (err) {
          console.log(err);
          res.status(500).send('Error deleting all data from the database');
      } else {
          res.status(200).json({ message: 'All data deleted successfully.' });
      }
  });
}); 

function extractHazardType(tags) {
    return tags.hazard || tags.hazard_type || null;
}

//POST
app.post('/postdata', cors(), async (req, res) => {
  try {
      const { id, type, tags, latitude, longitude } = req.body;
    // checking if the data is already in database
      const check = `SELECT id from osm_data WHERE id = $1`;
      const querycheck = await pgdatabase.query(check, [id]);

      if (querycheck.rows.length > 0) {
        // check if Data with the given id already exists
        console.log('Data with id', id, 'already exists in the database.');
        res.status(409).json({ message: 'Data with the given id already exists.' });
    } else {
        const hazardType = extractHazardType(tags);
          const queryFetching = `
              INSERT INTO osm_data (id, type, tags, latitude, longitude, geom, hazard_type)
              VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($5, $4), 4326), $6)
          `;
          await pgdatabase.query(queryFetching, [id, type, tags, latitude, longitude, hazardType]);
          console.log('Success:', queryFetching);
          res.status(200).json({ message: 'Data inserted successfully.' });
    }
  } catch (error) {
      console.error('Error inserting into the database:', error);
      res.status(500).send('Error inserting data into the database');
  }
});

app.post('/postdatapolygon', cors(), async (req, res) => {
  try {
      const { id, type, tags, geometry } = req.body;
      console.log("geom= ", geometry)
      // Check if 'coordinates' property exists and is an array
      if (!geometry || !Array.isArray(geometry)) {
          throw new Error('Invalid or missing coordinates.');
      }

      // checking if the data is already in database
      const check = `SELECT id from osm_polygon WHERE id = $1`;
      const querycheck = await pgdatabase.query(check, [id]);

      if (querycheck.rows.length > 0) {
        // check if Data with the given id already exists
        console.log('Data with id', id, 'already exists in the database.');
        res.status(409).json({ message: 'Data with the given id already exists.' });
      }

      //posting start here
      else {
      const polygonCoordinates = geometry.map(coord => `${coord.longitude} ${coord.latitude}`).join(',');
      const polygonCoordinates2 = geometry.map(coord => `${coord.latitude} ${coord.longitude}`).join(',');
      const hazardType = extractHazardType(tags);
      console.log("coordinates = ", polygonCoordinates,polygonCoordinates2)

      const queryFetching = `INSERT INTO osm_polygon (id, type, tags, geom, ld_geom, hazard_type) 
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(${polygonCoordinates})')), 4326), 
      ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(${polygonCoordinates2})')), 4326), $4)`;
      await pgdatabase.query(queryFetching, [id, type, tags, hazardType]);
      console.log('Success:', queryFetching);
      res.status(200).json({ message: 'Data inserted successfully.' });
      }
  } catch (error) {
      console.error('Error inserting into the database:', error);
      res.status(500).send('Error inserting data into the database');
  }
});

app.post('/postdraw', cors(), async (req, res) => {
    try {
        const { id, tags, geometry} = req.body;
        console.log("id= ", id, "tags= ", tags,"geom = ", geometry)
        
        // Check if 'coordinates' property exists and is an array
        if (!geometry || !Array.isArray(geometry)) {
            throw new Error('Invalid or missing coordinates.');
        }
  
        // checking if the data is already in database
        const check = `SELECT id from osm_draw WHERE id = $1`;
        const querycheck = await pgdatabase.query(check, [id]);
  
        if (querycheck.rows.length > 0) {
          // check if Data with the given id already exists
          console.log('Data with id', id, 'already exists in the database.');
          res.status(409).json({ message: 'Data with the given id already exists.' });
        }
  
        //posting start here
        else {
        const polygonCoordinates = geometry.map(coord => `${coord.lng} ${coord.lat}`).join(',');
        const polygonCoordinates2 = geometry.map(coord => `${coord.lat} ${coord.lng}`).join(',');
        console.log("coordinates = ",polygonCoordinates, polygonCoordinates2 )
  
        const queryFetching = `INSERT INTO osm_draw (id, geom, ld_geom, tags) VALUES ($1, ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(${polygonCoordinates})')), 4326), ST_SetSRID(ST_MakePolygon(ST_GeomFromText('LINESTRING(${polygonCoordinates2})')), 4326), $2)`;
        
        await pgdatabase.query(queryFetching, [id, tags]);
        console.log('Success:', queryFetching);
        res.status(200).json({ message: 'Data inserted successfully.' });
        }
    } catch (error) {
        console.error('Error inserting into the database:', error);
        res.status(500).send('Error inserting data into the database');
    }
  });

app.post('/postdataline', cors(), async (req, res) => {
    try {
      const { id, type, tags, geometry } = req.body;
      // Check if 'coordinates' property exists and is an array
      if (!geometry || !Array.isArray(geometry)) {
          throw new Error('Invalid or missing coordinates.');
      }

      const check = `SELECT id from osm_line WHERE id = $1`;
      const querycheck = await pgdatabase.query(check, [id]);

      if (querycheck.rows.length > 0) {
        // Check if Data with the given id already exists
        console.log('Data with id', id, 'already exists in the database.');
        res.status(409).json({ message: 'Data with the given id already exists.' });
      }
       //posting start here
        else {
            const lineStringCoordinates = geometry.map(coord => `${coord.longitude} ${coord.latitude}`).join(',');
            const lineStringCoordinates2 = geometry.map(coord => `${coord.latitude} ${coord.longitude}`).join(',');
            const hazardType = extractHazardType(tags);
            const queryFetching = `INSERT INTO osm_line (id, type, tags, geom, ld_geom, hazard_type) VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromText('LINESTRING(${lineStringCoordinates})'), 4326), ST_SetSRID(ST_GeomFromText('LINESTRING(${lineStringCoordinates2})'), 4326), $4)`;
            await pgdatabase.query(queryFetching, [id, type, tags, hazardType]);
            console.log('Success:', queryFetching);
            res.status(200).json({ message: 'Data inserted successfully.' });
        }
    } 
    catch (error) {
      console.error('Error inserting into the database:', error);
      res.status(500).send('Error inserting data into the database');
    }
});

//Remote Sensing
ee.data.authenticateViaPrivateKey(disasterKey, ()=>{
    ee.initialize( null, null,
        () => {
          console.log('GEE is successfully initialized');
        },
        (err) => {
          console.log(err);
          console.log(
              `There is a problem with Oauth 2, kindly check the guidance again.`);
        });
})

app.post('/GEE', cors(), (req, res)=>{
    const {north, south, east, west, selectedDate, threemonthago, selectedsatellites} = req.body;
    const AOI = ee.Geometry.Polygon(
        [
            [east, north], 
            [east, south],
            [west, south], 
            [west, north]
        ])
    const startdate = threemonthago;
    const enddate =  selectedDate;
    const satellites = selectedsatellites;
    let results = [];
    
    console.log("N S E W = ", north, "Start Date = ", startdate, "end date = ", enddate, "selected satellites: ", satellites);

    // Process each selected satellite
    for (const satellite of satellites) {
        let imageRaw, imageQuery, visualParams;
        //1 Sentinel
        if (satellite.includes('Sentinel2')) {
            imageRaw = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');
            imageQuery = imageRaw.filterBounds(AOI).filterDate(startdate, enddate).sort('GENERATION_TIME', false).first();
            visualParams = {
                'bands': ['B4', 'B3', 'B2'],
                'min': 0.0,
                'max': 3000
                // 'gamma': [0.95, 1.1, 1]
            };
        } 

        if (satellite.includes('sentinel2before')) {
            imageRaw = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');
            imageQuery = imageRaw.filterBounds(AOI).filterDate(startdate, enddate).sort('CLOUD_COVERAGE_ASSESSMENT').first();
            visualParams = {
                'bands': ['B4', 'B3', 'B2'],
                'min': 0.0,
                'max': 3000
                // 'gamma': [0.95, 1.1, 1]
            };
        }
        //2 Landsat
        else if (satellite.includes('Landsat9')) {
            imageRaw = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA');
            imageQuery = imageRaw.filterBounds(AOI).filterDate(startdate, enddate).sort('DATE_ACQUIRED',false).first();
            visualParams = {
                'bands': ['B4', 'B3', 'B2'],
                'min': 0,
                'max': 0.5,
                'gamma': [0.95, 1.1, 1]
            };
        }

        else if (satellite.includes('landsat9before')) {
            imageRaw = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA');
            imageQuery = imageRaw.filterBounds(AOI).filterDate(startdate, enddate).sort('CLOUD_COVER').first();
            visualParams = {
                'bands': ['B4', 'B3', 'B2'],
                'min': 0,
                'max': 0.5,
                'gamma': [0.95, 1.1, 1]
            };
        }
        //3. MODIS
        else if (satellite.includes('Modis')) {
            imageRaw = ee.ImageCollection('MODIS/061/MOD09GQ');
            imageQuery = imageRaw.filterBounds(AOI).filterDate(startdate, enddate).sort('system:time_start',false).first();
            visualParams = {
                'bands': ['sur_refl_b02', 'sur_refl_b02', 'sur_refl_b01'],
                'min'  : -100.0,
                'max'  : 8000.0,
            };
        }

        else if (satellite.includes('modisbefore')) {
            imageRaw = ee.ImageCollection('MODIS/061/MOD09GQ');
            imageQuery = imageRaw.filterBounds(AOI).filterDate(startdate, enddate).sort('CLOUD_COVER').first();
            visualParams = {
                'bands': ['sur_refl_b02', 'sur_refl_b02', 'sur_refl_b01'],
                'min'  : -100.0,
                'max'  : 8000.0,
            };
        }

        const eeImage = ee.Image(imageQuery);
        const mapInfo = eeImage.getMapId(visualParams);
        results.push(mapInfo.urlFormat);
        res.status(200).json(mapInfo.urlFormat);
        console.log("eeimage: ", eeImage,"mapinfo : ", mapInfo, "mapinfo url format : ", mapInfo.urlFormat)
    }
})