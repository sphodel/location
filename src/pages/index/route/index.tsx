import { View, Map, Button } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import './index.less'
import amapFile from '../../../libs/amap-wx.130'

const Route = () => {
  const [polyLine,setPolyLines]=useState([])
  const [marker,setMarker]=useState([{
    id: 0,
    latitude: 39.989643,
    longitude: 116.481028,
    width: 23,
    height: 33
  },{
    id: 0,
    latitude: 39.90816,
    longitude: 116.434446,
    width: 24,
    height: 34
  }])
  const navigateToRoute=(routeName:string)=>{
    void Taro.navigateTo({
      url:`/pages/index/route/index?route=${routeName}`
    })
  }
  useEffect(() => {
    const myAmapFun=new amapFile.AMapWX({key:'51fbada27981efc5fdcd12e44e7df51e'})
    myAmapFun.getDrivingRoute({
      origin: '116.481028,39.989643',
      destination: '116.434446,39.90816',
      success: function(data){
        const points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          const steps = data.paths[0].steps;
          for( let i = 0; i < steps.length; i++) {
            const poLen = steps[i].polyline.split(";");
            for (let j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(",")[0]),
                latitude: parseFloat(poLen[j].split(",")[1]),
              });
            }
          }
        }
       setPolyLines([{
          points: points,
          color: "#0091ff",
          width: 6
        }])
      },
      fail: function(info){

      }
    })
  }, []);
  return (
    <View>
      <View class='flex-style'>
        <Button class='flex-item active' onClick={()=>navigateToRoute('car')}>
          驾车
        </Button>
        <Button class='flex-item' onClick={()=>navigateToRoute('walk')}>
          步行
        </Button>
        <Button class='flex-item' onClick={()=>navigateToRoute('bus')}>
          公交
        </Button>
        <Button class='flex-item' onClick={()=>navigateToRoute('bike')}>
          骑行
        </Button>
      </View>
      <View class='map_box'>
        <Map
          id='navi_map'
          longitude='116.451028'
          latitude='39.949643'
          scale='12'
          markers={marker}
          polyline={polyLine}
          showCompass
          showLocation
        />
      </View>

      <View class='text_box'>
        <View class='text'>distance</View>
        <View class='text'>cost</View>
        <View class='detail_button' bindtouchstart='goDetail'>
          详情
        </View>
      </View>
    </View>
  );
};
export default Route
