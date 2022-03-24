/* dependency */
const express = require("express");
const axios = require("axios")
const mysql = require("mysql")

/* route */
let routing = require("./route/routing");
const traffic = require("./func/traffic")

/* 상수 */
const app = express();
const PORT = 9001;
const HOST = '0.0.0.0';
const MINUTE = 60 * 1000 ;
const APPKEY = ""
const APIKEY = ""
const dbCon = mysql.createConnection({
    host: "localhost",
    user: "",
    password: "",
    database: ""
})

// const cm_ctLat = 35.18840002173209
// const cm_ctLon = 128.62080574035684
const cm_ctLat = 35.216694074228435
const cm_ctLon = 128.633471860886
const j_ctLat = 35.13436955848557
const j_ctLon = 128.73624801635782

const tmaptrafficReq = async (clt, clo) => {
    try{
        const pro = await axios.get(`https://apis.openapi.sk.com/tmap/traffic?version=1&zoomLevel=13&appKey=${APPKEY}&centerLat=${clt}&centerLon=${clo}&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&trafficType=AUTO`)
        return pro;
    }catch(err){
        return err;
    }
}

const trafficReq = async () => {
    try{
        const pro = await axios.get(`https://openapi.its.go.kr:9443/trafficInfo?apiKey=${APIKEY}&type=all&minX=128.3677&maxX=128.8432&minY=35.0521&maxY=35.3906&getType=json`)
        return pro;
    }catch(err){
        return err;
    }
}

const isValid = (a, b, c) =>{
    let aa = false
    let bb = false
    let cc = false
    if (a.startsWith("414") || a.startsWith("415") || a.startsWith("416") || a.startsWith("417")){
        aa = true
    }
    if (b.startsWith("414") || b.startsWith("415") || b.startsWith("416") || b.startsWith("417")){
        bb = true
    }
    if (c.startsWith("414") || c.startsWith("415") || c.startsWith("416") || c.startsWith("417")){
        cc = true
    }

    return aa * bb * cc
}

app.get("/routing", routing); 

app.listen(PORT, () => {
    console.log(`${new Date} \n-->> Server start on ${HOST}:${PORT}`)

    setInterval(() => {
        tmaptrafficReq(cm_ctLat, cm_ctLon).then( trafficData =>{
           let tr = traffic.tmaptrafficSearch(trafficData.data, 2)
            try{
                dbCon.query('delete from tmaptraffic;', (err, result)=>{
                    if(err) throw err;
                });

                for(let idx in tr["trafficData"]){
                    for(let j = 0 ; j < tr["trafficData"][idx]["coor"].length; j += 2){
                        let cong = tr["trafficData"][idx]["congestion"]
                        let lt =  tr["trafficData"][idx]["coor"][j+1]
                        let lon = tr["trafficData"][idx]["coor"][j] 
                        let query = `insert into tmaptraffic(congestion, lat, lon, modified) values(${cong},${lt},${lon},now());`
                        dbCon.query(query, (err, result)=>{
                            if(err) throw err;
                        });
                    }
                }
            }catch(err){

            }
        });
        
        trafficReq().then( trafficData =>{
            try{
                let tr = trafficData.data
                dbCon.query('delete from traffic;', (err, result)=>{
                    if(err) throw err;
                });

                for(let idx in tr["body"]["items"]){
                    let dt = tr["body"]["items"][idx]
                    let speed = dt["speed"]
                    let linkId = dt["linkId"]
                    let startNodeId = dt["startNodeId"]
                    let endNodeId = dt["endNodeId"]
                    if (speed > 50 ){
                        continue
                    }
                    if(isValid(linkId, startNodeId, endNodeId)){
                        if(speed <= 50 && speed > 30){
                            let cong = 2
                            let query = `insert into traffic(congestion, linkid, tnode, fnode, modified) values(${cong},${linkId},${startNodeId},${endNodeId},now());`
                            dbCon.query(query, (err, result)=>{
                                if(err) throw err;
                            });
                        }
                        else if (speed <= 30 && speed > 20){
                            let cong= 3
                            let query = `insert into traffic(congestion, linkid, tnode, fnode, modified) values(${cong},${linkId},${startNodeId},${endNodeId},now());`
                            dbCon.query(query, (err, result)=>{
                                if(err) throw err;
                            });
                        }                    
                        else if (speed <= 20){
                            let cong = 4
                            let query = `insert into traffic(congestion, linkid, tnode, fnode, modified) values(${cong},${linkId},${startNodeId},${endNodeId},now());`
                            dbCon.query(query, (err, result)=>{
                                if(err) throw err;
                            });
                        }
                    }      
                }
                
            }catch(err){

            }
        });
    },  5000);
})
