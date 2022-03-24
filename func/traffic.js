exports.tmaptrafficSearch = (data, cong) => {
    try{
        node = {
            total : 0,
            trafficData : []
        }
        for (let idx in data["features"]){
            if (data["features"][idx]["properties"]["congestion"] >= cong){
                let tmp = {
                    congestion : data["features"][idx]["properties"]["congestion"],
                    coor : []
                }
                for(let coo in data["features"][idx]["geometry"]["coordinates"] ){

                    let lon = data["features"][idx]["geometry"]["coordinates"][coo][0]
                    let lat = data["features"][idx]["geometry"]["coordinates"][coo][1]
                    tmp["coor"].push(lon, lat)
                }
                node["trafficData"].push( tmp )
                //name : data["features"][idx]["properties"]["description"],
                // coor : data["features"][idx]["geometry"]["coordinates"]
            }
        }
        node['total'] = node['trafficData'].length
        return node
    }
    catch(err){
        return err.toString()
    }
}