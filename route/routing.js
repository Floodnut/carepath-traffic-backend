/* dependency */
const express = require("express");
const axios = require("axios");

/* func */
const distance = require("../func/distance");
const traffic = require("../func/traffic");
const { response } = require("express");

/* 상수 */
const router = express.Router()
const APPKEY = ""
const host = 'https://apis.openapi.sk.com'

/* HTTP Routing Header */
const headers = {
    "Content-Type": "application/json",
    "appKey" : APPKEY
}

/* Routing Main */
router.get("/routing", (req, res) => {
    let srcLati = req.query.srcLati
    let srcLongti = req.query.srcLongti
    let dstLati = req.query.dstLati
    let dstLongti = req.query.dstLongti
    let zoom = req.query.zoom
    let congestion = req.query.congestion
    let pass_list = req.query.passList

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

    let data = {
        startX : srcLongti,
        startY : srcLati,
        endX : dstLongti,
        endY : dstLati,
        reqCoordType : "WGS84GEO",
        resCoordType : "WGS84GEO",
        startName : "출발지",
        endName : "도착지",
        searchOption : 4
    }

    minLati = srcLati > dstLati ? dstLati : srcLati
    minLongi = srcLongti > dstLongti ? dstLongti : srcLongti
    maxLati = srcLati < dstLati ? dstLati : srcLati
    maxLongi = srcLongti < dstLongti ? dstLongti : srcLongti

    // /* e.g */
    //minLat=35.230259&minLon=128.647437&maxLat=35.255705&maxLon=128.678507&reqCoordType=WGS84GEO&resCoordType=WGS84GEO
    //&trafficType=AUTO&zoomLevel=1&appKey=l7xx47ffd778fcc54f49baa6e2ea37859c5d&callback&centerLat=35.239021&centerLon=128.666009
    trafficParam = `minLat=${minLati}&minLon=${minLongi}&maxLat=${maxLati}&maxLon=${maxLongi}&zoomLevel=${zoom}&appKey=${APPKEY}&centerLat=${(maxLati+minLati)/2}&centerLon=${(maxLongi+minLongi)/2}`
    staticParam = `&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&trafficType=AUTO&callback=`

    axiosReq(data).then(returnData => { 
        trafficReq(trafficParam, staticParam).then( trafficData =>{
            resData = distance.nodeCheck(
                returnData.data, 
                srcLati, 
                srcLongti, 
                dstLati, 
                dstLongti
            )
            resData["traffic"] = traffic.trafficSearch(trafficData.data, congestion)
            // resData["traffic"] = trafficData.data["features"]
            res.send(resData)

        }).catch(error => {
            res.send({
                "error" : "traffic_Error", 
                data : error
            })
        })

    }).catch(error => {
        res.send({
            "error" : "request_Error", 
            data : error
        })
    })
});

/* Routing Request */
const axiosReq = async (data) => {
    try{
        const promise = await axios.post('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1', data, {headers})
        return promise;
    }catch(err){
        return err;
    }
}

/* Traffic Request */
const trafficReq = async (trafficParam, staticParam) => {
    try{
        const pro = await axios.get(host + '/tmap/traffic?version=1&' + trafficParam + staticParam)
        return pro;
    }catch(err){
        return err;
    }
}

module.exports = router;