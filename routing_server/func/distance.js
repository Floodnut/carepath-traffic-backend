exports.nodeCheck = (data, srcLati, srcLongi, dstLati, dstLongi) => {
    try{
        let obj = data;
        let totalDistance = obj["features"][0]["properties"]["totalDistance"];
        let safeNodeCount = 0;
        let node = []
        let maxLati
        let minLati
        let maxLongi
        let minLongi
        let nodeCount = 0;
        
        if(totalDistance <= 300 && totalDistance > 0 ){
            safeNodeCount = 1;
        }
        else if(totalDistance <= 500 && totalDistance > 300 ){
            safeNodeCount = 2;
        }
        else if (totalDistance <= 1000 && totalDistance > 500 ){
            safeNodeCount = 3;
        }    
        else if (totalDistance <= 5000 && totalDistance > 1000 ){
            safeNodeCount = 5;
        }    
        else if (totalDistance <= 10000 && (totalDistance/10) < 700 ){
            safeNodeCount = 6;
        }
        else if (totalDistance <= 10000 && (totalDistance/10) < 1000 ){
            safeNodeCount = 8;
        }
        else if (totalDistance <= 15000 && (totalDistance/15) < 700 ){
            safeNodeCount = 10;
        }    
        else if (totalDistance <= 15000 && (totalDistance/15) < 1000 ){
            safeNodeCount = 15;
        }else if(totalDistance > 15000){
            return { error : "Distance Too Long.", Distance: totalDistance}
        }
        else{
            safeNodeCount = -1;
        }

        if(srcLati > dstLati){
            maxLati = srcLati;
            minLati = dstLati;
        }else{
            maxLati = dstLati;
            minLati = srcLati;
        }

        if(srcLongi > dstLongi){
            maxLongi = srcLongi;
            minLongi = dstLongi;
        }else{
            maxLongi = dstLongi;
            minLongi = srcLongi;
        }

        /* 경유지 좌표 탐색 */
        for (let idx in obj["features"]){
            if (obj["features"][idx]["geometry"]["type"] == "LineString"){
                for(let idx2 in obj["features"][idx]["geometry"]["coordinates"]){
                    node.push([obj["features"][idx]["geometry"]["coordinates"][idx2][0], obj["features"][idx]["geometry"]["coordinates"][idx2][1]])

                    nodeCount += 1;
                    lastlat = obj["features"][idx]["geometry"]["coordinates"][idx2][1]
                    lastlon = obj["features"][idx]["geometry"]["coordinates"][idx2][0]

                    /* 경도 최대최소 찾기 */
                    if(maxLongi < obj["features"][idx]["geometry"]["coordinates"][idx2][0]){
                        maxLongi = obj["features"][idx]["geometry"]["coordinates"][idx2][0];
                    }
                    else if(minLongi > obj["features"][idx]["geometry"]["coordinates"][idx2][0]){
                        minLongi = obj["features"][idx]["geometry"]["coordinates"][idx2][0];
                    }

                    /* 위도 최대최소 찾기 */
                    if(maxLati < obj["features"][idx]["geometry"]["coordinates"][idx2][1]){
                        maxLati = obj["features"][idx]["geometry"]["coordinates"][idx2][1];
                    }
                    else if(minLati > obj["features"][idx]["geometry"]["coordinates"][idx2][1]){
                        minLati = obj["features"][idx]["geometry"]["coordinates"][idx2][1];
                    }
                }
            }
        }

        var validCount = parseInt(nodeCount / (safeNodeCount + 1))
        var validNode = new Array();
        
        for(let i = 1 ; i < safeNodeCount ; i++){
            var jSon= new Object();
            jSon.lo = node[(i * validCount) - 1][0]
            jSon.la = node[(i * validCount) - 1][1]
            validNode.push(jSon)
        }
        return { 
            maxmin : [maxLati, minLati, maxLongi, minLongi], 
            totaldis_count : [totalDistance, nodeCount],
            validNode
        };
    }catch(err){
        return { err }; 
    }
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    const d = R * c;

    return d
}

