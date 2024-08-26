import { View, Map, Button } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { gql } from "@apollo/client";
import './index.less'
import amapFile from '../../../libs/amap-wx.130'
import client from "../../../client";

const QUERY_CONTACT_LOCATION=gql(`query queryContactLocation($user_id: String!, $contact_user_id: String!) {
  location(where: {user_id: {_eq: $user_id}, contact_user_id: {_eq: $contact_user_id}}) {
    contact_longitude
    contact_latitude
  }
}
`)
const UPDATE_LOCATION=gql(`mutation updateLocation($user_id: String!, $contact_user_id: String!, $contact_latitude: numeric!, $contact_longitude: numeric!) {
  update_location(where: {user_id: {_eq: $user_id}, contact_user_id: {_eq: $contact_user_id}}, _set: {contact_latitude: $contact_latitude, contact_longitude: $contact_longitude}) {
    returning {
      id
    }
  }
}
`)
interface locationType{
  longitude:number
  latitude:number
}
const Route = () => {
  const [polyLine,setPolyLines]=useState([])
  const [distance,setDistance]=useState("")
  const [myLocation,setMyLocation]=useState<locationType>({latitude:39.90816,longitude:116.434446})
  const [contactLocation,setContactLocation]=useState<locationType>({latitude:38.90816,longitude:116.434446})
  const [currentRoute,setCurrentRoute]=useState()
  const [current,setCurrent]=useState("")
  const [marker,setMarker]=useState([{
    id: 0,
    latitude: myLocation.latitude,
    longitude: myLocation.longitude,
    width: 23,
    height: 33
  },{
    id: 1,
    latitude: contactLocation.latitude,
    longitude: contactLocation.longitude,
    width: 24,
    height: 34
  }])
  const navigateToRoute=(routeName:string)=>{
    void Taro.navigateTo({
      url:`/pages/index/route/index?route=${routeName}`
    })
  }
  const Error=()=>{
    console.log("error")
  }
  const myAmapFun=new amapFile.AMapWX({key:'51fbada27981efc5fdcd12e44e7df51e'})
  useEffect(() => {
    const page=Taro.getCurrentPages()
    const currentPage=page[page.length-1]
    setCurrentRoute(currentPage.options.route)
    const interval=setInterval(()=>{
      const user_id=Taro.getStorageSync('openid')
      const contactId=Taro.getStorageSync('contactId')
      setMarker([
        {
          id: 0,
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
          width: 23,
          height: 33,
        },
        {
          id: 1,
          latitude: contactLocation.latitude,
          longitude: contactLocation.longitude,
          width: 24,
          height: 34,
        },
      ]);
      void Taro.getLocation({
        success(res1){
          void client.mutate({
            mutation:UPDATE_LOCATION,
            variables:{user_id:contactId,contact_user_id:user_id,contact_longitude:res1.longitude,contact_latitude:res1.latitude}
          })
          setMyLocation({longitude:res1.longitude,latitude:res1.latitude})
        }
      })
      client.query({
        query: QUERY_CONTACT_LOCATION,
        variables: { user_id: user_id, contact_user_id: contactId },
        fetchPolicy: 'network-only'
      }).then(r =>{
        setContactLocation({longitude:r.data.location[0].contact_longitude,latitude:r.data.location[0].contact_latitude})
      }
        )
      myAmapFun.getDrivingRoute({
        origin: `${myLocation.longitude},${myLocation.latitude}`,
        destination: `${contactLocation.longitude},${contactLocation.latitude}`,
        success: function(data){
          const points = [];
          const route=[]
          if (data.paths && data.paths[0] && data.paths[0].steps) {
            const steps = data.paths[0].steps;
            setCurrent(steps[0].instruction)
            for( let i = 0; i < steps.length; i++) {
              const poLen = steps[i].polyline.split(";");
              route.push(steps[i].instruction)
              Taro.setStorageSync('route',route)
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
          if(data.paths[0] && data.paths[0].distance){
            setDistance(data.paths[0].distance + '米')
          }
        },
      })
    },3000)
    return () => clearInterval(interval);
  }, [contactLocation.latitude, contactLocation.longitude, myAmapFun, myLocation.latitude, myLocation.longitude]);
  return (
    <View>
      <View class='flex-style'>
        <Button className={`flex-item ${currentRoute === 'walk' ? 'active' : ''}`} onClick={()=>navigateToRoute('walk')}>
          步行
        </Button>
        <Button className={`flex-item ${currentRoute === 'car' ? 'active' : ''}`} onClick={()=>navigateToRoute('car')}>
          驾车
        </Button>
        <Button className={`flex-item ${currentRoute === 'bus' ? 'active' : ''}`} onClick={()=>navigateToRoute('bus')}>
          公交
        </Button>
        <Button className={`flex-item ${currentRoute === 'bike' ? 'active' : ''}`} onClick={()=>navigateToRoute('bike')}>
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
          onError={Error}
        />
      </View>
      <View class='text_box'>
        <View class='text'>{distance/1000}公里</View>
        <View>{current}</View>
        <View class='detail_button' onClick={()=>Taro.navigateTo({
          url:"/pages/index/detail/index"
        })}
        >
          详情
        </View>
      </View>
    </View>
  );
};
export default Route
