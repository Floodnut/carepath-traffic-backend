/* dependency */
const express = require("express");
const http = require("https");
//import axios from 'axios';
const axios = require("axios");

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
    "Content-Type": "application/json",
      "appKey" : APPKEY
    }
}
const headers = {
    "Content-Type": "application/json",
    "appKey" : APPKEY
}
let returnData

/*

var request = http.request(options, res => {
    res.on('data', chunk => {
        returnData += chunk
    })

    res.on('error', error => {
        returnData += error
    })
});*/

router.get("/routing", (req, res) => {
    let srcLati = req.query.srcLati
    let srcLongti = req.query.srcLongti
    let dstLati = req.query.dstLati
    let dstLongti = req.query.dstLongti
    let pass_list = req.query.passList
    let data



    if(typeof(srcLati) == "string"){
        srcLati = parseFloat(srcLati)
    }
    if(typeof(dstLati) == "string"){
        dstLati = parseFloat(dstLati)
    }
    if(typeof(srcLongti) == "string"){
        srcLongti = parseFloat(srcLongti)
    }
    if(typeof(dstLongti) == "string"){
        dstLongti = parseFloat(dstLongti)
    }

    if(req.query.passList.length > 1 ){
        data = {
            startX : srcLongti,
            startY : srcLati,
            endX : dstLongti,
            endY : dstLati,
            reqCoordType : "WGS84GEO",
            resCoordType : "WGS84GEO",
            startName : "출발지",
            endName : "도착지",
            passList: pass_list
        }
    }else{
        data = {
            startX : srcLongti,
            startY : srcLati,
            endX : dstLongti,
            endY : dstLati,
            reqCoordType : "WGS84GEO",
            resCoordType : "WGS84GEO",
            startName : "출발지",
            endName : "도착지",
        }
    }


    //request.data = data
    //console.log(axiosReq(data, headers))
    //request.write(data)
    //request.end()
    let returnData2 = axiosReq(data)
    let mmNode = distance.nodeCheck(returnData, srcLati, srcLongti, dstLati,dstLongti);
    //const obj = JSON.parse(returnData.toString());
    //console.log(obj.features)

    //res.send();
    res.send(mmNode);  
});

function axiosReq(data){

    axios.defaults.headers.post = null
    const promise = axios.post('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json', data, {headers})
    
    const dataPro = promise.then(res => {
        returnData = res.data
        return res.data
    }).catch(function (error) {
        return error;
    });
}

module.exports = router;