/* dependency */
const express = require("express");
const http = require("https");

/* func */
const distance = require("../func/distance");

/* 상수 */
const router = express.Router();
const APPKEY = ""
const options = {
    hostname: 'apis.openapi.sk.com',
    path: '/tmap/routes/pedestrian?version=1&format=json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "appKey" : APPKEY
    }
}
let returnData ='';

const request = http.request(options, res => {
    
    res.on('data', chunk => {
        returnData += chunk
    })

    request.on('error', error => {
        returnData += error
    })
});


router.get("/routing", (req, res) => {
    let srcLati = req.query.srcLati
    let srcLongti = req.query.srcLongti
    let dstLati = req.query.dstLati
    let dstLongti = req.query.dstLongti
    let pass_list = req.query.passList
    let data

    if(req.query.passList.length > 1 ){
        data = JSON.stringify({
            startX : srcLongti,
            startY : srcLati,
            endX : dstLongti,
            endY : dstLati,
            reqCoordType : "WGS84GEO",
            resCoordType : "WGS84GEO",
            startName : "출발지",
            endName : "도착지",
            passList: pass_list
        });
    }else{
        data = JSON.stringify({
            startX : srcLongti,
            startY : srcLati,
            endX : dstLongti,
            endY : dstLati,
            reqCoordType : "WGS84GEO",
            resCoordType : "WGS84GEO",
            startName : "출발지",
            endName : "도착지",
        });
    }


    request.data = data
    request.write(data)
    request.end()
    //console.log(returnData)
    let mmNode = distance.nodeCheck(returnData.toString(),srcLati, srcLongti, dstLati,dstLongti);
    //const obj = JSON.parse(returnData.toString());
    //console.log(obj.features)

    //res.send(returnData);
    res.send(mmNode);  
});

module.exports = router;