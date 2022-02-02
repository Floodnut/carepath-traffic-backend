/* dependency */
const express = require("express");
const http = require("https");
//import axios from 'axios';
const axios = require("axios");

/* func */
const distance = require("../func/distance");
const { response } = require("express");

/* 상수 */
const router = express.Router();
const APPKEY = "l7xx47ffd778fcc54f49baa6e2ea37859c5d"
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
    try{
        axiosReq(data).then(returnData => { 
            res.send(distance.nodeCheck(returnData.data, srcLati, srcLongti, dstLati,dstLongti))
        })
    }catch(err){
        res.send({data : err})
    }
});

const axiosReq = async (data) => {
    const promise = await axios.post('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json', data, {headers})
    return promise;
}

module.exports = router;