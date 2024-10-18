import { Button, View ,Text} from "@tarojs/components";
import { AtSearchBar } from "taro-ui";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { useDispatch } from 'react-redux'
import "./index.less";
import amapFile from '../../../libs/amap-wx.130'

interface locationType {
  longitude: number;
  latitude: number;
}
interface contentType{
  name:string
  longitude:number
  latitude:number
  location:string
}
const Search = () => {
  const [search, setSearch] = useState("");
  const [myLocation, setMyLocation] = useState<locationType>({
    latitude: 23.12908,
    longitude: 113.26436,
  });
  const [logs,setLogs]=useState<string[]>(Taro.getStorageSync('logs')||[])
  const [searchResults,setSearchResults]=useState<contentType[]>([])
  const dispatch = useDispatch();
  const myAmapFun=new amapFile.AMapWX({key:'51fbada27981efc5fdcd12e44e7df51e'})
  useEffect(() => {
    void Taro.getLocation({
      success: (data) => {
        setMyLocation({ longitude: data.longitude, latitude: data.latitude });
      },
    })
  }, []);
  const handleSearch=(keyword:string)=>{
    myAmapFun.getInputtips({
      keywords: keyword,
      location: `${myLocation.longitude},${myLocation.latitude}`, // 当前地图的经纬度作为参考
      success(data) {
        data.tips.map((tip)=>{
          if(tip.location.length){
            setSearchResults((prev) => [
              ...prev,
              {
                name: tip.name,
                longitude: parseFloat(tip.location.split(',')[0]),
                latitude: parseFloat(tip.location.split(',')[1]),
                location: tip.address,
              }
            ]);
          }
        })

      },
    });
    if(!logs.includes(keyword)){
      setLogs((prev)=>[...prev,search])
    }

    void Taro.navigateTo({url:"/pages/index/search/searchContent/index"})
  }
  useEffect(() => {
    dispatch({
      type: 'SET_SEARCH_INFO',
      payload: {
        searchResults
      },
    });
  }, [dispatch, searchResults]);
  useEffect(() => {
    Taro.setStorageSync('logs',logs)
  }, [logs]);
  return (
    <View>
      <View className='searchDom'>
        <AtSearchBar
          showActionButton
          value={search}
          onChange={(e) => {
            setSearch(e);
          }}
          onActionClick={() => handleSearch(search)}
        />
      </View>
      <View
        style={{ marginTop: "20px", display: "flex", flexDirection: "column" }}
      >
        <Text
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}
        >
          搜索记录
        </Text>

        {logs.length > 0 ? (
          logs.map((log, index) => (
            <View
              key={index}
              onClick={() => handleSearch(log)}
              style={{
                padding: "10px",
                backgroundColor: "#f5f5f5",
                marginBottom: "10px",
                borderRadius: "5px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: "16px", color: "#333" }}>{log}</Text>
              <Text style={{ fontSize: "12px", color: "#888" }}>点击搜索</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#999" }}>暂无搜索记录</Text>
        )}

        {logs.length > 0 && (
          <Button
            style={{
              marginTop: "15px",
              backgroundColor: "#f44336",
              color: "#fff",
              borderRadius: "5px",
              padding: "10px 15px",
              fontSize: "14px",
            }}
            onClick={() => {
              setLogs([]);
            }}
          >
            清空搜索记录
          </Button>
        )}
      </View>
    </View>
  );
};
export default Search;
