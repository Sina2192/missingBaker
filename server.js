const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const axios = require('axios');
require('dotenv').config();

app.use(express.static('public'));




app.get('/', function(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');
  res.sendFile({port});

});

app.get('/getToken',  async (req, res) => {
   let response = await axios({
        url: 'https://api.enverus.com/v3/direct-access/tokens',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          'secretKey': process.env.secretKey,
          
        }
      }
).catch(err =>{console.log('Error getting token from server ')})
process.env.token = response.data.token;
res.setHeader("Access-Control-Allow-Origin", "*");
res.end();
});

app.get('/getRigLocations', async (req, res) => {
  let rigs = await axios({
        url: 'https://di-api.drillinginfo.com/v3/direct-access/rigs',
        method: 'get',
        headers: {
          'Accept': 'json',
          'Authorization': `Bearer ${process.env.token}`
        },
        params: {
          "pagesize": '10000',
          'DeletedDate': 'null'
        }
  }).catch(err => {console.log('err with rigs fetch', err)});
  let rigLocations = [];
  let excludedRigs = [];
  rigs.data.forEach((rig) => {
    if((rig['RatedHP'] !== null) && (rig['RatedHP'] <=1490)){
      rigLocations.push({
        "lat": rig.RigLatitudeWGS84,
        "lng": rig.RigLongitudeWGS84,
        "operator": rig.OperatorAlias
      }) 
    }
    else (
        excludedRigs.push(rig)
    ) 
  })
  console.log('How many coordinates we will send to client ', rigLocations.length);
  console.log('exclusions count', excludedRigs.length)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');
  res.send(rigLocations);
})


app.listen(port, () => {
  console.log(`missingBaker app listening at http://localhost:${port}`)
})