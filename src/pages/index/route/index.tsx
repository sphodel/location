import {
  View,
  Map,
  MovableView,
  MovableArea,
  Button,
} from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { AtModal, AtToast } from "taro-ui";
import { gql } from "@apollo/client";
import "./index.less";
import amapFile from "../../../libs/amap-wx.130";
import client from "../../../client";

const QUERY_CONTACT_LOCATION =
  gql(`query queryContactLocation($user_id: String!, $contact_user_id: String!) {
  location(where: {user_id: {_eq: $user_id}, contact_user_id: {_eq: $contact_user_id}}) {
    contact_longitude
    contact_latitude
  }
}
`);
const UPDATE_LOCATION =
  gql(`mutation updateLocation($user_id: String!, $contact_user_id: String!, $contact_latitude: numeric!, $contact_longitude: numeric!) {
  update_location(where: {user_id: {_eq: $user_id}, contact_user_id: {_eq: $contact_user_id}}, _set: {contact_latitude: $contact_latitude, contact_longitude: $contact_longitude}) {
    returning {
      id
    }
  }
}
`);

interface locationType {
  longitude: number;
  latitude: number;
}
const Route = () => {
  const [polyLine, setPolyLines] = useState([]);
  const [distance, setDistance] = useState("");
  const [myLocation, setMyLocation] = useState<locationType>({
    latitude: 39.90816,
    longitude: 116.434446,
  });
  const [contactLocation, setContactLocation] = useState<locationType>({
    latitude: 38.90816,
    longitude: 116.434446,
  });
  const [, setCurrentRoute] = useState();
  const [current, setCurrent] = useState("");
  const [moveViewHeight, setMoveViewHeight] = useState(160);
  const [isOpen, setIsOpen] = useState(false);

  const [marker, setMarker] = useState([
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
  const Error = () => {
    console.log("error");
  };
  const myAmapFun = new amapFile.AMapWX({
    key: "51fbada27981efc5fdcd12e44e7df51e",
  });
  useEffect(() => {
    const page = Taro.getCurrentPages();
    const currentPage = page[page.length - 1];
    setCurrentRoute(currentPage.options.route);
    const interval = setInterval(() => {
      const user_id = Taro.getStorageSync("openid");
      const contactId = Taro.getStorageSync("contactId");
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
        success(res1) {
          const mapCtx = Taro.createMapContext("navi_map");
          void mapCtx.moveToLocation({
            latitude: res1.latitude,
            longitude: res1.longitude,
          });
          void client.mutate({
            mutation: UPDATE_LOCATION,
            variables: {
              user_id: contactId,
              contact_user_id: user_id,
              contact_longitude: res1.longitude,
              contact_latitude: res1.latitude,
            },
          });
          setMyLocation({ longitude: res1.longitude, latitude: res1.latitude });
        },
      });
      client
        .query({
          query: QUERY_CONTACT_LOCATION,
          variables: { user_id: user_id, contact_user_id: contactId },
          fetchPolicy: "network-only",
        })
        .then((r) => {
          setContactLocation({
            longitude: r.data.location[0].contact_longitude,
            latitude: r.data.location[0].contact_latitude,
          });
        });
      myAmapFun.getWalkingRoute({
        origin: `${myLocation.longitude},${myLocation.latitude}`,
        destination: `${contactLocation.longitude},${contactLocation.latitude}`,
        success: function (data) {
          const points = [];
          const route = [];
          if (data.paths && data.paths[0] && data.paths[0].steps) {
            const steps = data.paths[0].steps;
            setCurrent(steps[0].instruction);
            for (let i = 0; i < steps.length; i++) {
              const poLen = steps[i].polyline.split(";");
              route.push(steps[i].instruction);
              Taro.setStorageSync("route", route);
              for (let j = 0; j < poLen.length; j++) {
                points.push({
                  longitude: parseFloat(poLen[j].split(",")[0]),
                  latitude: parseFloat(poLen[j].split(",")[1]),
                });
              }
            }
          }
          setPolyLines([
            {
              points: points,
              color: "#0091ff",
              width: 6,
            },
          ]);
          if (data.paths[0] && data.paths[0].distance) {
            setDistance(data.paths[0].distance + "米");
          }
        },
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [
    contactLocation.latitude,
    contactLocation.longitude,
    myAmapFun,
    myLocation.latitude,
    myLocation.longitude,
  ]);

  return (
    <View>
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
      <MovableArea className='text_box'>
        <MovableView
          direction='vertical'
          className='text_view'
          inertia
          onChange={(e) =>
            setMoveViewHeight(
              Math.max(100, Math.min(360, moveViewHeight + e.detail.y))
            )
          }
          style={{ height: `${moveViewHeight}px` }}
        >
          {distance == "" ? (
            <AtToast isOpened text='加载中' status='loading'></AtToast>
          ) : (
            <View>
              <View class='text'>{distance}</View>
              <View className='text'>{current}</View>
            </View>
          )}
          <Button
            class='detail_button'
            onClick={() =>
              Taro.navigateTo({
                url: "/pages/index/detail/index",
              })
            }
          >
            详情
          </Button>
          <Button onClick={() => setIsOpen(true)} className='end_button'>
            结束共享
          </Button>
        </MovableView>
      </MovableArea>
      <AtModal
        isOpened={isOpen}
        title='结束共享'
        cancelText='取消'
        confirmText='确认'
        onCancel={() => setIsOpen(false)}
        onConfirm={() => {
          Taro.setStorageSync("ifShare", false);
          Taro.navigateBack({delta:1});
        }}
        content='是否结束共享'
      />
    </View>
  );
};
export default Route;
