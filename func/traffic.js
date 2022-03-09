exports.trafficSearch = (data) => {
    try{
        node = {
            total : 0,
            trafficData : []
        }
        for (let idx in data["features"]){
            if (data["features"][idx]["properties"]["congestion"] >= 2){
                node["trafficData"].push({
                    //name : data["features"][idx]["properties"]["description"],
                    congestion : data["features"][idx]["properties"]["congestion"],
                    coor : data["features"][idx]["geometry"]["coordinates"]
                })
            }
        }
        node['total'] = node['trafficData'].length
        return node
    }
    catch(err){
        return err.toString()
    }
}