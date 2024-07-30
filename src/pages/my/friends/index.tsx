import { View, Image, Text, Button } from "@tarojs/components";
import { gql } from "@apollo/client";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import { AtMessage } from "taro-ui";
import client from "../../../client";
import "./index.less";

const QUERY_FRIENDS = gql(`query queryFriends($user_id: String!) {
  contacts(where: {user_id: {_eq: $user_id}}) {
    contact_user {
      name
      avatar
      openid
    }
  }
}
`);


const MUTATE_LOCATION=gql(`mutation insertLocation($my_latitude: numeric!, $my_longitude: numeric!, $user_id: String!, $contact_user_id: String!) {
  insert_location_one(object: {my_latitude: $my_latitude, my_longitude: $my_longitude, user_id: $user_id, contact_user_id: $contact_user_id}) {
    id
  }
}
`)
const INSERT_LOCATION=gql(`mutation insertLocations($contact_latitude: numeric!, $contact_longitude: numeric!, $user_id: String!, $contact_user_id: String!) {
  insert_location_one(object: {contact_latitude: $contact_latitude, contact_longitude: $contact_longitude, user_id: $user_id, contact_user_id: $contact_user_id}) {
    id
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
const QUERY_LOCATION=gql(`query queryLocation($user_id: String!, $contact_user_id: String!) {
  location(where: {user_id: {_eq: $user_id}, contact_user_id: {_eq: $contact_user_id}}) {
    id
  }
}
`)
interface contactType {
  avatar: string;
  name: string;
  openid:string
}
const Friends = () => {
  const [contactInfo, setContactInfo] = useState<contactType[]>();
  useEffect(() => {
    const fetchData = async () => {
      if (Taro.getStorageSync("openid")) {
        const res = await client.query({
          query: QUERY_FRIENDS,
          variables: { user_id: Taro.getStorageSync("openid") },
        });
        setContactInfo(res.data.contacts);
      } else {
        Taro.atMessage({
          message: "请先登录",
          type: "warning",
        });
      }
    };
    void fetchData();
  }, []);

  const handleShare =  async (contactId:string) => {
    const user_id=Taro.getStorageSync('openid')
    const response=await client.query({
      query:QUERY_LOCATION,
      variables:{user_id:user_id,contact_user_id:contactId}
    })
    if(response.data.location.length){
      void Taro.getLocation({
        success(res1){
          void client.mutate({
            mutation:UPDATE_LOCATION,
            variables:{user_id:contactId,contact_user_id:user_id,contact_latitude:res1.latitude,contact_longitude:res1.longitude}
          })
        }
      })
    }else{
      void Taro.getLocation({
        success(res){
          void client.mutate({
            mutation:MUTATE_LOCATION,
            variables:{my_latitude:res.latitude,my_longitude:res.longitude,user_id:user_id,contact_user_id:contactId}
          })
          void client.mutate({
            mutation:INSERT_LOCATION,
            variables:{contact_latitude:res.latitude,contact_longitude:res.longitude,user_id:contactId,contact_user_id:user_id}
          })
          Taro.setStorageSync('contactId',contactId)
        }
      })
    }
    void Taro.navigateTo({
      url: "/pages/index/route/index?route=walk"
    });
  };
  return (
    <View class='friends-list'>
      <AtMessage />
      <View class='friend-item'>
        {contactInfo?.map((contact, i) => (
          <View key={i}>
            <Image src={contact.avatar} className='avatar' />
            <Text class='nickname'>{contact.name}</Text>
            <Button onClick={()=>handleShare(contact.contact_user.openid)}>发起共享</Button>
          </View>
        ))}
      </View>
    </View>
  );
};
export default Friends;
