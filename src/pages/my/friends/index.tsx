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
        console.log(res.data.contacts)
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
  const handleShare = (contactId:string) => {
    void Taro.navigateBack({
      url: "/pages/index/index",
      success: function (res) {
        Taro.setStorageSync('contactId',contactId)
      },
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
            <Button onClick={()=>handleShare(contact.openid)}>发起共享</Button>
          </View>
        ))}
      </View>
    </View>
  );
};
export default Friends;
