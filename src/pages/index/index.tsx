import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { Button, Input, Map, View } from "@tarojs/components";
import { AtIcon, AtModal, AtSearchBar } from "taro-ui";
import { gql } from "@apollo/client";
import "./index.less";
import client from "../../client";

const QUERY_INVITEE = gql(`
  query queryInvitation {
  invitations(where: {status: {_eq: "pending"}}) {
    invitee
    inviter
  }
}
`);
const UPDATE_INVITATION=gql(`mutation updateInvitation($inviter: String!, $invitee: String!) {
  update_invitations(where: {inviter: {_eq: $inviter}, invitee: {_eq: $invitee}}, _set: {status: "success"}) {
    returning {
      id
    }
  }
}
`)
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
  const [showModal, setShowModal] = useState(false);
  const user_id=Taro.getStorageSync('openid')
  void Taro.getLocation({
    success: (data) => {
      setMyLocation({ longitude: data.longitude, latitude: data.latitude });
    },
  });

  const Error = () => {
    console.log("error");
  };
  const Move = () => {
    const mapCtx = Taro.createMapContext("myMap");
    void mapCtx.moveToLocation({
      latitude: myLocation.latitude,
      longitude: myLocation.longitude,
    });
  };
  const handleCancel = () => {
    setShowModal(false);
  };
  const handleConfirm=()=>{
    const contactId=Taro.getStorageSync('contactId')
    void client.mutate({
      mutation:UPDATE_INVITATION,
      variables:{inviter:contactId,invitee:user_id}
    }).then(()=>{
      void Taro.navigateTo({
        url:'/pages/index/route/index?route=walk'
      })
    })
  }
  useEffect(() => {
    const fetchData=async ()=>{
      await client.query({
        query:QUERY_INVITEE,
        fetchPolicy: 'network-only'
      }).then((res)=>{
        if(res.data.invitations.length){
          Taro.setStorageSync('contactId',res.data.invitations[0].inviter)
          if(res.data.invitations[0].invitee==user_id){
            setShowModal(true)
          }
        }
      })
    }
    void fetchData()
  }, [user_id]);
  return (
    <View className='homeDom'>
      <AtModal
        isOpened={showModal}
        onCancel={handleCancel}
        title='对方发起了共享'
        cancelText='取消'
        confirmText='确认'
        onConfirm={handleConfirm}
      />
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
              onClick={() =>
                Taro.navigateTo({ url: "/pages/my/friends/index" })
              }
            >
              共享
            </Button>
            <Button onClick={Move}>
              <AtIcon value='reload'></AtIcon>
            </Button>
          </View>
        </View>
        <View style={{width:"90%",margin:"auto",pointerEvents:"all"}}
          onClick={() => Taro.navigateTo({ url: "/pages/index/search/index" })}
        >
          <AtSearchBar />
        </View>
      </View>
    </View>
  );
}
