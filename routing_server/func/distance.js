exports.nodeCheck = (data, srcLati, srcLongi, dstLati, dstLongi) => {
    try{
        let obj = data;
        let totalDistance = obj["features"][0]["properties"]["totalDistance"];
        let safeNodeCount = 0;
        let node = [];
        let nodeCount = 0;
        let acc = 0;
        /* 경도 최대최소 초기화 */
        let maxLongi = Math.max(srcLongi, dstLongi);
        let minLongi = Math.min(srcLongi, dstLongi);

        /* 위도 최대최소 초기화 */
        let maxLati = Math.max(srcLati, dstLati);
        let minLati = Math.max(srcLati, dstLati);

        
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

        /* 경유지 좌표 탐색 */
        for (let idx in obj["features"]){

            let nodeType = obj["features"][idx]["geometry"]["type"];

            /* Point(회전점)일 경우 */
            if (nodeType == "Point"){
                lastlat = obj["features"][idx]["geometry"]["coordinates"][1];
                lastlon = obj["features"][idx]["geometry"]["coordinates"][0];

                /* 경도 최대최소 찾기 */
                maxLongi = Math.max(maxLongi, lastlon);
                minLongi = Math.max(minLongi, lastlon);

                /* 위도 최대최소 찾기 */
                maxLati = Math.max(maxLati, lastlat);
                minLati = Math.max(minLati, lastlat);
            }

            /* LineString(직진경로)일 경우 */
            else if (nodeType == "LineString"){
                /* 직진경로 길이 */
                let lineDistance = obj["features"][idx]["properties"]["distance"]
                if(lineDistance > 200){     /* 100미터가 넘을 경우 100미터++ 단위로 분할 */
                    unit = parseInt(obj["features"][idx]["geometry"]["coordinates"].length / parseInt(lineDistance / 100));
                    
                    if (unit * parseInt(lineDistance / 100) < obj["features"][idx]["geometry"]["coordinates"].length){
                        unit += 1;
                    }

                    let standard = lineDistance / parseInt(lineDistance / 100)
                    if(obj["features"][idx]["geometry"]["coordinates"].length <= unit){
                        for(let idx2 = 0 ; idx2 < obj["features"][idx]["geometry"]["coordinates"].length; idx2++){
                            acc += standard;
                            node.push([
                                nodeCount,
                                obj["features"][idx]["geometry"]["coordinates"][idx2][0], 
                                obj["features"][idx]["geometry"]["coordinates"][idx2][1],
                                Math.ceil(standard),
                                Math.ceil(acc)
                            ]);
                            nodeCount += 1;
                        }
                    }
                    else{
                        for(let idx2 = 0 ; idx2 < obj["features"][idx]["geometry"]["coordinates"].length; idx2 += unit){
                            acc += standard;
                            node.push([
                                nodeCount,
                                obj["features"][idx]["geometry"]["coordinates"][idx2][0], 
                                obj["features"][idx]["geometry"]["coordinates"][idx2][1],
                                Math.ceil(standard),
                                Math.ceil(acc)
                            ]);
                            nodeCount += 1;
                        }
                    }

                }
                else{   /* 100미터 이하일 경우 첫 좌표를 대상으로 함 */
                    acc += lineDistance;
                    node.push([
                        nodeCount,
                        obj["features"][idx]["geometry"]["coordinates"][0][0], 
                        obj["features"][idx]["geometry"]["coordinates"][0][1],
                        Math.ceil(lineDistance),
                        Math.ceil(acc)
                    ])
                    nodeCount += 1;
                }
                
            }
        };
        
        node.push([
            nodeCount,
            dstLongi,
            dstLati,
            0,
            Math.round(acc)
        ])

        /* 유효 노드 리스트를 출발지 노드로 초기화 */
        let validNode = [{
            idx : 0, 
            lo : srcLongi, 
            la : srcLati, 
            di : 0 
        }];

        /* 경유지 기준 노드 찾기 */
        for(let vIdx = 0 ; vIdx < node.length; vIdx++){
            validNode.push({
                idx : vIdx + 1,
                lo  : node[vIdx][1],
                la  : node[vIdx][2],
                di  : node[vIdx][3]
            })
        }   

        return { 
            maxmin : [maxLati, minLati, maxLongi, minLongi], /* 거쳐가는 좌표 중 위도, 경도의 최대 값 */
            totaldis_count : [totalDistance, nodeCount], /* 총 이동 거리, 총 거쳐가는 노드 수 */
            validNode, /* 기준 노드 */
            validNodeList : searchStdNode(node, safeNodeCount, acc)
        };

    }catch(err){
        return { err }; 
    }
}

const getDistance = (lat1, lon1, lat2, lon2) => {
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

    return d;
}

const searchStdNode = (nodeArr, pointCnt, totalDistance) => {
    const std = parseInt(nodeArr.length / (pointCnt - 1));
    let result = [];

    for(let idx = std; idx < nodeArr.length ; idx += std){
        if (result.length == pointCnt - 1){
            break;
        }
        let before = idx - std;
        if ((nodeArr[idx][4] - nodeArr[before][4]) >= (totalDistance / pointCnt)){
            while ((nodeArr[idx][4] - nodeArr[before][4]) > (totalDistance / pointCnt)){
                idx -= 1;
            }
             
        }
        else{
            while ((nodeArr[idx][4] - nodeArr[before][4]) <= (totalDistance / pointCnt)){
                idx += 1;
            }
        }
        result.push(idx)
    }
    return result;
}

