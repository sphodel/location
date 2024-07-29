import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { Button, Input, Map, View } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import "./index.less";

interface locationType {
  longitude: number;
  latitude: number;
}
export default function Index() {
  const [myLocation, setMyLocation] = useState<locationType>({
    latitude: 23.12908,
    longitude: 113.26436,
  });
  const [scale, setScale] = useState(16);
  Taro.startLocationUpdate({
    success: () => {
      Taro.onLocationChange((data) => {
        const currentTime = new Date().getTime();
        const oldLocation = Taro.getStorageSync("oldLocation");
        const oldTime = Taro.getStorageSync("oldTime");
        const newLocation = data.latitude + "" + data.longitude;
        setMyLocation({ longitude: data.longitude, latitude: data.latitude });
        if (oldLocation != newLocation && currentTime - oldTime > 5000) {
          Taro.setStorageSync("oldLocation", newLocation);
          Taro.setStorageSync("oldTime", currentTime);
        }
      });
    },
    fail: (err) => {
      console.log(err);
    },
  });

  const Error = () => {
    console.log("error");
  };
  const Move=()=>{
    const mapCtx=Taro.createMapContext('myMap')
    void mapCtx.moveToLocation({latitude:myLocation.latitude,longitude:myLocation.longitude})
  }
  return (
    <View className='homeDom'>
      <Map
        id='myMap'
        class='mapDom'
        scale={scale}
        showLocation
        showCompass
        latitude={myLocation.latitude}
        longitude={myLocation.longitude}
        onError={Error}
      />
      <View className='searchContainer'>
        <View className='iconDoms'>
          <View className='iconDom'>
            <Button
              style={{ height: "48px", width: "48px" }}
              onClick={() => setScale(() => scale + 1)}
            >
              +
            </Button>
            <Button
              style={{ height: "48px", width: "48px" }}
              onClick={() => setScale(() => scale - 1)}
            >
              -
            </Button>
            <Button
              style={{
                height: "48px",
                width: "48px",
                fontSize: "12px",
                padding: "0",
                paddingTop: "8px",
              }}
              onClick={()=>Taro.navigateTo({url:"/pages/my/friends/index"})}
            >
              共享
            </Button>
            <Button onClick={Move}>
              <AtIcon value='reload'></AtIcon>
            </Button>
          </View>
        </View>
        <View
          className='searchDom'
          onClick={() => Taro.navigateTo({ url: "/pages/index/search/index" })}
        >
          <AtIcon value='search'></AtIcon>
          <Input className='inputDom' placeholder='搜索地点' />
        </View>
      </View>
    </View>
  );
}
